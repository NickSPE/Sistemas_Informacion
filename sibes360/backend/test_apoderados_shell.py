from apps.estudiantes.models import Estudiante
from apps.instituciones.models import Institucion
from apps.apoderados.models import Apoderado
from apps.apoderados.serializers import ApoderadoSerializer

def run_test():
    # 1. Limpiar datos de prueba
    Apoderado.objects.filter(nombres='Prueba Apoderado').delete()
    Estudiante.objects.filter(nombres__startswith='Prueba Hijo').delete()

    # 2. Crear Institución
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

    # 4. Crear Apoderado
    padre = Apoderado.objects.create(
        nombres='Prueba Apoderado',
        telefono='999888777',
        correo='prueba@padre.com',
        parentesco='Padre'
    )
    padre.estudiantes.add(est1, est2)

    # 5. Test ManyToMany
    if padre.estudiantes.count() == 2:
        print("✅ BACKEND-DB: El apoderado fue vinculado a 2 estudiantes correctamente.")
    else:
        print("❌ BACKEND-DB: Falló la vinculación a múltiples estudiantes.")

    # 6. Test Serializer
    serializer = ApoderadoSerializer(padre)
    data = serializer.data
    estudiantes_detalle = data.get('estudiantes_detalle', [])
    
    if len(estudiantes_detalle) == 2 and 'Prueba Hijo' in estudiantes_detalle[0]['nombres']:
        print("✅ BACKEND-API: El Serializer devuelve los detalles de múltiples estudiantes correctamente.")
    else:
        print("❌ BACKEND-API: El Serializer falló.")

    # 7. Limpieza
    padre.delete()
    est1.delete()
    est2.delete()

run_test()
