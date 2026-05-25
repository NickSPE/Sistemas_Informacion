from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InstitucionEducativaViewSet

router = DefaultRouter()
router.register(r'instituciones', InstitucionEducativaViewSet, basename='instituciones')

urlpatterns = [
    path('', include(router.urls)),
]
