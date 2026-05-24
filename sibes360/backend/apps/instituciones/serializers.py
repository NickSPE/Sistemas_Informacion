from rest_framework import serializers
from .models import InstitucionEducativa

class InstitucionEducativaSerializer(serializers.ModelSerializer):
    class Meta:
        model = InstitucionEducativa
        fields = '__all__'
