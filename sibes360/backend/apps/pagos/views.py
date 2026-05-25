from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Pago, Pension
from .serializers import PagoSerializer, PensionSerializer
from apoderados.models import Apoderado

class PagoViewSet(viewsets.ModelViewSet):
    queryset = Pago.objects.all()
    serializer_class = PagoSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Pago.objects.none()

        rol = user.rol.nombre_rol if user.rol else None

        if rol == 'SuperAdmin':
            return Pago.objects.all()
        elif rol == 'Director':
            return Pago.objects.filter(estudiante__institucion=user.institucion)
        elif rol == 'Apoderado':
            student_ids = Apoderado.objects.filter(correo=user.email).values_list('estudiante_id', flat=True)
            return Pago.objects.filter(estudiante_id__in=student_ids)
        else:
            return Pago.objects.none()

    @action(detail=False, methods=['get'], url_path='morosidad')
    def morosidad(self, request):
        user = request.user
        if not user.is_authenticated:
            return Response([])

        rol = user.rol.nombre_rol if user.rol else None
        deudas = Pension.objects.filter(estado__in=['Pendiente', 'Vencido'])

        if rol == 'SuperAdmin':
            pass
        elif rol == 'Director':
            deudas = deudas.filter(estudiante__institucion=user.institucion)
        elif rol == 'Apoderado':
            student_ids = Apoderado.objects.filter(correo=user.email).values_list('estudiante_id', flat=True)
            deudas = deudas.filter(estudiante_id__in=student_ids)
        else:
            return Response([])

        serializer = PensionSerializer(deudas, many=True)
        return Response(serializer.data)

class PensionViewSet(viewsets.ModelViewSet):
    queryset = Pension.objects.all()
    serializer_class = PensionSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Pension.objects.none()

        rol = user.rol.nombre_rol if user.rol else None

        if rol == 'SuperAdmin':
            return Pension.objects.all()
        elif rol == 'Director':
            return Pension.objects.filter(estudiante__institucion=user.institucion)
        elif rol == 'Apoderado':
            student_ids = Apoderado.objects.filter(correo=user.email).values_list('estudiante_id', flat=True)
            return Pension.objects.filter(estudiante_id__in=student_ids)
        else:
            return Pension.objects.none()
