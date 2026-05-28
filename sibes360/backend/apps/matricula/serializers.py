from rest_framework import serializers
from .models import Matricula

class MatriculaSerializer(serializers.ModelSerializer):
    estudiante_nombres = serializers.ReadOnlyField(source='estudiante.nombres')
    estudiante_apellidos = serializers.ReadOnlyField(source='estudiante.apellidos')
    periodo_nombre = serializers.ReadOnlyField(source='periodo.bimestre')
    periodo_bimestre = serializers.ReadOnlyField(source='periodo.bimestre')
    periodo_anio = serializers.ReadOnlyField(source='periodo.anio')
    grado_nombre = serializers.ReadOnlyField(source='grado.nombre')
    seccion_nombre = serializers.ReadOnlyField(source='seccion.nombre')

    class Meta:
        model = Matricula
        fields = ['id', 'estudiante', 'estudiante_nombres', 'estudiante_apellidos', 'periodo', 'periodo_nombre', 'periodo_bimestre', 'periodo_anio', 'grado', 'grado_nombre', 'seccion', 'seccion_nombre', 'fecha']
