from rest_framework import serializers
from .models import NivelEducativo, Grado, Seccion, Curso, PeriodoAcademico

class NivelEducativoSerializer(serializers.ModelSerializer):
    class Meta:
        model = NivelEducativo
        fields = '__all__'

class GradoSerializer(serializers.ModelSerializer):
    nivel_nombre = serializers.ReadOnlyField(source='nivel.nombre')

    class Meta:
        model = Grado
        fields = '__all__'

class SeccionSerializer(serializers.ModelSerializer):
    grado_nombre = serializers.ReadOnlyField(source='grado.nombre')

    class Meta:
        model = Seccion
        fields = '__all__'

class CursoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Curso
        fields = '__all__'

class PeriodoAcademicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PeriodoAcademico
        fields = '__all__'
