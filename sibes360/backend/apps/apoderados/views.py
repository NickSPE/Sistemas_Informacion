from rest_framework import viewsets
from .models import Apoderado
from .serializers import ApoderadoSerializer

class ApoderadoViewSet(viewsets.ModelViewSet):
    queryset = Apoderado.objects.all()
    serializer_class = ApoderadoSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Apoderado.objects.none()

        rol = user.rol.nombre_rol if user.rol else None

        if rol == 'SuperAdmin':
            return Apoderado.objects.all()
        elif rol in ['Director', 'Docente']:
            return Apoderado.objects.filter(estudiante__institucion=user.institucion)
        elif rol == 'Apoderado':
            return Apoderado.objects.filter(correo=user.email)
        else:
            return Apoderado.objects.none()
