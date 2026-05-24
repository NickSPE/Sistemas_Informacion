from rest_framework import serializers
from .models import Reporte

class ReporteSerializer(serializers.ModelSerializer):
    institucion_nombre = serializers.ReadOnlyField(source='institucion.nombre')
    usuario_nombre = serializers.ReadOnlyField(source='usuario.username')

    class Meta:
        model = Reporte
        fields = ['id', 'institucion', 'institucion_nombre', 'tipo', 'fecha', 'usuario', 'usuario_nombre']
