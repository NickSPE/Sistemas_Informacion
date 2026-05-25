from django.db import models

class Horario(models.Model):
    docente = models.ForeignKey(
        'docentes.Docente',
        on_delete=models.CASCADE,
        related_name='horarios'
    )
    curso = models.ForeignKey(
        'academico.Curso',
        on_delete=models.CASCADE,
        related_name='horarios'
    )
    seccion = models.ForeignKey(
        'academico.Seccion',
        on_delete=models.CASCADE,
        related_name='horarios'
    )
    dia = models.CharField(max_length=20) # e.g. Lunes, Martes
    hora_inicio = models.TimeField()
    hora_fin = models.TimeField()

    def __str__(self):
        return f"{self.curso.nombre} - {self.seccion.nombre} ({self.dia} {self.hora_inicio}-{self.hora_fin})"
