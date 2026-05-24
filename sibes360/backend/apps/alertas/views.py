from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Alerta
from .serializers import AlertaSerializer
from apoderados.models import Apoderado

class AlertaViewSet(viewsets.ModelViewSet):
    queryset = Alerta.objects.all().order_by('-id')
    serializer_class = AlertaSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Alerta.objects.none()

        rol = user.rol.nombre_rol if user.rol else None

        if rol == 'SuperAdmin':
            return Alerta.objects.all().order_by('-id')
        elif rol in ['Director', 'Docente']:
            return Alerta.objects.filter(estudiante__institucion=user.institucion).order_by('-id')
        elif rol == 'Apoderado':
            student_ids = Apoderado.objects.filter(correo=user.email).values_list('estudiante_id', flat=True)
            return Alerta.objects.filter(estudiante_id__in=student_ids).order_by('-id')
        else:
            return Alerta.objects.none()

    @action(detail=False, methods=['get'], url_path='pendientes')
    def pendientes(self, request):
        user = request.user
        if not user.is_authenticated:
            return Response([])

        rol = user.rol.nombre_rol if user.rol else None
        active_alerts = Alerta.objects.filter(estado='Activa')

        if rol == 'SuperAdmin':
            pass
        elif rol in ['Director', 'Docente']:
            active_alerts = active_alerts.filter(estudiante__institucion=user.institucion)
        elif rol == 'Apoderado':
            student_ids = Apoderado.objects.filter(correo=user.email).values_list('estudiante_id', flat=True)
            active_alerts = active_alerts.filter(estudiante_id__in=student_ids)
        else:
            return Response([])

        serializer = AlertaSerializer(active_alerts, many=True)
        return Response(serializer.data)
