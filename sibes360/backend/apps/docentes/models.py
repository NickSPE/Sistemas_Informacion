from django.db import models

class Docente(models.Model):
    institucion = models.ForeignKey(
        'instituciones.InstitucionEducativa',
        on_delete=models.CASCADE,
        related_name='docentes'
    )
    dni = models.CharField(max_length=8, unique=True)
    nombres = models.CharField(max_length=200)
    especialidad = models.CharField(max_length=100)
    estado = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.nombres} ({self.especialidad})"
