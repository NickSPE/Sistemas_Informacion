from django.db import models

class Asistencia(models.Model):
    estudiante = models.ForeignKey(
        'estudiantes.Estudiante',
        on_delete=models.CASCADE,
        related_name='asistencias'
    )
    fecha = models.DateField()
    # P: Presente, F: Falta, FJ: Falta Justificada, T: Tardanza
    estado = models.CharField(max_length=2, default='P')
    observacion = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.estudiante} - {self.fecha} ({self.estado})"

class Justificacion(models.Model):
    asistencia = models.OneToOneField(
        Asistencia,
        on_delete=models.CASCADE,
        related_name='justificacion'
    )
    motivo = models.TextField()
    documento = models.CharField(max_length=255, blank=True, null=True) # File path or URL
    estado = models.CharField(max_length=20, default='Pendiente') # Aprobada, Rechazada, Pendiente

    def __str__(self):
        return f"Justificación para {self.asistencia}"
