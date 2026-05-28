from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Asistencia, Justificacion
from .serializers import AsistenciaSerializer, JustificacionSerializer
from matricula.models import Matricula

class AsistenciaViewSet(viewsets.ModelViewSet):
    queryset = Asistencia.objects.all()
    serializer_class = AsistenciaSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Asistencia.objects.none()

        rol = user.rol.nombre_rol if user.rol else None

        if rol == 'SuperAdmin':
            queryset = Asistencia.objects.all()
            institucion_id = self.request.query_params.get('institucion', None)
            if institucion_id:
                queryset = queryset.filter(estudiante__institucion_id=institucion_id)
        elif rol in ['Director', 'Docente']:
            queryset = Asistencia.objects.filter(estudiante__institucion=user.institucion)
        elif rol == 'Apoderado':
            if hasattr(user, 'apoderado_profile'):
                student_ids = user.apoderado_profile.estudiantes.values_list('id', flat=True)
                queryset = Asistencia.objects.filter(estudiante_id__in=student_ids)
            else:
                queryset = Asistencia.objects.none()
        else:
            queryset = Asistencia.objects.none()

        fecha = self.request.query_params.get('fecha', None)
        estudiante = self.request.query_params.get('estudiante', None)
        if fecha:
            queryset = queryset.filter(fecha=fecha)
        if estudiante:
            queryset = queryset.filter(estudiante_id=estudiante)
        return queryset.select_related('estudiante', 'justificacion')

    @action(detail=False, methods=['get'], url_path='reporte')
    def reporte(self, request):
        user = request.user
        grado_id = request.query_params.get('grado', None)
        fecha = request.query_params.get('fecha', None)

        if not fecha:
            return Response({"error": "La fecha es requerida"}, status=status.HTTP_400_BAD_REQUEST)

        # Get all students matriculated in this grade
        matriculas = Matricula.objects.all()
        if user.is_authenticated and user.rol and user.rol.nombre_rol in ['Director', 'Docente']:
            matriculas = matriculas.filter(estudiante__institucion=user.institucion)

        if grado_id:
            matriculas = matriculas.filter(grado_id=grado_id)
        
        student_ids = matriculas.values_list('estudiante_id', flat=True)
        asistencias = Asistencia.objects.filter(fecha=fecha, estudiante_id__in=student_ids)

        total = len(student_ids)
        presentes = asistencias.filter(estado='P').count()
        tardanzas = asistencias.filter(estado='T').count()
        faltas_justificadas = asistencias.filter(estado='FJ').count()
        faltas_injustificadas = asistencias.filter(estado='F').count()
        no_registrados = total - asistencias.count()

        data = {
            "total_estudiantes": total,
            "presentes": presentes,
            "tardanzas": tardanzas,
            "faltas_justificadas": faltas_justificadas,
            "faltas_injustificadas": faltas_injustificadas,
            "no_registrados": no_registrados,
            "fecha": fecha,
            "grado_id": grado_id
        }

        return Response(data)

class JustificacionViewSet(viewsets.ModelViewSet):
    queryset = Justificacion.objects.all()
    serializer_class = JustificacionSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Justificacion.objects.none()

        rol = user.rol.nombre_rol if user.rol else None

        if rol == 'SuperAdmin':
            queryset = Justificacion.objects.all()
        elif rol in ['Director', 'Docente']:
            queryset = Justificacion.objects.filter(asistencia__estudiante__institucion=user.institucion)
        elif rol == 'Apoderado':
            if hasattr(user, 'apoderado_profile'):
                student_ids = user.apoderado_profile.estudiantes.values_list('id', flat=True)
                queryset = Justificacion.objects.filter(asistencia__estudiante_id__in=student_ids)
            else:
                queryset = Justificacion.objects.none()
        else:
            queryset = Justificacion.objects.none()

        return queryset
