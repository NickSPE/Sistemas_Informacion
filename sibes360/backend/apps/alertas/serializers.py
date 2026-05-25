from rest_framework import serializers
from .models import Alerta

class AlertaSerializer(serializers.ModelSerializer):
    estudiante_nombres = serializers.ReadOnlyField(source='estudiante.nombres')
    estudiante_apellidos = serializers.ReadOnlyField(source='estudiante.apellidos')

    class Meta:
        model = Alerta
        fields = ['id', 'estudiante', 'estudiante_nombres', 'estudiante_apellidos', 'tipo', 'descripcion', 'estado']
