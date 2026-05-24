from django.db import models

class Matricula(models.Model):
    estudiante = models.ForeignKey(
        'estudiantes.Estudiante',
        on_delete=models.CASCADE,
        related_name='matriculas'
    )
    periodo = models.ForeignKey(
        'academico.PeriodoAcademico',
        on_delete=models.CASCADE,
        related_name='matriculas'
    )
    grado = models.ForeignKey(
        'academico.Grado',
        on_delete=models.CASCADE,
        related_name='matriculas'
    )
    seccion = models.ForeignKey(
        'academico.Seccion',
        on_delete=models.CASCADE,
        related_name='matriculas'
    )
    fecha = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"Matrícula de {self.estudiante.nombres} - {self.grado.nombre} {self.seccion.nombre} ({self.periodo.anio})"
