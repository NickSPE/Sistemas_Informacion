from rest_framework import viewsets
from .models import Matricula
from .serializers import MatriculaSerializer

class MatriculaViewSet(viewsets.ModelViewSet):
    queryset = Matricula.objects.all()
    serializer_class = MatriculaSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Matricula.objects.none()

        rol = user.rol.nombre_rol if user.rol else None

        if rol == 'SuperAdmin':
            return Matricula.objects.all().select_related('estudiante', 'periodo', 'grado', 'seccion')
        elif rol in ['Director', 'Docente']:
            return Matricula.objects.filter(estudiante__institucion=user.institucion).select_related('estudiante', 'periodo', 'grado', 'seccion')
        else:
            return Matricula.objects.none()
