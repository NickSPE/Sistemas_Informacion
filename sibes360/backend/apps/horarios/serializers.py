from rest_framework import serializers
from .models import Horario

class HorarioSerializer(serializers.ModelSerializer):
    docente_nombre = serializers.ReadOnlyField(source='docente.nombres')
    curso_nombre = serializers.ReadOnlyField(source='curso.nombre')
    seccion_nombre = serializers.ReadOnlyField(source='seccion.nombre')

    class Meta:
        model = Horario
        fields = ['id', 'docente', 'docente_nombre', 'curso', 'curso_nombre', 'seccion', 'seccion_nombre', 'dia', 'hora_inicio', 'hora_fin']
