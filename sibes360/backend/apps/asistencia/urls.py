from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AsistenciaViewSet, JustificacionViewSet

router = DefaultRouter()
router.register(r'asistencia', AsistenciaViewSet, basename='asistencia')
router.register(r'justificaciones', JustificacionViewSet, basename='justificaciones')

urlpatterns = [
    path('', include(router.urls)),
]
