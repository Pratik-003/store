from rest_framework import serializers
from .models import CartItem, Order, OrderItem, Payment
from profiles.models import Address

class CartItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_image = serializers.CharField(source='product.image', read_only=True)
    product_price = serializers.DecimalField(source='product.price', read_only=True, max_digits=10, decimal_places=2)
    total_price = serializers.DecimalField(read_only=True, max_digits=10, decimal_places=2)
    
    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_name', 'product_price', 'quantity', 'total_price','product_image']

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['product_name', 'product_price', 'quantity', 'total_price']

class OrderSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Order
        fields = ['order_number', 'total_amount', 'status', 'status_display', 'created_at']

class OrderDetailSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    shipping_address = serializers.StringRelatedField()
    
    class Meta:
        model = Order
        fields = ['order_number', 'total_amount', 'status', 'status_display', 
                 'created_at', 'updated_at', 'shipping_address', 'items']

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'payment_method', 'amount', 'status', 'created_at']

class CreateOrderSerializer(serializers.Serializer):
    address_id = serializers.IntegerField()
    payment_method = serializers.ChoiceField(choices=['upi', 'bank_transfer'])
    
    def validate_address_id(self, value):
        # Check if address belongs to user
        if not Address.objects.filter(id=value, user=self.context['request'].user).exists():
            raise serializers.ValidationError("Invalid address")
        return value