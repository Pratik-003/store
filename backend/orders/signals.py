from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from django.apps import apps

@receiver(post_save, sender='orders.Order')  # Use string reference to avoid import
def send_admin_order_notification(sender, instance, created, **kwargs):
    """Send email to admins when a new order is created"""
    if created:
        User = apps.get_model('adminpanel', 'User')
        
        admin_emails = User.objects.filter(is_admin=True, is_active=True).values_list('email', flat=True)
        
        if not admin_emails:
            return
        
        context = {
            'order_number': instance.order_number,
            'customer_email': instance.user.email,
            'total_amount': instance.total_amount,
            'status_display': instance.get_status_display(),
            'order_date': instance.created_at.strftime('%Y-%m-%d %H:%M'),
            'admin_url': f"{getattr(settings, 'ADMIN_BASE_URL', 'http://localhost:8000/admin')}/orders/order/{instance.id}/",
            'site_name': getattr(settings, 'SITE_NAME', 'Your Store')
        }
        
        html_content = render_to_string('emails/admin_order_notification.html', context)
        text_content = render_to_string('emails/admin_order_notification.txt', context)
        
        subject = f'New Order Received: {instance.order_number}'
        email = EmailMultiAlternatives(
            subject,
            text_content,
            settings.DEFAULT_FROM_EMAIL,
            list(admin_emails)
        )
        email.attach_alternative(html_content, "text/html")
        email.send(fail_silently=False)