from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReporteViewSet, DashboardStatsView

router = DefaultRouter()
router.register(r'reportes', ReporteViewSet, basename='reportes')

urlpatterns = [
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard_stats'),
    path('', include(router.urls)),
]
