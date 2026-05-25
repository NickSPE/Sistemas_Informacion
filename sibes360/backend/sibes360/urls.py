"""
URL configuration for sibes360 project.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API endpoints for SIBES 360 Core modules
    path('api/', include('instituciones.urls')),
    path('api/', include('usuarios.urls')),
    path('api/', include('estudiantes.urls')),
    path('api/', include('apoderados.urls')),
    path('api/', include('docentes.urls')),
    path('api/', include('matricula.urls')),
    path('api/', include('academico.urls')),
    path('api/', include('horarios.urls')),
    path('api/', include('asistencia.urls')),
    path('api/', include('notas.urls')),
    path('api/', include('libretas.urls')),
    path('api/', include('conducta.urls')),
    path('api/', include('pagos.urls')),
    path('api/', include('comunicacion.urls')),
    path('api/', include('reportes.urls')),
    path('api/', include('alertas.urls')),
]
