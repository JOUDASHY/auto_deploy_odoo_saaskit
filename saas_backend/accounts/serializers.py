from django.contrib.auth.models import User
from rest_framework import serializers

from accounts.models import Client


class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "email", "is_staff", "is_active", "date_joined", "role"]

    def get_role(self, obj):
        if obj.is_staff:
            return "ADMIN"
        if hasattr(obj, "client_profile"):
            return "CLIENT"
        return None


class ClientSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Client
        fields = "__all__"

