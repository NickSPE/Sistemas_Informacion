from django.db import models
from django.conf import settings

class Reporte(models.Model):
    institucion = models.ForeignKey(
        'instituciones.InstitucionEducativa',
        on_delete=models.CASCADE,
        related_name='reportes'
    )
    tipo = models.CharField(max_length=100) # e.g. Notas, Asistencia, Financiero
    fecha = models.DateTimeField(auto_now_add=True)
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reportes'
    )

    def __str__(self):
        return f"Reporte {self.tipo} - {self.institucion.nombre} ({self.fecha})"
