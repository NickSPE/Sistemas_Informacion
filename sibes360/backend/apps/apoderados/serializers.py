from rest_framework import serializers
from .models import Apoderado

class ApoderadoSerializer(serializers.ModelSerializer):
    estudiantes_detalle = serializers.SerializerMethodField()

    class Meta:
        model = Apoderado
        fields = ['id', 'estudiantes', 'estudiantes_detalle', 'nombres', 'telefono', 'correo', 'parentesco']

    def get_estudiantes_detalle(self, obj):
        return [{
            'id': e.id, 
            'nombres': e.nombres, 
            'apellidos': e.apellidos, 
            'dni': e.dni, 
            'estado': e.estado
        } for e in obj.estudiantes.all()]
