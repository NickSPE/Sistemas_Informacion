from rest_framework import serializers
from .models import Conducta

class ConductaSerializer(serializers.ModelSerializer):
    estudiante_nombres = serializers.ReadOnlyField(source='estudiante.nombres')
    estudiante_apellidos = serializers.ReadOnlyField(source='estudiante.apellidos')

    class Meta:
        model = Conducta
        fields = ['id', 'estudiante', 'estudiante_nombres', 'estudiante_apellidos', 'fecha', 'tipo', 'descripcion']
