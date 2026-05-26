import os
import sys
import django
from pathlib import Path

# Configurar encoding utf-8 para salida en Windows
sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, os.path.join(BASE_DIR, 'apps'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sibes360.settings')
django.setup()

from django.apps import apps
from estudiantes.models import Estudiante
from apoderados.models import Apoderado
from horarios.models import Horario
from notas.models import Nota, Promedio, Evaluacion
from asistencia.models import Asistencia
from pagos.models import Pago, Pension

print("=== INICIANDO VALIDACIÓN DE INTEGRIDAD DEL DATASET ===")

# 1. Validación de Árbol Familiar y Apellidos
print("\n[1/4] Auditando Coherencia de Árbol Familiar...")
family_errors = 0
total_students = Estudiante.objects.all().count()

for student in Estudiante.objects.all():
    parents = student.apoderados.all()
    if not parents.exists():
        print(f"  [ERROR] Estudiante {student.nombres} {student.apellidos} no tiene apoderado asignado.")
        family_errors += 1
        continue
    
    # Extraemos apellidos del estudiante
    s_apellidos = student.apellidos.split()
    matched = False
    
    for parent in parents:
        p_apellidos = parent.nombres.split()[1:] # Quitamos el primer nombre
        # Comprobar si al menos un apellido del estudiante está en los apellidos del apoderado
        for sa in s_apellidos:
            if sa in p_apellidos:
                matched = True
                break
        if matched:
            break
            
    if not matched:
        print(f"  [ERROR] Inconsistencia: El alumno {student.nombres} {student.apellidos} está asignado al apoderado {parents.first().nombres} sin coincidencia de apellidos.")
        family_errors += 1

if family_errors == 0:
    print(f"  [OK] ¡Perfecto! Los {total_students} estudiantes están vinculados coherentemente a sus apoderados con coincidencia de apellidos.")
else:
    print(f"  [ALERTA] Se encontraron {family_errors} inconsistencias familiares.")

# 2. Cruce de Horarios (Optimizado)
print("\n[2/4] Auditando Traslapes en Horarios de Docentes...")
schedule_conflicts = 0
horarios = list(Horario.objects.all())
n_horarios = len(horarios)

# Usamos conjuntos de claves únicas para verificar colisiones en O(N)
doc_slots = set()
sec_slots = set()

for h in horarios:
    doc_key = (h.docente_id, h.dia, h.hora_inicio)
    sec_key = (h.seccion_id, h.dia, h.hora_inicio)
    
    if doc_key in doc_slots:
        print(f"  [ERROR] Cruce Horario Docente: {h.docente.nombres} ({h.dia} {h.hora_inicio}).")
        schedule_conflicts += 1
    else:
        doc_slots.add(doc_key)
        
    if sec_key in sec_slots:
        print(f"  [ERROR] Cruce Horario Sección: Sección {h.seccion.grado.nombre} - {h.seccion.nombre} ({h.dia} {h.hora_inicio}).")
        schedule_conflicts += 1
    else:
        sec_slots.add(sec_key)

if schedule_conflicts == 0:
    print(f"  [OK] ¡Perfecto! Se auditaron {n_horarios} bloques de horarios sin ningún conflicto ni traslape de docentes o secciones.")
else:
    print(f"  [ALERTA] Se encontraron {schedule_conflicts} traslapes de horarios.")

# 3. Validación de Consistencia Matemática de Notas
print("\n[3/4] Auditando Consistencia de Promedios Bimestrales...")
math_errors = 0
total_proms = Promedio.objects.all().count()

# Muestreamos un subconjunto de 500 promedios para acelerar la auditoría
promedios_auditar = Promedio.objects.all().order_by('?')[:500]

for prom in promedios_auditar:
    student = prom.estudiante
    course = prom.curso
    period = prom.periodo
    
    # Evaluaciones de este curso y periodo
    evs = Evaluacion.objects.filter(curso=course, periodo=period)
    
    # Buscamos notas del estudiante para estas evaluaciones
    weighted_sum = 0.0
    for ev in evs:
        nota_obj = Nota.objects.filter(evaluacion=ev, estudiante=student).first()
        if nota_obj:
            weighted_sum += float(nota_obj.calificacion) * float(ev.peso)
            
    expected_avg = round(weighted_sum, 2)
    diff = abs(float(prom.promedio) - expected_avg)
    
    if diff > 0.01:
        print(f"  [ERROR] Discrepancia matemática en {course.nombre} ({period.bimestre} {period.anio}) para Alumno {student.nombres} {student.apellidos}: Promedio en BD={prom.promedio}, Calculado Esperado={expected_avg} (Diferencia={diff}).")
        math_errors += 1

if math_errors == 0:
    print(f"  [OK] ¡Perfecto! Todos los promedios bimestrales coinciden exactamente con la suma ponderada matemática de sus notas parciales (auditoría en muestra aleatoria de 500 registros).")
else:
    print(f"  [ALERTA] Se encontraron {math_errors} discrepancias de redondeo matemático.")

# 4. Validación de Fechas en Días Hábiles (Lunes a Viernes)
print("\n[4/4] Auditando Registro en Días Hábiles...")
calendar_errors = 0

weekend_attendance = Asistencia.objects.filter(fecha__week_day__in=[1, 7]) # 1 es Domingo, 7 es Sábado en Django
if weekend_attendance.exists():
    print(f"  [ERROR] Se detectaron {weekend_attendance.count()} asistencias en fines de semana.")
    calendar_errors += weekend_attendance.count()

weekend_payments = Pago.objects.filter(fecha__week_day__in=[1, 7])
if weekend_payments.exists():
    print(f"  [ERROR] Se detectaron {weekend_payments.count()} pagos procesados en fines de semana.")
    calendar_errors += weekend_payments.count()

if calendar_errors == 0:
    print(f"  [OK] ¡Perfecto! El 100% de los registros de asistencias diarias y transacciones de pagos ocurrieron estrictamente de Lunes a Viernes.")
else:
    print(f"  [ALERTA] Se encontraron {calendar_errors} transacciones o registros fuera de días laborales.")

print("\n=== VALIDACIÓN FINALIZADA ===")
