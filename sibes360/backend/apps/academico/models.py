from django.db import models

class NivelEducativo(models.Model):
    institucion = models.ForeignKey(
        'instituciones.InstitucionEducativa',
        on_delete=models.CASCADE,
        related_name='niveles'
    )
    nombre = models.CharField(max_length=100) # e.g. Primaria, Secundaria

    def __str__(self):
        return f"{self.nombre} - {self.institucion.nombre}"

class Grado(models.Model):
    nivel = models.ForeignKey(
        NivelEducativo,
        on_delete=models.CASCADE,
        related_name='grados'
    )
    nombre = models.CharField(max_length=100) # e.g. 1ro, 2do

    def __str__(self):
        return f"{self.nombre} ({self.nivel.nombre})"

class Seccion(models.Model):
    grado = models.ForeignKey(
        Grado,
        on_delete=models.CASCADE,
        related_name='secciones'
    )
    nombre = models.CharField(max_length=10) # e.g. A, B, C

    def __str__(self):
        return f"{self.grado.nombre} {self.nombre}"

class Curso(models.Model):
    institucion = models.ForeignKey(
        'instituciones.InstitucionEducativa',
        on_delete=models.CASCADE,
        related_name='cursos'
    )
    nombre = models.CharField(max_length=150)
    area = models.CharField(max_length=100, blank=True, null=True) # e.g. Matemática, Comunicación

    def __str__(self):
        return self.nombre

class PeriodoAcademico(models.Model):
    institucion = models.ForeignKey(
        'instituciones.InstitucionEducativa',
        on_delete=models.CASCADE,
        related_name='periodos'
    )
    anio = models.IntegerField()
    bimestre = models.CharField(max_length=20) # e.g. I Bimestre, II Bimestre
    estado = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.bimestre} {self.anio} ({self.institucion.nombre})"
