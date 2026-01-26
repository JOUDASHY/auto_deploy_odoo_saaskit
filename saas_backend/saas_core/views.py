from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Client, Plan, Subscription, OdooInstance
from .serializers import ClientSerializer, PlanSerializer, SubscriptionSerializer, OdooInstanceSerializer
import subprocess
import threading
import os

class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Admin sees all, Client sees only self
        user = self.request.user
        if user.is_staff:
            return Client.objects.all()
        return Client.objects.filter(user=user)

class PlanViewSet(viewsets.ModelViewSet):
    queryset = Plan.objects.all()
    serializer_class = PlanSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class SubscriptionViewSet(viewsets.ModelViewSet):
    queryset = Subscription.objects.all()
    serializer_class = SubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Subscription.objects.all()
        if hasattr(user, 'client_profile'):
            return Subscription.objects.filter(client=user.client_profile)
        return Subscription.objects.none()

class OdooInstanceViewSet(viewsets.ModelViewSet):
    queryset = OdooInstance.objects.all()
    serializer_class = OdooInstanceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return OdooInstance.objects.all()
        if hasattr(user, 'client_profile'):
            return OdooInstance.objects.filter(client=user.client_profile)
        return OdooInstance.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        
        # Security: Ensure user has a Client profile
        if not hasattr(user, 'client_profile'):
            raise permissions.exceptions.PermissionDenied("User has no Client profile")
        
        client = user.client_profile
        
        # Auto-detect active subscription (Naive: take first active one)
        subscription = Subscription.objects.filter(client=client, status='ACTIVE').first()
        if not subscription:
             raise permissions.exceptions.ParseError("No active subscription found for this client")

        # Auto-assign next available port
        last_instance = OdooInstance.objects.order_by('-port').first()
        next_port = 8070 if not last_instance else last_instance.port + 1
        
        instance_name = serializer.validated_data['name']
        
        instance = serializer.save(
            client=client,
            subscription=subscription,
            port=next_port,
            db_name=instance_name,
            status='CREATED'
        )
        
        # Trigger background deployment
        thread = threading.Thread(target=self.deploy_instance, args=(instance,))
        thread.start()

    def deploy_instance(self, instance):
        try:
            # Mark as Running (optimistic, or use a 'DEPLOYING' state if model allowed)
            # Script path
            script_path = os.path.abspath("../deploy-instance.sh")
            
            # Run: ./deploy-instance.sh <name> <domain> <port>
            cmd = [
                script_path,
                instance.name,
                instance.domain,
                str(instance.port)
            ]
            
            print(f"Executing: {' '.join(cmd)}")
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode == 0:
                print("Deployment Success")
                instance.status = 'RUNNING'
            else:
                print(f"Deployment Failed: {result.stderr}")
                instance.status = 'ERROR'
                
        except Exception as e:
            print(f"Exception during deployment: {str(e)}")
            instance.status = 'ERROR'
        finally:
            instance.save()
