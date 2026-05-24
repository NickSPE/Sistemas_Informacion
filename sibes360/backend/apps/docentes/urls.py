from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DocenteViewSet

router = DefaultRouter()
router.register(r'docentes', DocenteViewSet, basename='docentes')

urlpatterns = [
    path('', include(router.urls)),
]
