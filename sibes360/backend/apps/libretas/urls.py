from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LibretaViewSet

router = DefaultRouter()
router.register(r'libretas', LibretaViewSet, basename='libretas')

urlpatterns = [
    path('', include(router.urls)),
]
