import os
import django
import random
from datetime import datetime, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sibes360.settings')
django.setup()

from estudiantes.models import Estudiante
from conducta.models import Conducta

def create_conductas():
    estudiantes = list(Estudiante.objects.all())
    if not estudiantes:
        print("No hay estudiantes en la base de datos.")
        return

    tipos = ['Positiva', 'Negativa', 'Leve', 'Grave', 'Felicitación', 'Llamado de atención']
    descripciones = [
        "El estudiante llegó tarde a tres clases consecutivas.",
        "Participación destacada en la clase de matemáticas.",
        "No presentó las tareas de la semana.",
        "Comportamiento ejemplar durante el receso.",
        "Uso inapropiado del teléfono celular en el aula.",
        "Ayudó a un compañero que tenía dificultades con el tema.",
        "Interrupción constante durante la explicación del docente.",
        "Falta de respeto hacia sus compañeros."
    ]

    # Clear existing if any
    Conducta.objects.all().delete()
    print("Datos anteriores de conducta eliminados.")

    created_count = 0
    for estudiante in estudiantes:
        # Create between 1 and 3 conduct records per student
        for _ in range(random.randint(1, 3)):
            tipo = random.choice(tipos)
            descripcion = random.choice(descripciones)
            # Random date within the last 60 days
            fecha = datetime.today() - timedelta(days=random.randint(0, 60))
            
            Conducta.objects.create(
                estudiante=estudiante,
                fecha=fecha.date(),
                tipo=tipo,
                descripcion=descripcion
            )
            created_count += 1
            
    print(f"Se crearon exitosamente {created_count} registros de conducta.")

if __name__ == '__main__':
    create_conductas()
