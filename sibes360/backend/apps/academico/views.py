from rest_framework import viewsets
from .models import NivelEducativo, Grado, Seccion, Curso, PeriodoAcademico
from .serializers import (
    NivelEducativoSerializer,
    GradoSerializer,
    SeccionSerializer,
    CursoSerializer,
    PeriodoAcademicoSerializer
)

class NivelEducativoViewSet(viewsets.ModelViewSet):
    queryset = NivelEducativo.objects.all()
    serializer_class = NivelEducativoSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return NivelEducativo.objects.none()

        rol = user.rol.nombre_rol if user.rol else None

        if rol == 'SuperAdmin':
            return NivelEducativo.objects.all()
        elif rol in ['Director', 'Docente', 'Apoderado']:
            return NivelEducativo.objects.filter(institucion=user.institucion)
        else:
            return NivelEducativo.objects.none()

class GradoViewSet(viewsets.ModelViewSet):
    queryset = Grado.objects.all()
    serializer_class = GradoSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Grado.objects.none()

        rol = user.rol.nombre_rol if user.rol else None

        if rol == 'SuperAdmin':
            return Grado.objects.all()
        elif rol in ['Director', 'Docente', 'Apoderado']:
            return Grado.objects.filter(nivel__institucion=user.institucion)
        else:
            return Grado.objects.none()

class SeccionViewSet(viewsets.ModelViewSet):
    queryset = Seccion.objects.all()
    serializer_class = SeccionSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Seccion.objects.none()

        rol = user.rol.nombre_rol if user.rol else None

        if rol == 'SuperAdmin':
            return Seccion.objects.all()
        elif rol in ['Director', 'Docente', 'Apoderado']:
            return Seccion.objects.filter(grado__nivel__institucion=user.institucion)
        else:
            return Seccion.objects.none()

class CursoViewSet(viewsets.ModelViewSet):
    queryset = Curso.objects.all()
    serializer_class = CursoSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Curso.objects.none()

        rol = user.rol.nombre_rol if user.rol else None

        if rol == 'SuperAdmin':
            return Curso.objects.all()
        elif rol == 'Director' or rol == 'Apoderado':
            return Curso.objects.filter(institucion=user.institucion)
        elif rol == 'Docente':
            from docentes.models import Docente
            from horarios.models import Horario
            full_name = f"{user.first_name} {user.last_name}".strip()
            docente_profile = Docente.objects.filter(institucion=user.institucion, nombres=full_name).first()
            if docente_profile:
                cursos_ids = Horario.objects.filter(docente=docente_profile).values_list('curso_id', flat=True)
                return Curso.objects.filter(id__in=cursos_ids)
            return Curso.objects.none()
        else:
            return Curso.objects.none()

class PeriodoAcademicoViewSet(viewsets.ModelViewSet):
    queryset = PeriodoAcademico.objects.all()
    serializer_class = PeriodoAcademicoSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return PeriodoAcademico.objects.none()

        rol = user.rol.nombre_rol if user.rol else None

        if rol == 'SuperAdmin':
            return PeriodoAcademico.objects.all()
        elif rol in ['Director', 'Docente', 'Apoderado']:
            return PeriodoAcademico.objects.filter(institucion=user.institucion)
        else:
            return PeriodoAcademico.objects.none()
