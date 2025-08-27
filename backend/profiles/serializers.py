from rest_framework import serializers
from .models import Address

class AddressSerializer(serializers.ModelSerializer):
    full_address = serializers.SerializerMethodField()
    
    class Meta:
        model = Address
        fields = ['id', 'user', 'phone', 'address_type', 'street', 'city', 
                 'state', 'zip_code', 'is_default', 'created_at', 'full_address']
    
    def get_full_address(self, obj):
        return obj.get_full_address()