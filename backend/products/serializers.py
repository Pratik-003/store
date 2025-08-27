from rest_framework import serializers
from .models import Product, Category
from typing import List, Dict

class SimpleCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']

class CategorySerializer(serializers.ModelSerializer):
    products = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'products', 'created_at']
    
    def get_products(self, obj) -> List[Dict]:
        products = obj.products.all()
        return SimpleProductSerializer(products, many=True).data

class SimpleProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'stock_quantity', 'image_url', 'image','description']

class ProductSerializer(serializers.ModelSerializer):
    categories = SimpleCategorySerializer(many=True, read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=Category.objects.all(), 
        source='categories', 
        write_only=True
    )
    
    image = serializers.ImageField(required=False, allow_null=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'price', 'stock_quantity', 
            'categories', 'category_id', 'image_url', 'image', 'created_at'
        ]