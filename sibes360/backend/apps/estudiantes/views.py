from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Estudiante
from .serializers import EstudianteSerializer
from apoderados.models import Apoderado
from matricula.models import Matricula
from horarios.models import Horario
from docentes.models import Docente

class EstudianteViewSet(viewsets.ModelViewSet):
    queryset = Estudiante.objects.all()
    serializer_class = EstudianteSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Estudiante.objects.none()

        rol = user.rol.nombre_rol if user.rol else None

        if rol == 'SuperAdmin':
            queryset = Estudiante.objects.all()
        elif rol in ['Director', 'Docente']:
            queryset = Estudiante.objects.filter(institucion=user.institucion)
        elif rol == 'Apoderado':
            student_ids = Apoderado.objects.filter(correo=user.email).values_list('estudiante_id', flat=True)
            queryset = Estudiante.objects.filter(id__in=student_ids)
        else:
            queryset = Estudiante.objects.none()

        institucion_id = self.request.query_params.get('institucion', None)
        if institucion_id:
            queryset = queryset.filter(institucion_id=institucion_id)
        return queryset

    def check_docente_permission(self, user, student, data=None):
        full_name = f"{user.first_name} {user.last_name}".strip()
        docente_profile = Docente.objects.filter(institucion=user.institucion, nombres=full_name).first()
        if not docente_profile:
            return False, "Perfil de docente no encontrado."

        # Get sections taught by teacher
        teacher_sections = Horario.objects.filter(docente=docente_profile).values_list('seccion_id', flat=True)
        is_student_of_teacher = Matricula.objects.filter(estudiante=student, seccion_id__in=teacher_sections).exists()
        if not is_student_of_teacher:
            return False, "Los docentes solo pueden editar estudiantes de los cursos que enseñan."

        if data:
            if 'nombres' in data and data['nombres'] != student.nombres:
                return False, "Los docentes no pueden modificar los nombres del estudiante. Solo Directores o SuperAdmin."
            if 'apellidos' in data and data['apellidos'] != student.apellidos:
                return False, "Los docentes no pueden modificar los apellidos del estudiante. Solo Directores o SuperAdmin."

        return True, ""

    def update(self, request, *args, **kwargs):
        user = request.user
        if not user.is_authenticated:
            return Response({"detail": "No autenticado"}, status=status.HTTP_401_UNAUTHORIZED)

        rol = user.rol.nombre_rol if user.rol else None

        if rol == 'Apoderado':
            return Response({"detail": "Los apoderados no están autorizados para editar información."}, status=status.HTTP_403_FORBIDDEN)

        if rol == 'Docente':
            student = self.get_object()
            allowed, error_msg = self.check_docente_permission(user, student, request.data)
            if not allowed:
                return Response({"detail": error_msg}, status=status.HTTP_400_BAD_REQUEST)

        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        user = request.user
        if not user.is_authenticated:
            return Response({"detail": "No autenticado"}, status=status.HTTP_401_UNAUTHORIZED)

        rol = user.rol.nombre_rol if user.rol else None

        if rol == 'Apoderado':
            return Response({"detail": "Los apoderados no están autorizados para editar información."}, status=status.HTTP_403_FORBIDDEN)

        if rol == 'Docente':
            student = self.get_object()
            allowed, error_msg = self.check_docente_permission(user, student, request.data)
            if not allowed:
                return Response({"detail": error_msg}, status=status.HTTP_400_BAD_REQUEST)

        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        user = request.user
        if not user.is_authenticated:
            return Response({"detail": "No autenticado"}, status=status.HTTP_401_UNAUTHORIZED)

        rol = user.rol.nombre_rol if user.rol else None

        if rol in ['Docente', 'Apoderado']:
            return Response({"detail": "Solo Directores o SuperAdmin pueden eliminar estudiantes."}, status=status.HTTP_403_FORBIDDEN)

        return super().destroy(request, *args, **kwargs)
