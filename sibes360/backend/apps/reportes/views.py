from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Reporte
from .serializers import ReporteSerializer
from estudiantes.models import Estudiante
from docentes.models import Docente
from alertas.models import Alerta
from pagos.models import Pension
from asistencia.models import Asistencia
from instituciones.models import InstitucionEducativa
from apoderados.models import Apoderado

class ReporteViewSet(viewsets.ModelViewSet):
    queryset = Reporte.objects.all().order_by('-fecha')
    serializer_class = ReporteSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Reporte.objects.none()

        rol = user.rol.nombre_rol if user.rol else None

        if rol == 'SuperAdmin':
            return Reporte.objects.all().order_by('-fecha')
        elif rol in ['Director', 'Docente']:
            return Reporte.objects.filter(institucion=user.institucion).order_by('-fecha')
        else:
            return Reporte.objects.none()

class DashboardStatsView(APIView):
    def get(self, request):
        try:
            user = request.user
            if not user.is_authenticated:
                return Response({"error": "No autenticado"}, status=status.HTTP_401_UNAUTHORIZED)

            rol = user.rol.nombre_rol if user.rol else None

            # Base querysets
            estudiantes = Estudiante.objects.filter(estado=True)
            docentes = Docente.objects.filter(estado=True)
            instituciones = InstitucionEducativa.objects.filter(estado=True)
            alertas = Alerta.objects.filter(estado='Activa')
            pensiones = Pension.objects.all()
            asistencias = Asistencia.objects.all()

            # Apply filters by role
            if rol == 'SuperAdmin':
                pass
            elif rol in ['Director', 'Docente']:
                estudiantes = estudiantes.filter(institucion=user.institucion)
                docentes = docentes.filter(institucion=user.institucion)
                instituciones = instituciones.filter(id=user.institucion.id)
                alertas = alertas.filter(estudiante__institucion=user.institucion)
                pensiones = pensiones.filter(estudiante__institucion=user.institucion)
                asistencias = asistencias.filter(estudiante__institucion=user.institucion)
            elif rol == 'Apoderado':
                student_ids = Apoderado.objects.filter(correo=user.email).values_list('estudiante_id', flat=True)
                estudiantes = estudiantes.filter(id__in=student_ids)
                docentes = docentes.filter(institucion=user.institucion) if user.institucion else docentes.none()
                instituciones = instituciones.filter(id=user.institucion.id) if user.institucion else instituciones.none()
                alertas = alertas.filter(estudiante_id__in=student_ids)
                pensiones = pensiones.filter(estudiante_id__in=student_ids)
                asistencias = asistencias.filter(estudiante_id__in=student_ids)
            else:
                return Response({"error": "Rol no permitido"}, status=status.HTTP_403_FORBIDDEN)

            # Query aggregates
            total_estudiantes = estudiantes.count()
            total_docentes = docentes.count()
            total_instituciones = instituciones.count()
            alertas_pendientes = alertas.count()
            
            # Financial metrics
            pensiones_total = pensiones.count()
            pensiones_pagadas = pensiones.filter(estado='Pagado').count()
            pensiones_pendientes = pensiones.filter(estado__in=['Pendiente', 'Vencido']).count()
            
            tasa_morosidad = 0.0
            if pensiones_total > 0:
                tasa_morosidad = round((pensiones_pendientes / pensiones_total) * 100, 2)

            # Attendance metrics
            asistencias_total = asistencias.count()
            asistencias_presente = asistencias.filter(estado='P').count()
            tasa_asistencia = 100.0
            if asistencias_total > 0:
                tasa_asistencia = round((asistencias_presente / asistencias_total) * 100, 2)

            data = {
                "total_estudiantes": total_estudiantes,
                "total_docentes": total_docentes,
                "total_instituciones": total_instituciones,
                "alertas_pendientes": alertas_pendientes,
                "pensiones": {
                    "total": pensiones_total,
                    "pagadas": pensiones_pagadas,
                    "pendientes": pensiones_pendientes,
                    "tasa_morosidad": tasa_morosidad
                },
                "asistencia": {
                    "tasa_asistencia": tasa_asistencia
                }
            }
            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
