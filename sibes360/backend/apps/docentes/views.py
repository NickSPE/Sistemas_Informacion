from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Docente
from .serializers import DocenteSerializer

class DocenteViewSet(viewsets.ModelViewSet):
    queryset = Docente.objects.all()
    serializer_class = DocenteSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Docente.objects.none()

        rol = user.rol.nombre_rol if user.rol else None

        if rol == 'SuperAdmin':
            queryset = Docente.objects.all()
        elif rol in ['Director', 'Docente']:
            queryset = Docente.objects.filter(institucion=user.institucion)
        else:
            queryset = Docente.objects.none()

        institucion_id = self.request.query_params.get('institucion', None)
        if institucion_id:
            queryset = queryset.filter(institucion_id=institucion_id)
        return queryset

    def create(self, request, *args, **kwargs):
        user = request.user
        if not user.is_authenticated:
            return Response({"detail": "No autenticado"}, status=status.HTTP_401_UNAUTHORIZED)

        rol = user.rol.nombre_rol if user.rol else None
        if rol not in ['Director', 'SuperAdmin']:
            return Response({"detail": "No autorizado para crear docentes."}, status=status.HTTP_403_FORBIDDEN)

        data = request.data.copy()
        if rol == 'Director':
            # Force institucion to director's institution
            data['institucion'] = getattr(user, 'institucion').id if getattr(user, 'institucion') else None

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        user = request.user
        if not user.is_authenticated:
            return Response({"detail": "No autenticado"}, status=status.HTTP_401_UNAUTHORIZED)

        rol = user.rol.nombre_rol if user.rol else None

        if rol == 'Apoderado':
            return Response({"detail": "Los apoderados no pueden editar información de docentes."}, status=status.HTTP_403_FORBIDDEN)

        if rol == 'Docente':
            obj = self.get_object()
            full_name = f"{user.first_name} {user.last_name}".strip()
            if obj.nombres != full_name:
                return Response({"detail": "Los docentes solo pueden editar su propio perfil."}, status=status.HTTP_403_FORBIDDEN)

        # Prevent Director from changing institucion to another
        if rol == 'Director' and 'institucion' in request.data:
            inst_id = request.data.get('institucion')
            if str(getattr(user, 'institucion').id) != str(inst_id):
                return Response({"detail": "No autorizado para cambiar la institución del docente."}, status=status.HTTP_403_FORBIDDEN)

        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        user = request.user
        if not user.is_authenticated:
            return Response({"detail": "No autenticado"}, status=status.HTTP_401_UNAUTHORIZED)

        rol = user.rol.nombre_rol if user.rol else None

        if rol == 'Apoderado':
            return Response({"detail": "Los apoderados no pueden editar información de docentes."}, status=status.HTTP_403_FORBIDDEN)

        if rol == 'Docente':
            obj = self.get_object()
            full_name = f"{user.first_name} {user.last_name}".strip()
            if obj.nombres != full_name:
                return Response({"detail": "Los docentes solo pueden editar su propio perfil."}, status=status.HTTP_403_FORBIDDEN)

        # Prevent Director from changing institucion via partial update
        if rol == 'Director' and 'institucion' in request.data:
            inst_id = request.data.get('institucion')
            if str(getattr(user, 'institucion').id) != str(inst_id):
                return Response({"detail": "No autorizado para cambiar la institución del docente."}, status=status.HTTP_403_FORBIDDEN)

        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        user = request.user
        if not user.is_authenticated:
            return Response({"detail": "No autenticado"}, status=status.HTTP_401_UNAUTHORIZED)

        rol = user.rol.nombre_rol if user.rol else None

        if rol in ['Docente', 'Apoderado']:
            return Response({"detail": "Solo Directores o SuperAdmin pueden eliminar docentes."}, status=status.HTTP_403_FORBIDDEN)

        return super().destroy(request, *args, **kwargs)
