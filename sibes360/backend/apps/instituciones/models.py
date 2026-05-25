from django.db import models

class InstitucionEducativa(models.Model):
    nombre = models.CharField(max_length=255)
    ruc = models.CharField(max_length=11, unique=True)
    direccion = models.CharField(max_length=255, blank=True, null=True)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    estado = models.BooleanField(default=True)

    def __str__(self):
        return self.nombre
