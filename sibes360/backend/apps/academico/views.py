from rest_framework import viewsets
from .models import NivelEducativo, Grado, Seccion, Curso, PeriodoAcademico
from .serializers import (
    NivelEducativoSerializer,
    GradoSerializer,
    SeccionSerializer,
    CursoSerializer,
    PeriodoAcademicoSerializer
)

def get_docente_profile(user):
    from docentes.models import Docente
    if not user or not user.is_authenticated or not user.rol or user.rol.nombre_rol != 'Docente':
        return None
    docente_profile = None
    if getattr(user, 'dni', None):
        docente_profile = Docente.objects.filter(institucion=user.institucion, dni=user.dni).first()
    if not docente_profile:
        full_name = f"{user.first_name} {user.last_name}".strip()
        docente_profile = Docente.objects.filter(institucion=user.institucion, nombres=full_name).first()
    return docente_profile

class NivelEducativoViewSet(viewsets.ModelViewSet):
    queryset = NivelEducativo.objects.all()
    serializer_class = NivelEducativoSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return NivelEducativo.objects.none()

        rol = user.rol.nombre_rol if user.rol else None

        if rol == 'SuperAdmin':
            queryset = NivelEducativo.objects.all()
        elif rol in ['Director', 'Docente', 'Apoderado']:
            queryset = NivelEducativo.objects.filter(institucion=user.institucion)
        else:
            queryset = NivelEducativo.objects.none()

        institucion_id = self.request.query_params.get('institucion', None)
        if institucion_id:
            queryset = queryset.filter(institucion_id=institucion_id)
        return queryset

class GradoViewSet(viewsets.ModelViewSet):
    queryset = Grado.objects.all()
    serializer_class = GradoSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Grado.objects.none()

        rol = user.rol.nombre_rol if user.rol else None

        if rol == 'SuperAdmin':
            queryset = Grado.objects.all()
        elif rol in ['Director', 'Docente', 'Apoderado']:
            queryset = Grado.objects.filter(nivel__institucion=user.institucion)
        else:
            queryset = Grado.objects.none()

        institucion_id = self.request.query_params.get('institucion', None)
        if institucion_id:
            queryset = queryset.filter(nivel__institucion_id=institucion_id)
        return queryset

class SeccionViewSet(viewsets.ModelViewSet):
    queryset = Seccion.objects.all()
    serializer_class = SeccionSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Seccion.objects.none()

        rol = user.rol.nombre_rol if user.rol else None

        if rol == 'SuperAdmin':
            queryset = Seccion.objects.all()
        elif rol in ['Director', 'Docente', 'Apoderado']:
            queryset = Seccion.objects.filter(grado__nivel__institucion=user.institucion)
        else:
            queryset = Seccion.objects.none()

        institucion_id = self.request.query_params.get('institucion', None)
        if institucion_id:
            queryset = queryset.filter(grado__nivel__institucion_id=institucion_id)
        return queryset

class CursoViewSet(viewsets.ModelViewSet):
    queryset = Curso.objects.all()
    serializer_class = CursoSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Curso.objects.none()

        rol = user.rol.nombre_rol if user.rol else None

        if rol == 'SuperAdmin':
            queryset = Curso.objects.all()
        elif rol == 'Director' or rol == 'Apoderado':
            queryset = Curso.objects.filter(institucion=user.institucion)
        elif rol == 'Docente':
            from horarios.models import Horario
            docente_profile = get_docente_profile(user)
            if docente_profile:
                cursos_ids = Horario.objects.filter(docente=docente_profile).values_list('curso_id', flat=True)
                queryset = Curso.objects.filter(id__in=cursos_ids)
            else:
                queryset = Curso.objects.none()
        else:
            queryset = Curso.objects.none()

        institucion_id = self.request.query_params.get('institucion', None)
        if institucion_id:
            queryset = queryset.filter(institucion_id=institucion_id)
        return queryset

class PeriodoAcademicoViewSet(viewsets.ModelViewSet):
    queryset = PeriodoAcademico.objects.all()
    serializer_class = PeriodoAcademicoSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return PeriodoAcademico.objects.none()

        rol = user.rol.nombre_rol if user.rol else None

        if rol == 'SuperAdmin':
            queryset = PeriodoAcademico.objects.all()
        elif rol in ['Director', 'Docente', 'Apoderado']:
            queryset = PeriodoAcademico.objects.filter(institucion=user.institucion)
        else:
            queryset = PeriodoAcademico.objects.none()

        institucion_id = self.request.query_params.get('institucion', None)
        if institucion_id:
            queryset = queryset.filter(institucion_id=institucion_id)
        return queryset
