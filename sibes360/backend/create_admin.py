import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sibes360.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.apps import apps

User = get_user_model()
Rol = apps.get_model('usuarios', 'Rol')

rol_admin, _ = Rol.objects.get_or_create(nombre_rol='SuperAdmin')

try:
    user = User.objects.get(username='admin')
    user.set_password('admin123')
    user.email = 'admin@sibes360.com'
    user.rol = rol_admin
    user.is_superuser = True
    user.is_staff = True
    user.save()
except User.DoesNotExist:
    user = User.objects.create_user(
        username='admin',
        email='admin@sibes360.com',
        password='admin123'
    )
    user.rol = rol_admin
    user.is_superuser = True
    user.is_staff = True
    user.save()

print("CREDENCIALES_CREADAS_EXITOSAMENTE")
