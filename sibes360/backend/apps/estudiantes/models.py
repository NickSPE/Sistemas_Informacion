from django.db import models

class Estudiante(models.Model):
    institucion = models.ForeignKey(
        'instituciones.InstitucionEducativa',
        on_delete=models.CASCADE,
        related_name='estudiantes'
    )
    dni = models.CharField(max_length=8, unique=True)
    nombres = models.CharField(max_length=100)
    apellidos = models.CharField(max_length=100)
    fecha_nacimiento = models.DateField()
    estado = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.apellidos}, {self.nombres}"
