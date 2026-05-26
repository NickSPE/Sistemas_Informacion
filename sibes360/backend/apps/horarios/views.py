from rest_framework import viewsets, status
from rest_framework.response import Response
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

        curso_id = self.request.query_params.get('curso', None)
        if curso_id:
            queryset = queryset.filter(curso_id=curso_id)
        return queryset

    def _is_authorized_for_institucion(self, user, horario_obj=None, docente_id=None, curso_id=None):
        # SuperAdmin bypass
        rol = user.rol.nombre_rol if user.rol else None
        if rol == 'SuperAdmin':
            return True

        if rol != 'Director':
            return False

        inst = getattr(user, 'institucion', None)
        try:
            if horario_obj is not None:
                return horario_obj.curso.institucion == inst
            if docente_id is not None:
                from ..docentes.models import Docente
                docente = Docente.objects.filter(id=docente_id).first()
                return docente and docente.institucion == inst
            if curso_id is not None:
                from ..academico.models import Curso
                curso = Curso.objects.filter(id=curso_id).first()
                return curso and curso.institucion == inst
        except Exception:
            return False

        return False

    def create(self, request, *args, **kwargs):
        user = request.user
        if not user.is_authenticated:
            return Response({"detail": "No autenticado"}, status=status.HTTP_401_UNAUTHORIZED)

        rol = user.rol.nombre_rol if user.rol else None
        if rol not in ['Director', 'SuperAdmin']:
            return Response({"detail": "No autorizado"}, status=status.HTTP_403_FORBIDDEN)

        docente_id = request.data.get('docente')
        curso_id = request.data.get('curso')

        if rol == 'Director':
            if not self._is_authorized_for_institucion(user, docente_id=docente_id, curso_id=curso_id):
                return Response({"detail": "No autorizado para asignar horarios fuera de su institución."}, status=status.HTTP_403_FORBIDDEN)

        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        user = request.user
        if not user.is_authenticated:
            return Response({"detail": "No autenticado"}, status=status.HTTP_401_UNAUTHORIZED)

        horario = self.get_object()
        rol = user.rol.nombre_rol if user.rol else None
        if rol == 'Director' and not self._is_authorized_for_institucion(user, horario_obj=horario):
            return Response({"detail": "No autorizado para modificar este horario."}, status=status.HTTP_403_FORBIDDEN)

        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        user = request.user
        if not user.is_authenticated:
            return Response({"detail": "No autenticado"}, status=status.HTTP_401_UNAUTHORIZED)

        horario = self.get_object()
        rol = user.rol.nombre_rol if user.rol else None
        if rol == 'Director' and not self._is_authorized_for_institucion(user, horario_obj=horario):
            return Response({"detail": "No autorizado para eliminar este horario."}, status=status.HTTP_403_FORBIDDEN)

        if rol not in ['Director', 'SuperAdmin']:
            return Response({"detail": "No autorizado"}, status=status.HTTP_403_FORBIDDEN)

        return super().destroy(request, *args, **kwargs)
