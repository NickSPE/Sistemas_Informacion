from django.db import models

class Libreta(models.Model):
    estudiante = models.ForeignKey(
        'estudiantes.Estudiante',
        on_delete=models.CASCADE,
        related_name='libretas'
    )
    periodo = models.ForeignKey(
        'academico.PeriodoAcademico',
        on_delete=models.CASCADE,
        related_name='libretas'
    )
    fecha_emision = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"Libreta {self.estudiante} - {self.periodo}"
