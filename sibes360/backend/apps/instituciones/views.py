from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import InstitucionEducativa
from .serializers import InstitucionEducativaSerializer

class InstitucionEducativaViewSet(viewsets.ModelViewSet):
    queryset = InstitucionEducativa.objects.all()
    serializer_class = InstitucionEducativaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return InstitucionEducativa.objects.none()
            
        rol = user.rol.nombre_rol if user.rol else None
        
        if rol == 'SuperAdmin':
            return InstitucionEducativa.objects.all()
        elif user.institucion:
            return InstitucionEducativa.objects.filter(id=user.institucion.id)
        else:
            return InstitucionEducativa.objects.none()

    def check_superadmin_permission(self, request):
        rol = request.user.rol.nombre_rol if request.user.rol else None
        return rol == 'SuperAdmin'

    def create(self, request, *args, **kwargs):
        if not self.check_superadmin_permission(request):
            return Response({"detail": "Solo el Superadministrador puede registrar colegios."}, status=status.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        if not self.check_superadmin_permission(request):
            return Response({"detail": "Solo el Superadministrador puede modificar colegios."}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        if not self.check_superadmin_permission(request):
            return Response({"detail": "Solo el Superadministrador puede modificar colegios."}, status=status.HTTP_403_FORBIDDEN)
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if not self.check_superadmin_permission(request):
            return Response({"detail": "Solo el Superadministrador puede eliminar colegios."}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)

