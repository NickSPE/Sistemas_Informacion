from rest_framework import serializers
from .models import Asistencia, Justificacion

class JustificacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Justificacion
        fields = '__all__'

class AsistenciaSerializer(serializers.ModelSerializer):
    estudiante_nombres = serializers.ReadOnlyField(source='estudiante.nombres')
    estudiante_apellidos = serializers.ReadOnlyField(source='estudiante.apellidos')
    justificacion = JustificacionSerializer(read_only=True, required=False)

    class Meta:
        model = Asistencia
        fields = ['id', 'estudiante', 'estudiante_nombres', 'estudiante_apellidos', 'fecha', 'estado', 'observacion', 'justificacion']
