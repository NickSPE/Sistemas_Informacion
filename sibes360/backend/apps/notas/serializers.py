from rest_framework import serializers
from .models import Evaluacion, Nota, Promedio

class EvaluacionSerializer(serializers.ModelSerializer):
    curso_nombre = serializers.ReadOnlyField(source='curso.nombre')
    periodo_nombre = serializers.ReadOnlyField(source='periodo.bimestre')

    class Meta:
        model = Evaluacion
        fields = ['id', 'curso', 'curso_nombre', 'periodo', 'periodo_nombre', 'tipo', 'peso']

class NotaSerializer(serializers.ModelSerializer):
    evaluacion_tipo = serializers.ReadOnlyField(source='evaluacion.tipo')
    evaluacion_peso = serializers.ReadOnlyField(source='evaluacion.peso')
    curso_nombre = serializers.ReadOnlyField(source='evaluacion.curso.nombre')
    estudiante_nombres = serializers.ReadOnlyField(source='estudiante.nombres')
    estudiante_apellidos = serializers.ReadOnlyField(source='estudiante.apellidos')

    class Meta:
        model = Nota
        fields = ['id', 'evaluacion', 'evaluacion_tipo', 'evaluacion_peso', 'curso_nombre', 'estudiante', 'estudiante_nombres', 'estudiante_apellidos', 'calificacion']

class PromedioSerializer(serializers.ModelSerializer):
    estudiante_nombres = serializers.ReadOnlyField(source='estudiante.nombres')
    estudiante_apellidos = serializers.ReadOnlyField(source='estudiante.apellidos')
    curso_nombre = serializers.ReadOnlyField(source='curso.nombre')
    periodo_nombre = serializers.ReadOnlyField(source='periodo.bimestre')

    class Meta:
        model = Promedio
        fields = ['id', 'estudiante', 'estudiante_nombres', 'estudiante_apellidos', 'curso', 'curso_nombre', 'periodo', 'periodo_nombre', 'promedio']
