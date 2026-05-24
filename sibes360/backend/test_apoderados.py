import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sibes360.settings')
django.setup()

from apps.estudiantes.models import Estudiante
from apps.instituciones.models import Institucion
from apps.apoderados.models import Apoderado
from django.test import Client

def run_test():
    # 1. Limpiar datos de prueba anteriores
    Apoderado.objects.filter(nombres='Prueba Apoderado').delete()
    Estudiante.objects.filter(nombres__startswith='Prueba Hijo').delete()

    # 2. Crear una Institución si no hay (para el estudiante)
    institucion, _ = Institucion.objects.get_or_create(
        nombre='Colegio de Prueba',
        defaults={'direccion': 'Calle Falsa 123'}
    )

    # 3. Crear estudiantes
    est1 = Estudiante.objects.create(
        nombres='Prueba Hijo 1', apellidos='Perez', dni='00000001', institucion=institucion
    )
    est2 = Estudiante.objects.create(
        nombres='Prueba Hijo 2', apellidos='Perez', dni='00000002', institucion=institucion
    )

    # 4. Probar creación de Apoderado con multiples estudiantes
    padre = Apoderado.objects.create(
        nombres='Prueba Apoderado',
        telefono='999888777',
        correo='prueba@padre.com',
        parentesco='Padre'
    )
    padre.estudiantes.add(est1, est2)

    # 5. Verificar que la relación ManyToMany funciona
    if padre.estudiantes.count() == 2:
        print("✅ ÉXITO: El apoderado fue vinculado a 2 estudiantes correctamente.")
    else:
        print("❌ ERROR: El apoderado no se vinculó a los estudiantes.")

    # 6. Probar el serializador de la API
    c = Client()
    response = c.get('/api/apoderados/') # Nota: El viewset requiere autenticación (user.is_authenticated), así que esto podría devolver None a menos que nos autentiquemos o hagamos mock.
    
    # Para la prueba, simplemente probaremos el serializador directamente
    from apps.apoderados.serializers import ApoderadoSerializer
    serializer = ApoderadoSerializer(padre)
    data = serializer.data
    
    estudiantes_detalle = data.get('estudiantes_detalle', [])
    if len(estudiantes_detalle) == 2 and estudiantes_detalle[0]['nombres'] == 'Prueba Hijo 1':
        print("✅ ÉXITO: El Serializer devuelve correctamente los detalles de múltiples estudiantes.")
    else:
        print("❌ ERROR: El Serializer falló devolviendo los estudiantes_detalle.")
        print("Data devuelta:", data)

    # 7. Limpieza
    padre.delete()
    est1.delete()
    est2.delete()

if __name__ == '__main__':
    run_test()
