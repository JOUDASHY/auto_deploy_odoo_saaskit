import os
import subprocess
import threading
from datetime import datetime

from rest_framework import permissions, viewsets

from instances.models import OdooInstance, DeploymentLog
from instances.serializers import OdooInstanceSerializer, DeploymentLogSerializer


class OdooInstanceViewSet(viewsets.ModelViewSet):
    queryset = OdooInstance.objects.all()
    serializer_class = OdooInstanceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return OdooInstance.objects.all()
        if hasattr(user, "client_profile"):
            return OdooInstance.objects.filter(client=user.client_profile)
        return OdooInstance.objects.none()

    def perform_create(self, serializer):
        user = self.request.user

        if not hasattr(user, "client_profile"):
            raise permissions.exceptions.PermissionDenied("User has no Client profile")

        client = user.client_profile

        # Règles métier: abonnement actif + limites de plan
        subscription = client.subscriptions.filter(status="ACTIVE").first()
        if not subscription:
            raise permissions.exceptions.ParseError("No active subscription found for this client")

        if client.instances.count() >= subscription.plan.max_instances:
            raise permissions.exceptions.ParseError(
                f"Maximum instances limit reached ({subscription.plan.max_instances})"
            )

        last_instance = OdooInstance.objects.order_by("-port").first()
        next_port = 8070 if not last_instance else last_instance.port + 1

        instance_name = serializer.validated_data["name"]
        instance = serializer.save(
            client=client,
            subscription=subscription,
            port=next_port,
            db_name=instance_name,
            container_name=f"odoo_{instance_name}",
            status="CREATED",
        )

        DeploymentLog.objects.create(
            instance=instance,
            user=user,
            action="CREATE",
            status="IN_PROGRESS",
            details={"name": instance_name, "domain": instance.domain, "port": next_port},
        )

        thread = threading.Thread(target=self.deploy_instance, args=(instance,))
        thread.start()

    def deploy_instance(self, instance: OdooInstance):
        start_time = datetime.now()
        log = DeploymentLog.objects.filter(instance=instance, action="CREATE", status="IN_PROGRESS").first()

        try:
            instance.status = "DEPLOYING"
            instance.save()

            script_path = os.path.abspath("../deploy-instance.sh")
            cmd = [script_path, instance.name, instance.domain, str(instance.port)]
            result = subprocess.run(cmd, capture_output=True, text=True)

            duration = (datetime.now() - start_time).total_seconds()

            if result.returncode == 0:
                instance.status = "RUNNING"
                if log:
                    log.status = "SUCCESS"
                    log.duration_seconds = int(duration)
                    log.details.update({"output": result.stdout})
                    log.save()
            else:
                instance.status = "ERROR"
                if log:
                    log.status = "FAILED"
                    log.error_message = result.stderr
                    log.duration_seconds = int(duration)
                    log.save()
        except Exception as e:
            duration = (datetime.now() - start_time).total_seconds()
            instance.status = "ERROR"
            if log:
                log.status = "FAILED"
                log.error_message = str(e)
                log.duration_seconds = int(duration)
                log.save()
        finally:
            instance.save()


class DeploymentLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = DeploymentLog.objects.all()
    serializer_class = DeploymentLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        instance_id = self.request.query_params.get("instance")

        qs = DeploymentLog.objects.all()
        if instance_id:
            qs = qs.filter(instance_id=instance_id)

        if user.is_staff:
            return qs
        if hasattr(user, "client_profile"):
            return qs.filter(instance__client=user.client_profile)
        return DeploymentLog.objects.none()

