from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import InstitucionEducativa
from .serializers import InstitucionEducativaSerializer

class InstitucionEducativaViewSet(viewsets.ModelViewSet):
    queryset = InstitucionEducativa.objects.all()
    serializer_class = InstitucionEducativaSerializer
    # simple standard authentication for API endpoints
    # permission_classes = [IsAuthenticated]
