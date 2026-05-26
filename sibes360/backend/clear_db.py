import os
import sys
import django
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent

# Insert 'apps' directory to sys.path so we can import our apps directly
sys.path.insert(0, os.path.join(BASE_DIR, 'apps'))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sibes360.settings')
django.setup()

from django.db import transaction
from django.apps import apps
from django.contrib.auth import get_user_model

# Ordered list of models to delete (dependent models first, or let CASCADE handle it, but being explicit is safer)
models_to_delete = [
    ('alertas', 'Alerta'),
    ('comunicacion', 'Citacion'),
    ('comunicacion', 'Comunicado'),
    ('pagos', 'Pago'),
    ('pagos', 'Pension'),
    ('conducta', 'Conducta'),
    ('libretas', 'Libreta'),
    ('notas', 'Nota'),
    ('notas', 'Promedio'),
    ('notas', 'Evaluacion'),
    ('asistencia', 'Justificacion'),
    ('asistencia', 'Asistencia'),
    ('horarios', 'Horario'),
    ('matricula', 'Matricula'),
    ('academico', 'Curso'),
    ('academico', 'Seccion'),
    ('academico', 'Grado'),
    ('academico', 'NivelEducativo'),
    ('academico', 'PeriodoAcademico'),
    ('docentes', 'Docente'),
    ('apoderados', 'Apoderado'),
    ('estudiantes', 'Estudiante'),
    ('usuarios', 'Usuario'),
    ('usuarios', 'Rol'),
    ('instituciones', 'InstitucionEducativa'),
    ('reportes', 'Reporte'),
]

print("--- INICIANDO ELIMINACIÓN DE DATOS ---")
try:
    with transaction.atomic():
        # Deleting models in sequence to prevent dependency/integrity issues
        for app_label, model_name in models_to_delete:
            try:
                Model = apps.get_model(app_label, model_name)
                count = Model.objects.all().count()
                if count > 0:
                    print(f"Eliminando {count} registros de {app_label}.{model_name}...")
                    Model.objects.all().delete()
                else:
                    print(f"No hay registros en {app_label}.{model_name}")
            except LookupError:
                print(f"El modelo {app_label}.{model_name} no está registrado u omitido.")
            except Exception as e:
                print(f"Error al vaciar {app_label}.{model_name}: {e}")
                
        # Also clean ContentType/Admin Logs just to be thorough and start clean
        from django.contrib.contenttypes.models import ContentType
        from django.contrib.admin.models import LogEntry
        
        print("Limpiando logs de administración...")
        LogEntry.objects.all().delete()

    print("\n--- ¡ELIMINACIÓN COMPLETADA CON ÉXITO! ---")
    print("Todos los datos académicos, financieros e institucionales han sido eliminados del sistema.")
except Exception as main_e:
    print(f"Error general en la transacción: {main_e}")
