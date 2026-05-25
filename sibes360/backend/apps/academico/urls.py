from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    NivelEducativoViewSet,
    GradoViewSet,
    SeccionViewSet,
    CursoViewSet,
    PeriodoAcademicoViewSet
)

router = DefaultRouter()
router.register(r'niveles', NivelEducativoViewSet, basename='niveles')
router.register(r'grados', GradoViewSet, basename='grados')
router.register(r'secciones', SeccionViewSet, basename='secciones')
router.register(r'cursos', CursoViewSet, basename='cursos')
router.register(r'periodos', PeriodoAcademicoViewSet, basename='periodos')

urlpatterns = [
    path('', include(router.urls)),
]
