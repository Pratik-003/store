from rest_framework import serializers
from .models import Product, Category

class CategorySerializer(serializers.ModelSerializer):
    products = serializers.SerializerMethodField()
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'products', 'created_at']
    
    def get_products(self, obj):
        return [
            {"id": product.id, "name": product.name}
            for product in obj.products.all()
        ]

class ProductSerializer(serializers.ModelSerializer):
    # category = CategorySerializer(read_only=True)
    # category_id = serializers.PrimaryKeyRelatedField(
    #     queryset=Category.objects.all(),
    #     source='category',
    #     write_only=True
    # )
    categories = CategorySerializer(many=True, read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(many=True, queryset=Category.objects.all(), source='categories', write_only=True)
    
    image = serializers.ImageField(required=False, allow_null=True)
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'stock_quantity', 
                 'categories', 'category_id', 'image_url', 'image', 'created_at']