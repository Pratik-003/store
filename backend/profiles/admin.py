from django.contrib import admin
from .models import Address

@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ['user', 'address_type', 'city', 'state', 'is_default']
    list_filter = ['address_type', 'is_default', 'city', 'state']
    search_fields = ['user__email', 'city', 'state', 'zip_code']