from django.db import models
from django.contrib.auth.models import User
from django.utils.crypto import get_random_string

class Client(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='client_profile')
    company_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.company_name} ({self.user.username})"

class Plan(models.Model):
    name = models.CharField(max_length=50, unique=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    max_users = models.IntegerField(default=1, help_text="Maximum allowed users in Odoo")
    storage_limit_gb = models.IntegerField(default=10, help_text="Maximum storage in GB")
    allowed_modules = models.JSONField(default=list, help_text="List of Technical Names of allowed modules")
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.name

class Subscription(models.Model):
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('SUSPENDED', 'Suspended'),
        ('EXPIRED', 'Expired'),
    ]

    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='subscriptions')
    plan = models.ForeignKey(Plan, on_delete=models.PROTECT)
    start_date = models.DateField(auto_now_add=True)
    end_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')

    def __str__(self):
        return f"{self.client.company_name} - {self.plan.name} ({self.status})"

class OdooInstance(models.Model):
    STATUS_CHOICES = [
        ('CREATED', 'Created - Pending Deployment'),
        ('RUNNING', 'Running'),
        ('STOPPED', 'Stopped'),
        ('ERROR', 'Error'),
    ]

    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='instances')
    subscription = models.ForeignKey(Subscription, on_delete=models.CASCADE, related_name='instance')
    name = models.CharField(max_length=100, unique=True, help_text="Instance identifier (e.g. client1)")
    
    # Technical details
    db_name = models.CharField(max_length=100)
    db_password = models.CharField(max_length=100, blank=True)
    admin_password = models.CharField(max_length=100, blank=True)
    
    domain = models.CharField(max_length=255, unique=True)
    port = models.IntegerField(unique=True, help_text="Assigned internal port")
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='CREATED')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def save(self, *args, **kwargs):
        if not self.db_password:
             self.db_password = get_random_string(32)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.status})"
