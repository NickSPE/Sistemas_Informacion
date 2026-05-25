from rest_framework import serializers
from .models import Comunicado, Citacion

class ComunicadoSerializer(serializers.ModelSerializer):
    institucion_nombre = serializers.ReadOnlyField(source='institucion.nombre')

    class Meta:
        model = Comunicado
        fields = ['id', 'institucion', 'institucion_nombre', 'titulo', 'mensaje', 'fecha']

class CitacionSerializer(serializers.ModelSerializer):
    estudiante_nombres = serializers.ReadOnlyField(source='estudiante.nombres')
    estudiante_apellidos = serializers.ReadOnlyField(source='estudiante.apellidos')
    apoderado_nombres = serializers.ReadOnlyField(source='apoderado.nombres')

    class Meta:
        model = Citacion
        fields = ['id', 'estudiante', 'estudiante_nombres', 'estudiante_apellidos', 'apoderado', 'apoderado_nombres', 'fecha', 'motivo', 'asistencia']
