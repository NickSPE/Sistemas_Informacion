from django.db import models

class Apoderado(models.Model):
    estudiante = models.ForeignKey(
        'estudiantes.Estudiante',
        on_delete=models.CASCADE,
        related_name='apoderados'
    )
    nombres = models.CharField(max_length=200)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    correo = models.EmailField(blank=True, null=True)
    parentesco = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.nombres} ({self.parentesco} de {self.estudiante.nombres})"
