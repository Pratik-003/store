from rest_framework import serializers
from .models import Product, Category

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'created_at']

class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        write_only=True
    )
    
    image = serializers.ImageField(required=False, allow_null=True)
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'stock_quantity', 
                 'category', 'category_id', 'image_url', 'created_at']