from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PagoViewSet, PensionViewSet

router = DefaultRouter()
router.register(r'pagos', PagoViewSet, basename='pagos')
router.register(r'pensiones', PensionViewSet, basename='pensiones')

urlpatterns = [
    path('', include(router.urls)),
]
