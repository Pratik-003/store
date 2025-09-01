from rest_framework import status, serializers
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db import transaction

from .models import Cart, CartItem, Order, OrderItem, Payment
from products.models import Product
from profiles.models import Address
from .serializers import (
    CartItemSerializer, OrderSerializer, 
    OrderDetailSerializer, PaymentSerializer,
    CreateOrderSerializer, DirectPurchaseSerializer
)

class CartDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get user's cart with all items"""
        cart, created = Cart.objects.get_or_create(user=request.user)
        items = cart.items.all()
        serializer = CartItemSerializer(items, many=True)
        
        response_data = {
            'cart_id': cart.id,
            'total_items': cart.total_items,
            'total_price': float(cart.total_price),
            'items': serializer.data
        }
        return Response(response_data)

class AddToCartView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Add product to cart or update quantity"""
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))

        if not product_id:
            return Response(
                {'error': 'Product ID is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        product = get_object_or_404(Product, id=product_id)
        cart, created = Cart.objects.get_or_create(user=request.user)

        # Check if product already in cart
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart, 
            product=product,
            defaults={'quantity': quantity}
        )

        if not created:
            cart_item.quantity += quantity
            cart_item.save()

        serializer = CartItemSerializer(cart_item)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class UpdateCartItemView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, item_id):
        """Update cart item quantity"""
        cart_item = get_object_or_404(
            CartItem, 
            id=item_id, 
            cart__user=request.user
        )
        
        quantity = request.data.get('quantity')
        if quantity is None:
            return Response(
                {'error': 'Quantity is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        quantity = int(quantity)
        if quantity <= 0:
            cart_item.delete()
            return Response(
                {'message': 'Item removed from cart'}, 
                status=status.HTTP_204_NO_CONTENT
            )

        cart_item.quantity = quantity
        cart_item.save()

        serializer = CartItemSerializer(cart_item)
        return Response(serializer.data)

class RemoveCartItemView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, item_id):
        """Remove item from cart"""
        cart_item = get_object_or_404(
            CartItem, 
            id=item_id, 
            cart__user=request.user
        )
        cart_item.delete()
        return Response(
            {'message': 'Item removed from cart'}, 
            status=status.HTTP_204_NO_CONTENT
        )

# ==================== ORDER VIEWS ====================

class OrderListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get all orders for the authenticated user"""
        orders = Order.objects.filter(user=request.user).order_by('-created_at')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

class OrderDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, order_number):
        """Get detailed view of a specific order"""
        order = get_object_or_404(
            Order, 
            order_number=order_number, 
            user=request.user
        )
        serializer = OrderDetailSerializer(order)
        return Response(serializer.data)

class CreateOrderView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        """Create order from cart and initiate payment"""
        serializer = CreateOrderSerializer(data=request.data, context={'request': request})
        
        if not serializer.is_valid():
            return Response(
                serializer.errors, 
                status=status.HTTP_400_BAD_REQUEST
            )

        address_id = serializer.validated_data['address_id']
        payment_method = serializer.validated_data['payment_method']

        # Get user's cart
        cart = get_object_or_404(Cart, user=request.user)
        if cart.items.count() == 0:
            return Response(
                {'error': 'Cart is empty'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get shipping address
        # address = get_object_or_404(
        #     Address, 
        #     id=address_id, 
        #     user=request.user
        # )
        try:
            address = Address.objects.get(id=address_id, user=request.user)
        except Address.DoesNotExist:
            return Response(
                {'error': 'Invalid address or address does not belong to you'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create order
        order = Order.objects.create(
            user=request.user,
            total_amount=cart.total_price,
            shipping_address=address
        )

        # Create order items from cart items
        for cart_item in cart.items.all():
            if cart_item.product.stock_quantity < cart_item.quantity:
                raise serializers.ValidationError(
                    f"Insufficient stock for {cart_item.product.name}. "
                    f"Available: {cart_item.product.stock_quantity}, "
                    f"Requested: {cart_item.quantity}"
                )
            
            # Reduce stock
            cart_item.product.stock_quantity -= cart_item.quantity
            cart_item.product.save()
            OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                product_name=cart_item.product.name,
                product_price=cart_item.product.price,
                product_image=str(cart_item.product.image) if cart_item.product.image else '',
                quantity=cart_item.quantity,
                total_price=cart_item.total_price
            )

        # Create payment record
        payment = Payment.objects.create(
            order=order,
            payment_method=payment_method,
            amount=order.total_amount
        )

        # Clear the cart
        cart.items.all().delete()

        # Return order and payment details
        order_serializer = OrderDetailSerializer(order)
        payment_serializer = PaymentSerializer(payment)
        
        response_data = {
            'order': order_serializer.data,
            'payment': payment_serializer.data
        }
        
        return Response(response_data, status=status.HTTP_201_CREATED)


class DirectPurchaseView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        """Direct purchase without adding to cart"""
        serializer = DirectPurchaseSerializer(data=request.data, context={'request': request})
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Get validated data
        address_id = serializer.validated_data['address_id']
        payment_method = serializer.validated_data['payment_method']
        product_id = serializer.validated_data['product_id']
        quantity = serializer.validated_data['quantity']

        # Validate address
        try:
            address = Address.objects.get(id=address_id, user=request.user)
        except Address.DoesNotExist:
            return Response(
                {'error': 'Invalid address'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get product
        product = get_object_or_404(Product, id=product_id)
        
        # Check stock
        if product.stock_quantity < quantity:
            return Response(
                {'error': f'Insufficient stock for {product.name}. Available: {product.stock_quantity}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create order
        order = Order.objects.create(
            user=request.user,
            total_amount=product.price * quantity,
            shipping_address=address
        )

        # Create order item
        OrderItem.objects.create(
            order=order,
            product=product,
            product_name=product.name,
            product_price=product.price,
            product_image=str(product.image) if product.image else '',
            quantity=quantity,
            total_price=product.price * quantity
        )

        # Reduce stock
        product.stock_quantity -= quantity
        product.save()

        # Create payment
        payment = Payment.objects.create(
            order=order,
            payment_method=payment_method,
            amount=order.total_amount
        )

        # DON'T MODIFY CART AT ALL - user might have other items they want to keep

        # Return response
        order_serializer = OrderDetailSerializer(order)
        payment_serializer = PaymentSerializer(payment)
        
        return Response({
            'order': order_serializer.data,
            'payment': payment_serializer.data
        }, status=status.HTTP_201_CREATED)
# ==================== PAYMENT VIEWS ====================

class PaymentMethodsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get available payment methods"""
        methods = [
            {'value': 'upi', 'label': 'UPI Transfer', 'description': 'Pay using UPI'},
            {'value': 'bank_transfer', 'label': 'Bank Transfer', 'description': 'Direct bank transfer'}
        ]
        return Response(methods)

class VerifyPaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, order_number):
        """Verify payment with screenshot and UTR number"""
        order = get_object_or_404(
            Order, 
            order_number=order_number, 
            user=request.user
        )

        if order.status != 'pending_verification':
            return Response(
                {'error': 'Order is not in pending verification status'},
                status=status.HTTP_400_BAD_REQUEST
            )

        payment = order.payment
        
        # Validate required fields
        utr_number = request.data.get('utr_number')
        payment_date = request.data.get('payment_date')
        
        if not utr_number:
            return Response(
                {'error': 'UTR number is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Update payment details
        payment.utr_number = utr_number
        payment.payment_date = payment_date
        payment.transaction_ss = request.FILES.get('transaction_ss')
        payment.save()

        # Order remains in pending_verification until admin approves
        return Response(
            {'message': 'Payment details submitted. Waiting for admin verification.'},
            status=status.HTTP_200_OK
        )

class OrderStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, order_number):
        """Get current status of an order"""
        order = get_object_or_404(
            Order, 
            order_number=order_number, 
            user=request.user
        )
        return Response({
            'order_number': order.order_number,
            'status': order.status,
            'status_display': order.get_status_display(),
            'last_updated': order.updated_at
        })