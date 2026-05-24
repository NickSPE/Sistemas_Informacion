from rest_framework import serializers
from .models import Pago, Pension

class PagoSerializer(serializers.ModelSerializer):
    estudiante_nombres = serializers.ReadOnlyField(source='estudiante.nombres')
    estudiante_apellidos = serializers.ReadOnlyField(source='estudiante.apellidos')

    class Meta:
        model = Pago
        fields = ['id', 'estudiante', 'estudiante_nombres', 'estudiante_apellidos', 'monto', 'fecha', 'concepto', 'comprobante']

class PensionSerializer(serializers.ModelSerializer):
    estudiante_nombres = serializers.ReadOnlyField(source='estudiante.nombres')
    estudiante_apellidos = serializers.ReadOnlyField(source='estudiante.apellidos')

    class Meta:
        model = Pension
        fields = ['id', 'estudiante', 'estudiante_nombres', 'estudiante_apellidos', 'periodo', 'monto', 'estado']
