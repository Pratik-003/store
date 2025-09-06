from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.db.models import Q

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from rest_framework import status

from orders.models import Order, OrderItem, Payment

class AdminPendingOrdersView(APIView):
    permission_classes = [IsAuthenticated]
    serialiser_class = None
    
    def get(self, request):
        """Get all orders pending verification (admin only)"""
        if not request.user.is_admin:
            return Response(
                {'error': 'Admin access required'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        pending_orders = (
            Order.objects.filter(
                 Q(status='processing')
            )
            .select_related('user', 'shipping_address', 'payment')
            .prefetch_related('items')
        )
        
        # Custom serializer or build response manually
        orders_data = []
        for order in pending_orders:
            orders_data.append({
                'order_number': order.order_number,
                'user': {
                    'email': order.user.email,
                    # 'phone': order.user.phone_number,  # Add phone field to your User model
                    'name': order.user.username
                },
                'shipping_address': {
                    'street': order.shipping_address.street,
                    'city': order.shipping_address.city,
                    'state': order.shipping_address.state,
                    'zip_code': order.shipping_address.zip_code,
                    # 'country': order.shipping_address.country,
                    'phone' : order.shipping_address.phone
                } if order.shipping_address else None,
                'payment': {
                    'method': order.payment.get_payment_method_display(),
                    'amount': float(order.payment.amount),
                    'utr_number': order.payment.utr_number,
                    'payment_date': order.payment.payment_date,
                    'transaction_ss': order.payment.transaction_ss.url if order.payment.transaction_ss else None
                },
                'items': [{
                    'product_name': item.product_name,
                    'quantity': item.quantity,
                    'price': float(item.product_price),
                    'total': float(item.total_price)
                } for item in order.items.all()],
                'total_amount': float(order.total_amount),
                'created_at': order.created_at
            })
        
        return Response(orders_data)

class AdminOrderDetailView(APIView):
    permission_classes = [IsAuthenticated]
    serialiser_class = None
    
    def get(self, request, order_number):
        """Get detailed order info for admin"""
        if not request.user.is_admin:
            return Response(
                {'error': 'Admin access required'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        order = get_object_or_404(
            Order.objects.select_related('user', 'shipping_address', 'payment')
                         .prefetch_related('items'),
            order_number=order_number
        )
        
        # COMPLETE implementation (copy from AdminPendingOrdersView and enhance)
        order_data = {
            'order_number': order.order_number,
            'user': {
                'id': order.user.id,
                'email': order.user.email,
                'phone': getattr(order.user, 'phone_number', 'Not provided'),
                'name': order.user.username
            },
            'shipping_address': {
                'id': order.shipping_address.id,
                'street': order.shipping_address.street,
                'city': order.shipping_address.city,
                'state': order.shipping_address.state,
                'zip_code': order.shipping_address.zip_code,
                # 'country': order.shipping_address.country,
                'phone': order.shipping_address.phone
            } if order.shipping_address else None,
            'payment': {
                'id': order.payment.id,
                'method': order.payment.get_payment_method_display(),
                'amount': float(order.payment.amount),
                'status': order.payment.status,
                'utr_number': order.payment.utr_number,
                'payment_date': order.payment.payment_date,
                'transaction_ss': order.payment.transaction_ss.url if order.payment.transaction_ss else None,
                # 'admin_notes': order.payment.admin_notes,
                'created_at': order.payment.created_at
            },
            'items': [{
                'id': item.id,
                'product_id': item.product.id if item.product else None,
                'product_name': item.product_name,
                'product_price': float(item.product_price),
                'product_image': item.product_image,
                'quantity': item.quantity,
                'total_price': float(item.total_price)
            } for item in order.items.all()],
            'total_amount': float(order.total_amount),
            'status': order.status,
            'status_display': order.get_status_display(),
            'created_at': order.created_at,
            'updated_at': order.updated_at,
            'admin_actions': {
                'can_approve': order.status == 'pending_verification',
                'can_cancel': order.status == 'pending_verification',
                'can_update': order.status in ['confirmed', 'processing', 'shipped']
            }
        }
        
        return Response(order_data)

class AdminUpdateOrderStatusView(APIView):
    permission_classes = [IsAuthenticated]
    serialiser_class = None
    
    @transaction.atomic
    def post(self, request, order_number):
        """Approve or reject order (admin only)"""
        if not request.user.is_admin:
            return Response(
                {'error': 'Admin access required'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        order = get_object_or_404(Order, order_number=order_number)
        new_status = request.data.get('status')
        admin_notes = request.data.get('admin_notes', '')
        
        if new_status not in ['confirmed', 'cancelled']:
            return Response(
                {'error': 'Status must be "confirmed" or "cancelled"'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if order.status != 'processing':
            return Response(
                {'error': 'Order is not in pending verification status'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update order status
        order.status = new_status
        order.save()
        
        # Update payment status
        payment = order.payment
        payment.status = 'verified' if new_status == 'confirmed' else 'failed'
        payment.admin_notes = admin_notes
        payment.save()
        
        # Send email notification
        self.send_status_email(order, new_status, admin_notes)
        
        return Response({
            'message': f'Order {new_status} successfully',
            'order_number': order.order_number,
            'new_status': new_status
        })
    
    def send_status_email(self, order, new_status, admin_notes):
        subject = f'Order {order.order_number} {new_status}'
        
        context = {
            'order': order,
            'status': new_status,
            'admin_notes': admin_notes,
            'order_url': f'{settings.FRONTEND_URL}/orders/{order.order_number}'
        }
        
        html_message = render_to_string('emails/order_status_update.html', context)
        plain_message = strip_tags(html_message)
        
        send_mail(
            subject,
            plain_message,
            settings.DEFAULT_FROM_EMAIL,
            [order.user.email],
            html_message=html_message,
            fail_silently=False,
        )

class AdminOrdersByStatusView(APIView):
    permission_classes = [IsAuthenticated]
    serialiser_class = None
    
    def get(self, request):
        """Get orders filtered by status (admin only)"""
        if not request.user.is_admin:
            return Response(
                {'error': 'Admin access required'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        status_filter = request.GET.get('status', '')
        if not status_filter:
            return Response(
                {'error': 'Status parameter is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        valid_statuses = [choice[0] for choice in Order.ORDER_STATUS]
        if status_filter not in valid_statuses:
            return Response(
                {'error': f'Invalid status. Valid options: {valid_statuses}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        orders = Order.objects.filter(
            status=status_filter
        ).select_related('user').order_by('-created_at')[:50]  # Limit to recent 50
        
        orders_data = [{
            'order_number': order.order_number,
            'user_email': order.user.email,
            'total_amount': float(order.total_amount),
            'status': order.status,
            'created_at': order.created_at,
            'updated_at': order.updated_at
        } for order in orders]
        
        return Response(orders_data)