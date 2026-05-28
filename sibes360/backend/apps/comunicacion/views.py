from rest_framework import viewsets
from .models import Comunicado, Citacion
from .serializers import ComunicadoSerializer, CitacionSerializer
from apoderados.models import Apoderado

class ComunicadoViewSet(viewsets.ModelViewSet):
    queryset = Comunicado.objects.all().order_by('-fecha')
    serializer_class = ComunicadoSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Comunicado.objects.none()

        rol = user.rol.nombre_rol if user.rol else None

        if rol == 'SuperAdmin':
            qs = Comunicado.objects.all().order_by('-fecha')
            institucion_id = self.request.query_params.get('institucion', None)
            if institucion_id:
                qs = qs.filter(institucion_id=institucion_id)
            return qs
        elif rol in ['Director', 'Docente', 'Apoderado']:
            return Comunicado.objects.filter(institucion=user.institucion).order_by('-fecha')
        else:
            return Comunicado.objects.none()

class CitacionViewSet(viewsets.ModelViewSet):
    queryset = Citacion.objects.all().order_by('-fecha')
    serializer_class = CitacionSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Citacion.objects.none()

        rol = user.rol.nombre_rol if user.rol else None

        if rol == 'SuperAdmin':
            qs = Citacion.objects.all().order_by('-fecha')
            institucion_id = self.request.query_params.get('institucion', None)
            if institucion_id:
                qs = qs.filter(estudiante__institucion_id=institucion_id)
            return qs
        elif rol in ['Director', 'Docente']:
            return Citacion.objects.filter(estudiante__institucion=user.institucion).order_by('-fecha')
        elif rol == 'Apoderado':
            student_ids = Apoderado.objects.filter(correo=user.email).values_list('estudiante_id', flat=True)
            return Citacion.objects.filter(estudiante_id__in=student_ids).order_by('-fecha')
        else:
            return Citacion.objects.none()
