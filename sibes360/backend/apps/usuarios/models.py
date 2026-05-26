from django.db import models
from django.contrib.auth.models import AbstractUser

class Rol(models.Model):
    nombre_rol = models.CharField(max_length=50, unique=True)
    descripcion = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.nombre_rol

class Usuario(AbstractUser):
    institucion = models.ForeignKey(
        'instituciones.InstitucionEducativa',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='usuarios'
    )
    rol = models.ForeignKey(
        Rol,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='usuarios'
    )
    estado = models.BooleanField(default=True)
    dni = models.CharField(max_length=8, blank=True, null=True, unique=True, verbose_name="DNI")

    # Use email or username for auth
    def __str__(self):
        return f"{self.username} - {self.rol.nombre_rol if self.rol else 'Sin Rol'}"
