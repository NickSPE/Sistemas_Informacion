import random
from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.db import transaction
from django.apps import apps

from instituciones.models import InstitucionEducativa
from usuarios.models import Rol, Usuario
from estudiantes.models import Estudiante
from apoderados.models import Apoderado
from docentes.models import Docente
from academico.models import NivelEducativo, Grado, Seccion, Curso, PeriodoAcademico
from matricula.models import Matricula
from horarios.models import Horario
from asistencia.models import Asistencia, Justificacion
from notas.models import Evaluacion, Nota, Promedio
from libretas.models import Libreta
from conducta.models import Conducta
from pagos.models import Pago, Pension
from comunicacion.models import Comunicado, Citacion
from alertas.models import Alerta
from reportes.models import Reporte

class Command(BaseCommand):
    help = 'Seeds database with a highly structured, mathematically coherent, and realistic academic dataset'

    def handle(self, *args, **kwargs):
        self.stdout.write("--- INICIANDO SEEDER COHERENTE Y ESTRUCTURADO ---")

        # Diccionarios de datos realistas (sin números de prueba)
        NOMBRES_MASCULINOS = [
            "Mateo", "Thiago", "Liam", "Lucas", "Benjamin", "Santiago", "Sebastian", "Matias", 
            "Alejandro", "Daniel", "Nicolas", "Diego", "Joaquin", "Alvaro", "Rodrigo", "Adrian", 
            "Facundo", "Gael", "Stefano", "Julian", "Juan", "Carlos", "Luis", "Francisco", "Miguel", 
            "Pedro", "Alberto", "Walter", "Jorge", "Hugo", "Raul", "Oscar", "Hector", "Cesar", "Armando"
        ]

        NOMBRES_FEMENINOS = [
            "Sofia", "Camila", "Valentina", "Luciana", "Maria", "Isabella", "Valeria", "Mariana", 
            "Gabriela", "Daniela", "Flavia", "Andrea", "Adriana", "Fabiana", "Alessia", "Ximena", 
            "Micaela", "Luana", "Paula", "Ana", "Silvia", "Patricia", "Carmen", "Luisa", "Diana", 
            "Juana", "Victoria", "Elena", "Sonia", "Yolanda", "Gladys", "Mercedes", "Sonia", "Monica"
        ]

        APELLIDOS = [
            "Quispe", "Huaman", "Flores", "Sanchez", "Ramirez", "Mamani", "Diaz", "Gonzales", 
            "Perez", "Torres", "Rojas", "Ruiz", "Vargas", "Castillo", "Chavez", "Alvarez", 
            "Morales", "Rodriguez", "Gomez", "Hernandez", "Cabrera", "Lopez", "Romero", 
            "Medina", "Silva", "Herrera", "Castro", "Farfan", "Leon", "Cardenas", "Mendoza", 
            "Delgado", "Ortiz", "Loli", "Valdivia", "Ramos", "Espinoza", "Salazar", "Reyes", 
            "Gutierrez", "Benitez", "Caceres", "Campos", "Chacon", "Cordova", "Paredes", "Prado"
        ]

        with transaction.atomic():
            # 1. Clean Database
            self.stdout.write("Limpiando tablas de base de datos...")
            get_user_model().objects.all().delete()
            Rol.objects.all().delete()
            InstitucionEducativa.objects.all().delete()
            Estudiante.objects.all().delete()
            Apoderado.objects.all().delete()
            Docente.objects.all().delete()
            NivelEducativo.objects.all().delete()
            Grado.objects.all().delete()
            Seccion.objects.all().delete()
            Curso.objects.all().delete()
            PeriodoAcademico.objects.all().delete()
            Matricula.objects.all().delete()
            Horario.objects.all().delete()
            Asistencia.objects.all().delete()
            Justificacion.objects.all().delete()
            Evaluacion.objects.all().delete()
            Nota.objects.all().delete()
            Promedio.objects.all().delete()
            Libreta.objects.all().delete()
            Conducta.objects.all().delete()
            Pago.objects.all().delete()
            Pension.objects.all().delete()
            Comunicado.objects.all().delete()
            Citacion.objects.all().delete()
            Alerta.objects.all().delete()
            Reporte.objects.all().delete()

            # 2. Roles
            self.stdout.write("Creando roles del sistema...")
            rol_admin = Rol.objects.create(nombre_rol="SuperAdmin", descripcion="Acceso total al sistema")
            rol_director = Rol.objects.create(nombre_rol="Director", descripcion="Gestión de una institución educativa")
            rol_docente = Rol.objects.create(nombre_rol="Docente", descripcion="Gestión académica y de alumnos")
            rol_apoderado = Rol.objects.create(nombre_rol="Apoderado", descripcion="Visualización del progreso del alumno")

            # 3. Instituciones
            self.stdout.write("Creando colegios base...")
            inst1 = InstitucionEducativa.objects.create(
                nombre="Colegio San Agustin de Lima",
                ruc="20123456789",
                direccion="Av. Javier Prado Este 980, San Isidro",
                telefono="014402010"
            )
            inst2 = InstitucionEducativa.objects.create(
                nombre="Colegio Inmaculada Concepcion",
                ruc="20987654321",
                direccion="Av. Camino Real 450, Santiago de Surco",
                telefono="012713928"
            )

            # 4. Superusuarios y Directores
            self.stdout.write("Creando cuentas administrativas...")
            get_user_model().objects.create_superuser(
                username="admin",
                email="admin@sibes360.pe",
                password="admin123",
                first_name="Diego",
                last_name="Alvarado",
                rol=rol_admin,
                institucion=None,
                dni="00000000"
            )
            get_user_model().objects.create_user(
                username="director1",
                email="director1@sanagustin.edu.pe",
                password="directorpassword",
                first_name="Francisco",
                last_name="Bolognesi",
                rol=rol_director,
                institucion=inst1,
                dni="00000001"
            )

            # 5. Estructura Académica (Colegio San Agustín)
            self.stdout.write("Diseñando niveles, grados y secciones...")
            nivel_primaria = NivelEducativo.objects.create(institucion=inst1, nombre="Primaria")
            nivel_secundaria = NivelEducativo.objects.create(institucion=inst1, nombre="Secundaria")

            grados_primaria = [
                Grado.objects.create(nivel=nivel_primaria, nombre=f"{i}° de Primaria") for i in range(1, 7)
            ]
            grados_secundaria = [
                Grado.objects.create(nivel=nivel_secundaria, nombre=f"{i}° de Secundaria") for i in range(1, 6)
            ]
            todos_grados = grados_primaria + grados_secundaria

            # Secciones A y B por grado (22 secciones en total)
            todas_secciones = []
            for gr in todos_grados:
                for letter in ["A", "B"]:
                    todas_secciones.append(Seccion.objects.create(grado=gr, nombre=letter))

            # Periodos Académicos (2024 Completo y 2025 Activo)
            self.stdout.write("Estableciendo periodos bimestrales (2024-2025)...")
            periodos_list = []
            for y in [2024]:
                for b in range(1, 5):
                    periodos_list.append(PeriodoAcademico(
                        institucion=inst1, anio=y, bimestre=f"{b}° Bimestre", estado=False
                    ))
            
            # Periodos 2025 (1, 2, 3 inactivos, 4 activo actual)
            for b in range(1, 4):
                periodos_list.append(PeriodoAcademico(
                    institucion=inst1, anio=2025, bimestre=f"{b}° Bimestre", estado=False
                ))
            
            periodo_activo_2025 = PeriodoAcademico(
                institucion=inst1, anio=2025, bimestre="4° Bimestre", estado=True
            )
            periodos_list.append(periodo_activo_2025)
            PeriodoAcademico.objects.bulk_create(periodos_list)
            
            todos_periodos = list(PeriodoAcademico.objects.filter(institucion=inst1))
            periodos_2024 = [p for p in todos_periodos if p.anio == 2024]
            periodos_2025 = [p for p in todos_periodos if p.anio == 2025]

            # Cursos
            self.stdout.write("Creando catálogo curricular oficial...")
            cursos_definicion = [
                ("Matematica", "Ciencias Exactas"),
                ("Comunicacion", "Humanidades"),
                ("Ciencia y Tecnologia", "Ciencias Naturales"),
                ("Personal Social", "Ciencias Sociales"),
                ("Ingles", "Idiomas"),
                ("Educacion Fisica", "Desarrollo Fisico"),
                ("Arte y Cultura", "Artes"),
                ("Computacion", "Tecnologia")
            ]
            cursos_list = [
                Curso(institucion=inst1, nombre=nombre, area=area) for nombre, area in cursos_definicion
            ]
            Curso.objects.bulk_create(cursos_list)
            todos_cursos = list(Curso.objects.filter(institucion=inst1))

            # 6. Docentes con especialidad
            self.stdout.write("Registrando perfiles de docentes especializados...")
            docentes_names = [
                ("Ana Maria Flores", "Comunicacion"),
                ("Juan Carlos Ramos", "Matematica"),
                ("Silvia Patricia Castro", "Ciencia y Tecnologia"),
                ("Luis Alberto Mendoza", "Personal Social"),
                ("Maria Fernanda Ortiz", "Ingles"),
                ("Roberto Carlos Quispe", "Educacion Fisica"),
                ("Gabriela Isabel Loli", "Arte y Cultura"),
                ("Jorge Luis Valdivia", "Computacion"),
                ("Carlos Enrique Prado", "Matematica"),
                ("Patricia Janet Delgado", "Comunicacion"),
                ("Manuel Antonio Gonzales", "Ciencia y Tecnologia"),
                ("Rosa Luz Diaz", "Personal Social"),
                ("Felipe Santiago Torres", "Ingles"),
                ("Carmen Rosa Rojas", "Educacion Fisica"),
                ("Hugo Hernan Sanchez", "Arte y Cultura"),
                ("Luisa Elena Ramirez", "Computacion")
            ]
            
            docentes_to_create = []
            usuarios_to_create = []

            for i, (name, specialty) in enumerate(docentes_names):
                dni = f"400000{i+1:02d}"
                doc = Docente(
                    institucion=inst1,
                    dni=dni,
                    nombres=name,
                    especialidad=specialty,
                    estado=True
                )
                docentes_to_create.append(doc)

                first, *last = name.split()
                username = f"docente_{first.lower()}_{i+1}"
                usr = get_user_model()(
                    username=username,
                    email=f"{username}@sanagustin.edu.pe",
                    password=make_password("docentepassword"),
                    first_name=first,
                    last_name=" ".join(last),
                    rol=rol_docente,
                    institucion=inst1,
                    dni=dni,
                    estado=True
                )
                usuarios_to_create.append(usr)

            Docente.objects.bulk_create(docentes_to_create)
            todos_docentes = list(Docente.objects.filter(institucion=inst1))

            # 7. Familias (Apoderados y Estudiantes Coherentes)
            self.stdout.write("Generando estructura familiar coherente (Apoderados y Alumnos)...")
            apoderados_to_create = []
            
            # Generamos 100 familias con apellidos reales
            familias = []
            for i in range(100):
                # Generamos apellidos familiares únicos
                ap_paterno = random.choice(APELLIDOS)
                ap_materno = random.choice(APELLIDOS)
                while ap_materno == ap_paterno:
                    ap_materno = random.choice(APELLIDOS)
                familias.append((ap_paterno, ap_materno))

            for i, (paterno, materno) in enumerate(familias):
                dni = f"50000{i+1:03d}"
                
                # Alternamos si es Padre o Madre
                if i % 2 == 0:
                    first_name = random.choice(NOMBRES_MASCULINOS)
                    parentesco = "Padre"
                else:
                    first_name = random.choice(NOMBRES_FEMENINOS)
                    parentesco = "Madre"
                
                full_name = f"{first_name} {paterno} {materno}"
                username = f"{first_name.lower()}.{paterno.lower()}{i+1}"
                email = f"{username}@gmail.com"

                # Creamos su cuenta de seguridad
                usr = get_user_model()(
                    username=username,
                    email=email,
                    password=make_password("123456"),
                    first_name=first_name,
                    last_name=f"{paterno} {materno}",
                    rol=rol_apoderado,
                    institucion=inst1,
                    dni=dni,
                    estado=True
                )
                usuarios_to_create.append(usr)

                apoderados_to_create.append(Apoderado(
                    nombres=full_name,
                    telefono=f"987654{i+1:03d}",
                    correo=email,
                    parentesco=parentesco,
                    usuario=None
                ))

            # Guardamos todos los usuarios docentes y apoderados creados hasta ahora
            get_user_model().objects.bulk_create(usuarios_to_create)
            
            # Mapeamos usuarios creados por DNI para enlazarlos
            usuarios_mapeados = {u.dni: u for u in get_user_model().objects.filter(institucion=inst1)}
            
            for i, apo in enumerate(apoderados_to_create):
                dni = f"50000{i+1:03d}"
                apo.usuario = usuarios_mapeados.get(dni)
            
            Apoderado.objects.bulk_create(apoderados_to_create)
            todos_apoderados = list(Apoderado.objects.all())

            # Creamos 130 estudiantes enlazados a sus respectivas familias
            estudiantes_to_create = []
            alumnos_por_familia = [] # Lista de tuplas (estudiante_obj, apoderado_idx)

            for i in range(130):
                # Elegimos una familia de forma cíclica o aleatoria para crear hermanos
                fam_idx = i % len(familias)
                paterno, materno_padre = familias[fam_idx]
                
                # Madre del estudiante tendrá otro apellido
                materno_alumno = random.choice(APELLIDOS)
                while materno_alumno in [paterno, materno_padre]:
                    materno_alumno = random.choice(APELLIDOS)

                if i % 2 == 0:
                    nombre_alumno = random.choice(NOMBRES_MASCULINOS)
                else:
                    nombre_alumno = random.choice(NOMBRES_FEMENINOS)

                dni = f"70000{i+1:03d}"
                
                # Determinamos edad acorde al grado aproximado
                # Grados del 0 al 10 (11 grados). Años entre 6 y 16.
                grado_objetivo = i % len(todos_grados)
                edad = 6 + grado_objetivo
                birth_year = 2025 - edad
                fecha_nac = date(birth_year, random.randint(1, 12), random.randint(1, 28))

                est = Estudiante(
                    institucion=inst1,
                    dni=dni,
                    nombres=nombre_alumno,
                    apellidos=f"{paterno} {materno_alumno}",
                    fecha_nacimiento=fecha_nac,
                    estado=True
                )
                estudiantes_to_create.append(est)
                alumnos_por_familia.append((i, fam_idx))

            Estudiante.objects.bulk_create(estudiantes_to_create)
            todos_estudiantes = list(Estudiante.objects.filter(institucion=inst1))

            # Enlazamos estudiantes con sus apoderados de forma coherente
            through_model = Apoderado.estudiantes.through
            through_list = []
            for i, fam_idx in alumnos_por_familia:
                student = todos_estudiantes[i]
                parent = todos_apoderados[fam_idx]
                through_list.append(through_model(apoderado_id=parent.id, estudiante_id=student.id))
            through_model.objects.bulk_create(through_list)

            # 8. Matrículas Históricas Coherentes (2024 y 2025)
            self.stdout.write("Estructurando matrículas cronológicas (2024 y 2025)...")
            matriculas_to_create = []
            
            # Matrículas de 2025
            for idx, student in enumerate(todos_estudiantes):
                # Distribuir equitativamente en los 11 grados
                grado_idx_2025 = idx % len(todos_grados)
                target_grado = todos_grados[grado_idx_2025]
                
                # Asignar a sección A o B alternadamente para mantener balance de sección
                sec_letra = "A" if (idx // len(todos_grados)) % 2 == 0 else "B"
                target_section = next(s for s in todas_secciones if s.grado_id == target_grado.id and s.nombre == sec_letra)
                
                periodo_2025 = next(p for p in periodos_2025 if p.estado) # IV Bimestre (activo)
                matriculas_to_create.append(Matricula(
                    estudiante=student,
                    periodo=periodo_2025,
                    grado=target_grado,
                    seccion=target_section
                ))

                # Historial 2024 (si su edad lo permitía, es decir, si no estaba en 1° de Primaria en 2025)
                if grado_idx_2025 > 0:
                    grado_idx_2024 = grado_idx_2025 - 1
                    grado_2024 = todos_grados[grado_idx_2024]
                    seccion_2024 = next(s for s in todas_secciones if s.grado_id == grado_2024.id and s.nombre == sec_letra)
                    periodo_2024 = periodos_2024[-1] # IV Bimestre 2024

                    matriculas_to_create.append(Matricula(
                        estudiante=student,
                        periodo=periodo_2024,
                        grado=grado_2024,
                        seccion=seccion_2024
                    ))

            Matricula.objects.bulk_create(matriculas_to_create)
            todas_matriculas = list(Matricula.objects.all())

            # 9. Asignador de Horarios Sin Colisiones (Algoritmo Greedy)
            self.stdout.write("Calculando horarios académicos sin cruces...")
            horarios_to_create = []
            
            # Estructura del plan horario semanal
            dias_semana = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes"]
            horas_bloque = [
                ("08:00:00", "10:00:00"),
                ("10:00:00", "12:00:00"),
                ("12:00:00", "14:00:00")
            ]

            # Rastreador de disponibilidad para evitar colisiones:
            # - doc_slots: { (docente_id, dia, hora_inicio): True }
            # - sec_slots: { (seccion_id, dia, hora_inicio): True }
            doc_busy_slots = set()
            sec_busy_slots = set()

            # Mapeamos docentes por sus cursos de especialidad
            docentes_por_especialidad = {}
            for doc in todos_docentes:
                if doc.especialidad not in docentes_por_especialidad:
                    docentes_por_especialidad[doc.especialidad] = []
                docentes_por_especialidad[doc.especialidad].append(doc)

            for sec in todas_secciones:
                # Cada sección llevará los 8 cursos
                for cur in todos_cursos:
                    # Encontrar el pool de profesores idóneos para este curso
                    especialidad_req = cur.nombre
                    # En su defecto, tomamos cualquier docente
                    docentes_pool = docentes_por_especialidad.get(especialidad_req, todos_docentes)
                    
                    asignado = False
                    # Buscamos un bloque horario disponible para la sección y el docente
                    for dia in dias_semana:
                        for h_ini, h_fin in horas_bloque:
                            # Intentamos emparejar con un docente disponible de la especialidad
                            for doc in docentes_pool:
                                doc_key = (doc.id, dia, h_ini)
                                sec_key = (sec.id, dia, h_ini)
                                
                                if doc_key not in doc_busy_slots and sec_key not in sec_busy_slots:
                                    # Bloqueamos el horario
                                    doc_busy_slots.add(doc_key)
                                    sec_busy_slots.add(sec_key)
                                    
                                    horarios_to_create.append(Horario(
                                        docente=doc,
                                        curso=cur,
                                        seccion=sec,
                                        dia=dia,
                                        hora_inicio=h_ini,
                                        hora_fin=h_fin
                                    ))
                                    asignado = True
                                    break
                            if asignado:
                                break
                        if asignado:
                            break
            
            Horario.objects.bulk_create(horarios_to_create)

            # 10. Evaluaciones Bimestrales
            self.stdout.write("Generando estructura de evaluaciones bimensuales...")
            evaluaciones_to_create = []
            for p in todos_periodos:
                for cur in todos_cursos:
                    evaluaciones_to_create.append(Evaluacion(curso=cur, periodo=p, tipo="Examen de Unidad", peso=0.50))
                    evaluaciones_to_create.append(Evaluacion(curso=cur, periodo=p, tipo="Practicas de Clase", peso=0.30))
                    evaluaciones_to_create.append(Evaluacion(curso=cur, periodo=p, tipo="Proyecto Grupal", peso=0.20))
            
            Evaluacion.objects.bulk_create(evaluaciones_to_create)
            todas_evaluaciones = list(Evaluacion.objects.all())

            # Agrupamos evaluaciones por (periodo_id, curso_id) para un mapeo veloz
            eval_map = {}
            for ev in todas_evaluaciones:
                key = (ev.periodo_id, ev.curso_id)
                if key not in eval_map:
                    eval_map[key] = []
                eval_map[key].append(ev)

            # 11. Notas de Precisión Matemática y Perfiles de Estudiantes
            self.stdout.write("Generando calificaciones bimestrales con cálculo matemático exacto...")
            notas_to_create = []
            promedios_to_create = []

            # Determinamos perfiles persistentes de rendimiento por alumno:
            # 0: Destacado (16-20), 1-3: Regular (11-15), 4: En Riesgo (05-10)
            estudiante_perfiles = {}
            for idx, student in enumerate(todos_estudiantes):
                perfil = idx % 5
                if perfil == 0:
                    base = random.uniform(16.5, 18.5)
                elif perfil in [1, 2, 3]:
                    base = random.uniform(12.5, 14.5)
                else:
                    base = random.uniform(7.5, 10.0)
                estudiante_perfiles[student.id] = base

            # Filtramos matrículas para generar sus notas correspondientes en cada periodo
            for idx, matr in enumerate(todas_matriculas):
                student = matr.estudiante
                year = matr.periodo.anio
                base_rendimiento = estudiante_perfiles[student.id]
                
                # Obtenemos los 4 periodos correspondientes a ese año académico
                year_periods = [p for p in todos_periodos if p.anio == year]

                for per in year_periods:
                    for cur in todos_cursos:
                        evs = eval_map.get((per.id, cur.id), [])
                        if not evs:
                            continue

                        # Generamos las calificaciones parciales
                        weighted_sum = 0.0
                        for ev in evs:
                            calif = base_rendimiento + random.uniform(-1.5, 1.5)
                            calif = round(max(0.0, min(20.0, calif)), 1)
                            
                            notas_to_create.append(Nota(
                                evaluacion=ev,
                                estudiante=student,
                                calificacion=calif
                            ))
                            weighted_sum += calif * float(ev.peso)

                        # Cálculo de promedio exacto
                        final_avg = round(weighted_sum, 2)
                        promedios_to_create.append(Promedio(
                            estudiante=student,
                            curso=cur,
                            periodo=per,
                            promedio=final_avg
                        ))

                if len(notas_to_create) > 8000:
                    Nota.objects.bulk_create(notas_to_create)
                    notas_to_create = []
                if len(promedios_to_create) > 4000:
                    Promedio.objects.bulk_create(promedios_to_create)
                    promedios_to_create = []

            # Limpiamos remanentes
            if notas_to_create:
                Nota.objects.bulk_create(notas_to_create)
            if promedios_to_create:
                Promedio.objects.bulk_create(promedios_to_create)

            # 12. Asistencias Diarias solo en Días Hábiles
            self.stdout.write("Creando registros diarios de asistencia (de Lunes a Viernes)...")
            asistencias_to_create = []
            
            # Generamos asistencia para los últimos 30 días calendario activos de 2025
            hoy = date.today()
            dias_laborables = []
            cursor_fecha = hoy - timedelta(days=45)
            
            while len(dias_laborables) < 30:
                if cursor_fecha.weekday() < 5: # 0-4 son Lunes a Viernes
                    dias_laborables.append(cursor_fecha)
                cursor_fecha += timedelta(days=1)

            # Todos los estudiantes activos en 2025
            estudiantes_activos_2025 = todos_estudiantes

            for d in dias_laborables:
                for student in estudiantes_activos_2025:
                    perf_base = estudiante_perfiles[student.id]
                    
                    # Probabilidad dependiente del perfil del estudiante
                    rand = random.random()
                    if perf_base >= 16.0: # Destacados faltan poquísimo
                        prob_p, prob_t, prob_fj = 0.96, 0.02, 0.01
                    elif perf_base >= 11.0: # Regulares
                        prob_p, prob_t, prob_fj = 0.92, 0.05, 0.015
                    else: # Alumnos en riesgo tienen inasistencias/tardanzas frecuentes
                        prob_p, prob_t, prob_fj = 0.80, 0.12, 0.04
                    
                    if rand < prob_p:
                        state = "P"
                    elif rand < (prob_p + prob_t):
                        state = "T"
                    elif rand < (prob_p + prob_t + prob_fj):
                        state = "FJ"
                    else:
                        state = "F"

                    asistencias_to_create.append(Asistencia(
                        estudiante=student,
                        fecha=d,
                        estado=state,
                        observacion="Asistencia normal de clase" if state == "P" else "Registro escolar diario"
                    ))

                if len(asistencias_to_create) > 8000:
                    Asistencia.objects.bulk_create(asistencias_to_create)
                    asistencias_to_create = []

            if asistencias_to_create:
                Asistencia.objects.bulk_create(asistencias_to_create)

            # Justificaciones para un subconjunto de inasistencias justificadas (FJ)
            self.stdout.write("Subiendo certificados de inasistencias médicas...")
            justificaciones_to_create = []
            fj_asistencias = list(Asistencia.objects.filter(estado="FJ")[:100])
            
            for excuse in fj_asistencias:
                justificaciones_to_create.append(Justificacion(
                    asistencia=excuse,
                    motivo="Cita medica odontologica o descanso por enfermedad familiar",
                    documento="https://sibes360.pe/storage/med/certificado_medico.pdf",
                    estado="Aprobada"
                ))
            Justificacion.objects.bulk_create(justificaciones_to_create)

            # 13. Módulo de Finanzas (Pensiones y Pagos Conciliados)
            self.stdout.write("Formulando historial financiero y pensiones conciliadas...")
            pensiones_to_create = []
            pagos_to_create = []
            
            meses_escolares = ["Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Setiembre", "Octubre", "Noviembre", "Diciembre"]

            for student in todos_estudiantes:
                # Pensiones y pagos de 2024 (Historial completo cerrado y pagado)
                # Derecho de Matrícula 2024
                m_fecha_2024 = date(2024, 2, random.randint(15, 25))
                pagos_to_create.append(Pago(
                    estudiante=student,
                    monto=350.00,
                    fecha=m_fecha_2024,
                    concepto="Matricula Regular Anio Escolar 2024",
                    comprobante=f"MAT-2024-{student.id:04d}"
                ))

                for idx, mes in enumerate(meses_escolares):
                    p_2024 = Pension(
                        estudiante=student,
                        periodo=f"{mes} 2024",
                        monto=380.00,
                        estado="Pagado"
                    )
                    pensiones_to_create.append(p_2024)

                # Pensiones y pagos de 2025 (Año actual)
                # Derecho de Matrícula 2025
                m_fecha_2025 = date(2025, 2, random.randint(15, 25))
                pagos_to_create.append(Pago(
                    estudiante=student,
                    monto=400.00,
                    fecha=m_fecha_2025,
                    concepto="Matricula Regular Anio Escolar 2025",
                    comprobante=f"MAT-2025-{student.id:04d}"
                ))

                for idx, mes in enumerate(meses_escolares):
                    # Determinamos estado coherente para 2025:
                    # De marzo a septiembre (mes index 0-6): mayormente pagado.
                    # Octubre y Noviembre (index 7-8): Pendiente o Vencido dependiendo del perfil del estudiante.
                    perf = estudiante_perfiles[student.id]
                    if idx <= 6:
                        state = "Pagado"
                    elif idx in [7, 8]:
                        # Si el estudiante está en riesgo, mayor probabilidad de atraso financiero
                        state = "Pagado" if (perf >= 11.0 and random.random() < 0.85) else "Vencido"
                    else:
                        state = "Pendiente"

                    p_2025 = Pension(
                        estudiante=student,
                        periodo=f"{mes} 2025",
                        monto=400.00,
                        estado=state
                    )
                    pensiones_to_create.append(p_2025)

            Pension.objects.bulk_create(pensiones_to_create)
            
            # Rescatamos pensiones de la base de datos marcadas como "Pagado" para emitir sus comprobantes correspondientes
            pensiones_pagadas = Pension.objects.filter(estado="Pagado")
            
            for pens in pensiones_pagadas:
                mes_str, anio_str = pens.periodo.split()
                anio = int(anio_str)
                mes_idx = meses_escolares.index(mes_str)
                
                # La fecha de pago ocurre coherentemente entre el 1 y el 10 de ese mes, siempre día de semana
                dia_mes = random.randint(1, 10)
                p_date = date(anio, mes_idx + 3, dia_mes)
                if p_date.weekday() >= 5: # Si cae sábado o domingo, corremos al lunes
                    p_date += timedelta(days=2)

                pagos_to_create.append(Pago(
                    estudiante=pens.estudiante,
                    monto=pens.monto,
                    fecha=p_date,
                    concepto=f"Pago de Pension Mensual - {pens.periodo}",
                    comprobante=f"REC-{anio}-{pens.id:06d}"
                ))

                if len(pagos_to_create) > 4000:
                    Pago.objects.bulk_create(pagos_to_create)
                    pagos_to_create = []

            if pagos_to_create:
                Pago.objects.bulk_create(pagos_to_create)

            # 14. Conducta, Alertas y Comunicaciones
            self.stdout.write("Registrando incidentes de conducta y alertas coherentes...")
            conductas_to_create = []
            
            # Se asignan deméritos o méritos en base al rendimiento escolar
            for student in todos_estudiantes:
                perf = estudiante_perfiles[student.id]
                if perf >= 16.5 and random.random() < 0.40:
                    conductas_to_create.append(Conducta(
                        estudiante=student,
                        fecha=date(2025, random.randint(3, 10), random.randint(1, 28)),
                        tipo="Positiva",
                        descripcion="Excelente participacion en actividades de integracion estudiantil y apoyo mutuo escolar."
                    ))
                elif perf <= 10.0 and random.random() < 0.60:
                    t_inc = "Grave" if random.random() < 0.30 else "Leve"
                    desc_inc = (
                        "Falta de atencion reiterada, uso indebido del celular en horas de clase y desobediencia al docente." 
                        if t_inc == "Leve" else 
                        "Inasistencia injustificada recurrente y comportamiento disruptivo verbal contra companeros de aula."
                    )
                    conductas_to_create.append(Conducta(
                        estudiante=student,
                        fecha=date(2025, random.randint(3, 10), random.randint(1, 28)),
                        tipo=t_inc,
                        descripcion=desc_inc
                    ))
            
            Conducta.objects.bulk_create(conductas_to_create)

            # Emisión de comunicados
            Comunicado.objects.create(
                institucion=inst1,
                titulo="Cronograma de Evaluaciones - Cuarto Bimestre 2025",
                mensaje="Estimados padres de familia, les informamos el inicio de las evaluaciones del 4° Bimestre a partir del 1 de Diciembre."
            )
            Comunicado.objects.create(
                institucion=inst1,
                titulo="Entrega de Libretas de Calificaciones",
                mensaje="Se convoca a la reunion informativa de fin de ciclo para coordinar la entrega de informes de progreso académico en sus respectivas aulas."
            )

            # Alertas Coherentes automáticas basadas en promedios y deudas reales
            self.stdout.write("Calculando y activando alertas del sistema...")
            alertas_to_create = []
            
            # Alertas por bajo promedio del bimestre actual (4° bimestre de 2025)
            promedios_riesgo = Promedio.objects.filter(periodo=periodo_activo_2025, promedio__lt=11.0)
            for prom in promedios_riesgo:
                alertas_to_create.append(Alerta(
                    estudiante=prom.estudiante,
                    tipo="Baja Calificacion",
                    descripcion=f"Riesgo Escolar: Promedio bimensual desaprobatorio de {prom.promedio} detectado en {prom.curso.nombre}.",
                    estado="Activa"
                ))

            # Alertas por deudas vencidas reales
            pensiones_vencidas = Pension.objects.filter(estado="Vencido")
            for pens in pensiones_vencidas:
                alertas_to_create.append(Alerta(
                    estudiante=pens.estudiante,
                    tipo="Pensiones Vencidas",
                    descripcion=f"Control Financiero: El apoderado presenta pension vencida e impaga para el periodo {pens.periodo}.",
                    estado="Activa"
                ))

            Alerta.objects.bulk_create(alertas_to_create)

        self.stdout.write(self.style.SUCCESS("--- ¡SEMINADO COMPLETADO CON ÉXITO Y COHERENCIA TOTAL! ---"))
        self.stdout.write(self.style.SUCCESS(f"Se registraron con éxito {Estudiante.objects.all().count()} estudiantes enlazados con precisión familiar y académica."))
