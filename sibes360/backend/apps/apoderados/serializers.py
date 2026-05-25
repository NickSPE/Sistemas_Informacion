from rest_framework import serializers
from .models import Apoderado

class ApoderadoSerializer(serializers.ModelSerializer):
    estudiante_nombre = serializers.ReadOnlyField(source='estudiante.nombres')
    estudiante_apellido = serializers.ReadOnlyField(source='estudiante.apellidos')

    class Meta:
        model = Apoderado
        fields = ['id', 'estudiante', 'estudiante_nombre', 'estudiante_apellido', 'nombres', 'telefono', 'correo', 'parentesco']
