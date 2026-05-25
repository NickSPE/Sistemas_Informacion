from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Conducta
from .serializers import ConductaSerializer
from apoderados.models import Apoderado

class ConductaViewSet(viewsets.ModelViewSet):
    queryset = Conducta.objects.all()
    serializer_class = ConductaSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Conducta.objects.none()

        rol = user.rol.nombre_rol if user.rol else None

        if rol == 'SuperAdmin':
            return Conducta.objects.all()
        elif rol == 'Director':
            return Conducta.objects.filter(estudiante__institucion=user.institucion)
        elif rol == 'Docente':
            from docentes.models import Docente
            from horarios.models import Horario
            from matricula.models import Matricula
            full_name = f"{user.first_name} {user.last_name}".strip()
            docente_profile = Docente.objects.filter(institucion=user.institucion, nombres=full_name).first()
            if docente_profile:
                # Only students in sections taught by teacher
                seccion_ids = Horario.objects.filter(docente=docente_profile).values_list('seccion_id', flat=True)
                student_ids = Matricula.objects.filter(seccion_id__in=seccion_ids).values_list('estudiante_id', flat=True)
                return Conducta.objects.filter(estudiante_id__in=student_ids)
            return Conducta.objects.none()
        elif rol == 'Apoderado':
            if hasattr(user, 'apoderado_profile'):
                student_ids = user.apoderado_profile.estudiantes.values_list('id', flat=True)
                return Conducta.objects.filter(estudiante_id__in=student_ids)
            return Conducta.objects.none()
        else:
            return Conducta.objects.none()

    def create(self, request, *args, **kwargs):
        user = request.user
        if not user.is_authenticated:
            return Response({"detail": "No autorizado"}, status=status.HTTP_401_UNAUTHORIZED)
        rol = user.rol.nombre_rol if user.rol else None
        if rol == 'Apoderado':
            return Response({"detail": "Los apoderados no pueden registrar conducta."}, status=status.HTTP_403_FORBIDDEN)
        if rol == 'Docente':
            from docentes.models import Docente
            from horarios.models import Horario
            from matricula.models import Matricula
            student_id = request.data.get('estudiante')
            full_name = f"{user.first_name} {user.last_name}".strip()
            docente_profile = Docente.objects.filter(institucion=user.institucion, nombres=full_name).first()
            if not docente_profile:
                return Response({"detail": "Perfil de docente no encontrado."}, status=status.HTTP_400_BAD_REQUEST)
            seccion_ids = Horario.objects.filter(docente=docente_profile).values_list('seccion_id', flat=True)
            is_allowed = Matricula.objects.filter(estudiante_id=student_id, seccion_id__in=seccion_ids).exists()
            if not is_allowed:
                return Response({"detail": "Solo puede registrar conducta a alumnos de sus cursos asignados."}, status=status.HTTP_400_BAD_REQUEST)
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        user = request.user
        if not user.is_authenticated:
            return Response({"detail": "No autorizado"}, status=status.HTTP_401_UNAUTHORIZED)
        rol = user.rol.nombre_rol if user.rol else None
        if rol == 'Apoderado':
            return Response({"detail": "Los apoderados no pueden modificar la conducta escolar."}, status=status.HTTP_403_FORBIDDEN)
        if rol == 'Docente':
            from docentes.models import Docente
            from horarios.models import Horario
            from matricula.models import Matricula
            obj = self.get_object()
            full_name = f"{user.first_name} {user.last_name}".strip()
            docente_profile = Docente.objects.filter(institucion=user.institucion, nombres=full_name).first()
            if not docente_profile:
                return Response({"detail": "Perfil de docente no encontrado."}, status=status.HTTP_400_BAD_REQUEST)
            seccion_ids = Horario.objects.filter(docente=docente_profile).values_list('seccion_id', flat=True)
            is_allowed = Matricula.objects.filter(estudiante=obj.estudiante, seccion_id__in=seccion_ids).exists()
            if not is_allowed:
                return Response({"detail": "Solo puede modificar la conducta de alumnos de sus cursos asignados."}, status=status.HTTP_400_BAD_REQUEST)
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        user = request.user
        if not user.is_authenticated:
            return Response({"detail": "No autorizado"}, status=status.HTTP_401_UNAUTHORIZED)
        rol = user.rol.nombre_rol if user.rol else None
        if rol == 'Apoderado':
            return Response({"detail": "Los apoderados no pueden modificar la conducta escolar."}, status=status.HTTP_403_FORBIDDEN)
        if rol == 'Docente':
            from docentes.models import Docente
            from horarios.models import Horario
            from matricula.models import Matricula
            obj = self.get_object()
            full_name = f"{user.first_name} {user.last_name}".strip()
            docente_profile = Docente.objects.filter(institucion=user.institucion, nombres=full_name).first()
            if not docente_profile:
                return Response({"detail": "Perfil de docente no encontrado."}, status=status.HTTP_400_BAD_REQUEST)
            seccion_ids = Horario.objects.filter(docente=docente_profile).values_list('seccion_id', flat=True)
            is_allowed = Matricula.objects.filter(estudiante=obj.estudiante, seccion_id__in=seccion_ids).exists()
            if not is_allowed:
                return Response({"detail": "Solo puede modificar la conducta de alumnos de sus cursos asignados."}, status=status.HTTP_400_BAD_REQUEST)
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        user = request.user
        if not user.is_authenticated:
            return Response({"detail": "No autorizado"}, status=status.HTTP_401_UNAUTHORIZED)
        rol = user.rol.nombre_rol if user.rol else None
        if rol in ['Docente', 'Apoderado']:
            return Response({"detail": "Solo Directores o SuperAdmin pueden eliminar registros de conducta."}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)
