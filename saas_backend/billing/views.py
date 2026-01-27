from rest_framework import permissions, viewsets

from billing.models import Plan, Subscription, Payment
from billing.serializers import PlanSerializer, SubscriptionSerializer, PaymentSerializer


class PlanViewSet(viewsets.ModelViewSet):
    queryset = Plan.objects.all()
    serializer_class = PlanSerializer

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]


class SubscriptionViewSet(viewsets.ModelViewSet):
    queryset = Subscription.objects.all()
    serializer_class = SubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Subscription.objects.all()
        if hasattr(user, "client_profile"):
            return Subscription.objects.filter(client=user.client_profile)
        return Subscription.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        if not hasattr(user, "client_profile"):
            from rest_framework import exceptions
            raise exceptions.PermissionDenied("User has no Client profile")
        
        # Suspend previous active subscriptions if any (to respect the unique constraint or business logic)
        Subscription.objects.filter(client=user.client_profile, status="ACTIVE").update(status="SUSPENDED")
        
        serializer.save(client=user.client_profile, status="ACTIVE")


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Payment.objects.all()
        if hasattr(user, "client_profile"):
            return Payment.objects.filter(subscription__client=user.client_profile)
        return Payment.objects.none()

