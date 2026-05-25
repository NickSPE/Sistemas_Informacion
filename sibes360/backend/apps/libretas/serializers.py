from rest_framework import serializers
from .models import Libreta

class LibretaSerializer(serializers.ModelSerializer):
    estudiante_nombres = serializers.ReadOnlyField(source='estudiante.nombres')
    estudiante_apellidos = serializers.ReadOnlyField(source='estudiante.apellidos')
    periodo_nombre = serializers.ReadOnlyField(source='periodo.bimestre')

    class Meta:
        model = Libreta
        fields = ['id', 'estudiante', 'estudiante_nombres', 'estudiante_apellidos', 'periodo', 'periodo_nombre', 'fecha_emision']
