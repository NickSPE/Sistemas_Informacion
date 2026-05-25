from rest_framework import serializers
from .models import Docente

class DocenteSerializer(serializers.ModelSerializer):
    institucion_nombre = serializers.ReadOnlyField(source='institucion.nombre')
    cursos_asignados = serializers.SerializerMethodField()

    class Meta:
        model = Docente
        fields = ['id', 'institucion', 'institucion_nombre', 'dni', 'nombres', 'especialidad', 'estado', 'cursos_asignados']

    def get_cursos_asignados(self, obj):
        # We import here to avoid circular imports
        from horarios.models import Horario
        horarios = Horario.objects.filter(docente=obj)
        cursos = []
        seen = set()
        for h in horarios:
            key = (h.curso.id, h.seccion.id)
            if key not in seen:
                seen.add(key)
                cursos.append({
                    "id": h.curso.id,
                    "nombre": h.curso.nombre,
                    "area": h.curso.area,
                    "seccion_id": h.seccion.id,
                    "seccion_nombre": f"{h.seccion.grado.nombre} {h.seccion.nombre}"
                })
        return cursos
