from django.db import models

class Conducta(models.Model):
    estudiante = models.ForeignKey(
        'estudiantes.Estudiante',
        on_delete=models.CASCADE,
        related_name='conductas'
    )
    fecha = models.DateField()
    tipo = models.CharField(max_length=50) # e.g. Positiva, Negativa, Leve, Grave
    descripcion = models.TextField()

    def __str__(self):
        return f"{self.estudiante} - {self.tipo} ({self.fecha})"
