from rest_framework import serializers
from .models import Estudiante

class EstudianteSerializer(serializers.ModelSerializer):
    institucion_nombre = serializers.ReadOnlyField(source='institucion.nombre')

    class Meta:
        model = Estudiante
        fields = ['id', 'institucion', 'institucion_nombre', 'dni', 'nombres', 'apellidos', 'fecha_nacimiento', 'estado']
