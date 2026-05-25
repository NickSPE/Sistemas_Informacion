from django.db import models

class Comunicado(models.Model):
    institucion = models.ForeignKey(
        'instituciones.InstitucionEducativa',
        on_delete=models.CASCADE,
        related_name='comunicados'
    )
    titulo = models.CharField(max_length=200)
    mensaje = models.TextField()
    fecha = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.titulo} - {self.institucion.nombre}"

class Citacion(models.Model):
    estudiante = models.ForeignKey(
        'estudiantes.Estudiante',
        on_delete=models.CASCADE,
        related_name='citaciones'
    )
    apoderado = models.ForeignKey(
        'apoderados.Apoderado',
        on_delete=models.CASCADE,
        related_name='citaciones'
    )
    fecha = models.DateTimeField()
    motivo = models.TextField()
    # P: Pendiente, A: Asistió, F: Faltó
    asistencia = models.CharField(max_length=2, default='P')

    def __str__(self):
        return f"Citación para {self.apoderado.nombres} ({self.fecha})"
