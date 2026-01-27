from rest_framework import serializers

from billing.models import Plan, Subscription, Payment


class PlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plan
        fields = "__all__"


class SubscriptionSerializer(serializers.ModelSerializer):
    plan_name = serializers.CharField(source="plan.name", read_only=True)
    plan_price = serializers.DecimalField(source="plan.price", max_digits=10, decimal_places=2, read_only=True)
    client_company = serializers.CharField(source="client.company_name", read_only=True)

    class Meta:
        model = Subscription
        fields = "__all__"


class PaymentSerializer(serializers.ModelSerializer):
    subscription_plan = serializers.CharField(source="subscription.plan.name", read_only=True)
    client_company = serializers.CharField(source="subscription.client.company_name", read_only=True)

    class Meta:
        model = Payment
        fields = "__all__"
        read_only_fields = ["created_at", "payment_date"]

