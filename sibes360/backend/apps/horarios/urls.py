from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HorarioViewSet

router = DefaultRouter()
router.register(r'horarios', HorarioViewSet, basename='horarios')

urlpatterns = [
    path('', include(router.urls)),
]
