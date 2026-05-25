from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EvaluacionViewSet, NotaViewSet, PromedioViewSet

router = DefaultRouter()
router.register(r'evaluaciones', EvaluacionViewSet, basename='evaluaciones')
router.register(r'notas', NotaViewSet, basename='notas')
router.register(r'promedios', PromedioViewSet, basename='promedios')

urlpatterns = [
    path('', include(router.urls)),
]
