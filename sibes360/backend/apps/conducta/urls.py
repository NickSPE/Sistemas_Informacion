from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ConductaViewSet

router = DefaultRouter()
router.register(r'conducta', ConductaViewSet, basename='conducta')

urlpatterns = [
    path('', include(router.urls)),
]
