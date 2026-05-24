from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Apoderado
from .serializers import ApoderadoSerializer
from django.contrib.auth import get_user_model
from usuarios.models import Rol

User = get_user_model()

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
            return Apoderado.objects.filter(estudiantes__institucion=user.institucion).distinct()
        elif rol == 'Apoderado':
            return Apoderado.objects.filter(usuario=user)
        else:
            return Apoderado.objects.none()

    @action(detail=False, methods=['get'])
    def mi_perfil(self, request):
        if hasattr(request.user, 'apoderado_profile'):
            serializer = self.get_serializer(request.user.apoderado_profile)
            return Response(serializer.data)
        return Response({"detail": "No eres un apoderado."}, status=403)
