from django.db import models

class Alerta(models.Model):
    estudiante = models.ForeignKey(
        'estudiantes.Estudiante',
        on_delete=models.CASCADE,
        related_name='alertas'
    )
    tipo = models.CharField(max_length=100) # e.g. Inasistencia, Baja Calificación, Conducta Grave
    descripcion = models.TextField()
    estado = models.CharField(max_length=20, default='Activa') # Activa, Resuelta

    def __str__(self):
        return f"Alerta {self.tipo} - {self.estudiante} ({self.estado})"
