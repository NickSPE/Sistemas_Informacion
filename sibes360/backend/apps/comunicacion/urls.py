from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ComunicadoViewSet, CitacionViewSet

router = DefaultRouter()
router.register(r'comunicados', ComunicadoViewSet, basename='comunicados')
router.register(r'citaciones', CitacionViewSet, basename='citaciones')

urlpatterns = [
    path('', include(router.urls)),
]
