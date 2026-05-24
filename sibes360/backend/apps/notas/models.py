from django.db import models

class Evaluacion(models.Model):
    curso = models.ForeignKey(
        'academico.Curso',
        on_delete=models.CASCADE,
        related_name='evaluaciones'
    )
    periodo = models.ForeignKey(
        'academico.PeriodoAcademico',
        on_delete=models.CASCADE,
        related_name='evaluaciones'
    )
    tipo = models.CharField(max_length=100) # e.g. Examen Bimestral, Tarea, Proyecto
    peso = models.DecimalField(max_digits=5, decimal_places=2, default=1.00) # e.g. 0.40 (40%)

    def __str__(self):
        return f"{self.tipo} - {self.curso.nombre} ({self.periodo})"

class Nota(models.Model):
    evaluacion = models.ForeignKey(
        Evaluacion,
        on_delete=models.CASCADE,
        related_name='notas'
    )
    estudiante = models.ForeignKey(
        'estudiantes.Estudiante',
        on_delete=models.CASCADE,
        related_name='notas'
    )
    calificacion = models.DecimalField(max_digits=4, decimal_places=2) # 0 to 20 scale

    def __str__(self):
        return f"{self.estudiante} - {self.evaluacion.tipo}: {self.calificacion}"

class Promedio(models.Model):
    estudiante = models.ForeignKey(
        'estudiantes.Estudiante',
        on_delete=models.CASCADE,
        related_name='promedios'
    )
    curso = models.ForeignKey(
        'academico.Curso',
        on_delete=models.CASCADE,
        related_name='promedios'
    )
    periodo = models.ForeignKey(
        'academico.PeriodoAcademico',
        on_delete=models.CASCADE,
        related_name='promedios'
    )
    promedio = models.DecimalField(max_digits=4, decimal_places=2)

    def __str__(self):
        return f"Promedio {self.estudiante} - {self.curso}: {self.promedio}"
