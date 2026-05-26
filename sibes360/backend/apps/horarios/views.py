from rest_framework import viewsets
from .models import Horario
from .serializers import HorarioSerializer

class HorarioViewSet(viewsets.ModelViewSet):
    queryset = Horario.objects.all()
    serializer_class = HorarioSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Horario.objects.none()

        rol = user.rol.nombre_rol if user.rol else None

        if rol == 'SuperAdmin':
            queryset = Horario.objects.all()
        elif rol in ['Director', 'Docente', 'Apoderado']:
            queryset = Horario.objects.filter(curso__institucion=user.institucion)
        else:
            queryset = Horario.objects.none()

        institucion_id = self.request.query_params.get('institucion', None)
        if institucion_id:
            queryset = queryset.filter(curso__institucion_id=institucion_id)

        curso_id = self.request.query_params.get('curso', None)
        if curso_id:
            queryset = queryset.filter(curso_id=curso_id)
        return queryset
