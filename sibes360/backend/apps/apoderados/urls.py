from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ApoderadoViewSet

router = DefaultRouter()
router.register(r'apoderados', ApoderadoViewSet, basename='apoderados')

urlpatterns = [
    path('', include(router.urls)),
]
