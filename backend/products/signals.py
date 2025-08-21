from django.db.models.signals import pre_save
from django.dispatch import receiver
from PIL import Image
import os
from .models import Product
from io import BytesIO
from django.core.files.base import ContentFile

@receiver(pre_save, sender=Product)
def compress_image(sender, instance, **kwargs):
    """Compress product image before saving."""
    if instance.image:
        try:
            # Open the image
            img = Image.open(instance.image)
            
            # Convert to RGB if necessary
            if img.mode in ('RGBA', 'P'):
                img = img.convert('RGB')
            
            # Resize if too large (max width 1200px)
            if img.width > 1200:
                ratio = 1200 / float(img.width)
                new_height = int(float(img.height) * float(ratio))
                img = img.resize((1200, new_height), Image.Resampling.LANCZOS)
            
            # Save compressed image to memory
            img_io = BytesIO()
            img.save(img_io, format='JPEG', optimize=True, quality=70)
            
            # Generate new filename with .jpg extension
            original_name = os.path.splitext(instance.image.name)[0]
            new_filename = f"{original_name}.jpg"
            
            # Save the compressed image back to the field
            instance.image.save(
                new_filename,
                ContentFile(img_io.getvalue()),
                save=False
            )
            
        except Exception as e:
            # If compression fails, continue with original image
            print(f"Image compression failed: {e}")