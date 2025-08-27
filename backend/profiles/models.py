from django.db import models
from adminpanel.models import User  

class Address(models.Model):
    ADDRESS_TYPES = (
        ('home', 'Home'),
        ('work', 'Work'),
        ('other', 'Other'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    phone = models.CharField(max_length=15, null=False, blank=False)
    address_type = models.CharField(max_length=10, choices=ADDRESS_TYPES, default='home')
    street = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    zip_code = models.CharField(max_length=6)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)      
    
    class Meta:
        verbose_name_plural = "Addresses"
        ordering = ['-is_default', '-created_at'] 
    
    def __str__(self):
        return f"{self.user.email} - {self.address_type} - {self.city}"
    
    def save(self, *args, **kwargs):
        if self.is_default:
            Address.objects.filter(user=self.user, is_default=True).update(is_default=False)
        super().save(*args, **kwargs)
        
    def get_full_address(self):
        return f"{self.street}, {self.city}, {self.state} {self.zip_code}"

    def set_as_default(self):
        self.is_default = True
        self.save()