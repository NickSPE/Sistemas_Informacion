from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import Usuario, Rol
from .serializers import UsuarioSerializer, RolSerializer, CustomTokenObtainPairSerializer

class RolViewSet(viewsets.ModelViewSet):
    queryset = Rol.objects.all()
    serializer_class = RolSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Rol.objects.none()
        return Rol.objects.all()

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Usuario.objects.none()

        rol = user.rol.nombre_rol if user.rol else None

        if rol == 'SuperAdmin':
            return Usuario.objects.all()
        elif rol == 'Director':
            return Usuario.objects.filter(institucion=user.institucion)
        elif rol == 'Docente':
            return Usuario.objects.filter(id=user.id)
        else:
            return Usuario.objects.none()

    def update(self, request, *args, **kwargs):
        user = request.user
        if not user.is_authenticated:
            return Response({"detail": "No autenticado"}, status=status.HTTP_401_UNAUTHORIZED)

        rol = user.rol.nombre_rol if user.rol else None

        if rol == 'Apoderado':
            return Response({"detail": "Los apoderados no pueden editar perfiles de usuario."}, status=status.HTTP_403_FORBIDDEN)

        if rol == 'Docente':
            obj = self.get_object()
            if obj.id != user.id:
                return Response({"detail": "Los docentes solo pueden editar su propio perfil de usuario."}, status=status.HTTP_403_FORBIDDEN)

        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        user = request.user
        if not user.is_authenticated:
            return Response({"detail": "No autenticado"}, status=status.HTTP_401_UNAUTHORIZED)

        rol = user.rol.nombre_rol if user.rol else None

        if rol == 'Apoderado':
            return Response({"detail": "Los apoderados no pueden editar perfiles de usuario."}, status=status.HTTP_403_FORBIDDEN)

        if rol == 'Docente':
            obj = self.get_object()
            if obj.id != user.id:
                return Response({"detail": "Los docentes solo pueden editar su propio perfil de usuario."}, status=status.HTTP_403_FORBIDDEN)

        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        user = request.user
        if not user.is_authenticated:
            return Response({"detail": "No autenticado"}, status=status.HTTP_401_UNAUTHORIZED)

        rol = user.rol.nombre_rol if user.rol else None

        if rol in ['Docente', 'Apoderado']:
            return Response({"detail": "Solo Directores o SuperAdmin pueden eliminar usuarios."}, status=status.HTTP_403_FORBIDDEN)

        return super().destroy(request, *args, **kwargs)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
