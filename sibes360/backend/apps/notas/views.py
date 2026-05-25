from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Evaluacion, Nota, Promedio
from .serializers import EvaluacionSerializer, NotaSerializer, PromedioSerializer
from apoderados.models import Apoderado

class EvaluacionViewSet(viewsets.ModelViewSet):
    queryset = Evaluacion.objects.all()
    serializer_class = EvaluacionSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Evaluacion.objects.none()

        rol = user.rol.nombre_rol if user.rol else None

        if rol == 'SuperAdmin':
            queryset = Evaluacion.objects.all()
        elif rol == 'Director':
            queryset = Evaluacion.objects.filter(curso__institucion=user.institucion)
        elif rol == 'Docente':
            from docentes.models import Docente
            from horarios.models import Horario
            full_name = f"{user.first_name} {user.last_name}".strip()
            docente_profile = Docente.objects.filter(institucion=user.institucion, nombres=full_name).first()
            if docente_profile:
                cursos_ids = Horario.objects.filter(docente=docente_profile).values_list('curso_id', flat=True)
                queryset = Evaluacion.objects.filter(curso__institucion=user.institucion, curso_id__in=cursos_ids)
            else:
                queryset = Evaluacion.objects.none()
        elif rol == 'Apoderado':
            queryset = Evaluacion.objects.filter(curso__institucion=user.institucion)
        else:
            queryset = Evaluacion.objects.none()

        curso_id = self.request.query_params.get('curso', None)
        if curso_id:
            queryset = queryset.filter(curso_id=curso_id)
        return queryset

    def create(self, request, *args, **kwargs):
        user = request.user
        rol = user.rol.nombre_rol if user.rol else None
        if rol == 'Apoderado':
            return Response({"detail": "No autorizado para apoderados."}, status=status.HTTP_403_FORBIDDEN)
        if rol == 'Docente':
            # Verify they teach the course
            from docentes.models import Docente
            from horarios.models import Horario
            curso_id = request.data.get('curso')
            full_name = f"{user.first_name} {user.last_name}".strip()
            docente_profile = Docente.objects.filter(institucion=user.institucion, nombres=full_name).first()
            if not docente_profile or not curso_id:
                return Response({"detail": "Curso o perfil inválido."}, status=status.HTTP_400_BAD_REQUEST)
            teaches = Horario.objects.filter(docente=docente_profile, curso_id=curso_id).exists()
            if not teaches:
                return Response({"detail": "Los docentes solo pueden programar evaluaciones para sus propios cursos."}, status=status.HTTP_400_BAD_REQUEST)
        return super().create(request, *args, **kwargs)

class NotaViewSet(viewsets.ModelViewSet):
    queryset = Nota.objects.all()
    serializer_class = NotaSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Nota.objects.none()

        rol = user.rol.nombre_rol if user.rol else None

        if rol == 'SuperAdmin':
            queryset = Nota.objects.all()
        elif rol == 'Director':
            queryset = Nota.objects.filter(estudiante__institucion=user.institucion)
        elif rol == 'Docente':
            from docentes.models import Docente
            from horarios.models import Horario
            full_name = f"{user.first_name} {user.last_name}".strip()
            docente_profile = Docente.objects.filter(institucion=user.institucion, nombres=full_name).first()
            if docente_profile:
                cursos_ids = Horario.objects.filter(docente=docente_profile).values_list('curso_id', flat=True)
                queryset = Nota.objects.filter(estudiante__institucion=user.institucion, evaluacion__curso_id__in=cursos_ids)
            else:
                queryset = Nota.objects.none()
        elif rol == 'Apoderado':
            if hasattr(user, 'apoderado_profile'):
                student_ids = user.apoderado_profile.estudiantes.values_list('id', flat=True)
                queryset = Nota.objects.filter(estudiante_id__in=student_ids)
            else:
                queryset = Nota.objects.none()
        else:
            queryset = Nota.objects.none()

        curso_id = self.request.query_params.get('curso', None)
        if curso_id:
            queryset = queryset.filter(evaluacion__curso_id=curso_id)
        return queryset

    def create(self, request, *args, **kwargs):
        user = request.user
        rol = user.rol.nombre_rol if user.rol else None
        if rol == 'Apoderado':
            return Response({"detail": "Los apoderados no pueden registrar calificaciones."}, status=status.HTTP_403_FORBIDDEN)
        if rol == 'Docente':
            # Verify they teach the course of the evaluation and the student is in their class
            from docentes.models import Docente
            from horarios.models import Horario
            from matricula.models import Matricula
            eval_id = request.data.get('evaluacion')
            student_id = request.data.get('estudiante')
            evaluacion = Evaluacion.objects.filter(id=eval_id).first()
            if not evaluacion or not student_id:
                return Response({"detail": "Evaluación o estudiante inválido."}, status=status.HTTP_400_BAD_REQUEST)
            full_name = f"{user.first_name} {user.last_name}".strip()
            docente_profile = Docente.objects.filter(institucion=user.institucion, nombres=full_name).first()
            if not docente_profile:
                return Response({"detail": "Perfil de docente no encontrado."}, status=status.HTTP_400_BAD_REQUEST)
            # Must teach the course
            teaches_course = Horario.objects.filter(docente=docente_profile, curso=evaluacion.curso).exists()
            # Student must be taught by this teacher
            secciones_docente = Horario.objects.filter(docente=docente_profile).values_list('seccion_id', flat=True)
            is_student_in_class = Matricula.objects.filter(estudiante_id=student_id, seccion_id__in=secciones_docente).exists()
            if not teaches_course or not is_student_in_class:
                return Response({"detail": "Los docentes solo pueden registrar calificaciones para sus propios alumnos y cursos."}, status=status.HTTP_400_BAD_REQUEST)
        return super().create(request, *args, **kwargs)

    @action(detail=False, methods=['get'], url_path='promedio')
    def promedio(self, request):
        estudiante_id = request.query_params.get('estudiante', None)
        periodo_id = request.query_params.get('periodo', None)

        if not estudiante_id or not periodo_id:
            return Response(
                {"error": "Los parámetros 'estudiante' y 'periodo' son requeridos"},
                status=status.HTTP_400_BAD_REQUEST
            )

        promedios = Promedio.objects.filter(estudiante_id=estudiante_id, periodo_id=periodo_id)
        
        user = request.user
        if user.is_authenticated and user.rol:
            rol = user.rol.nombre_rol
            if rol == 'Director':
                promedios = promedios.filter(estudiante__institucion=user.institucion)
            elif rol == 'Docente':
                from docentes.models import Docente
                from horarios.models import Horario
                full_name = f"{user.first_name} {user.last_name}".strip()
                docente_profile = Docente.objects.filter(institucion=user.institucion, nombres=full_name).first()
                if docente_profile:
                    cursos_ids = Horario.objects.filter(docente=docente_profile).values_list('curso_id', flat=True)
                    promedios = promedios.filter(estudiante__institucion=user.institucion, curso_id__in=cursos_ids)
                else:
                    promedios = promedios.none()
            elif rol == 'Apoderado':
                if hasattr(user, 'apoderado_profile'):
                    student_ids = user.apoderado_profile.estudiantes.values_list('id', flat=True)
                    promedios = promedios.filter(estudiante_id__in=student_ids)
                else:
                    promedios = promedios.none()

        serializer = PromedioSerializer(promedios, many=True)
        return Response(serializer.data)

class PromedioViewSet(viewsets.ModelViewSet):
    queryset = Promedio.objects.all()
    serializer_class = PromedioSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Promedio.objects.none()

        rol = user.rol.nombre_rol if user.rol else None

        if rol == 'SuperAdmin':
            return Promedio.objects.all()
        elif rol == 'Director':
            return Promedio.objects.filter(estudiante__institucion=user.institucion)
        elif rol == 'Docente':
            from docentes.models import Docente
            from horarios.models import Horario
            full_name = f"{user.first_name} {user.last_name}".strip()
            docente_profile = Docente.objects.filter(institucion=user.institucion, nombres=full_name).first()
            if docente_profile:
                cursos_ids = Horario.objects.filter(docente=docente_profile).values_list('curso_id', flat=True)
                return Promedio.objects.filter(estudiante__institucion=user.institucion, curso_id__in=cursos_ids)
            return Promedio.objects.none()
        elif rol == 'Apoderado':
            if hasattr(user, 'apoderado_profile'):
                student_ids = user.apoderado_profile.estudiantes.values_list('id', flat=True)
                return Promedio.objects.filter(estudiante_id__in=student_ids)
            return Promedio.objects.none()
        else:
            return Promedio.objects.none()
