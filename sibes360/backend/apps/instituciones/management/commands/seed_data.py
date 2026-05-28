import random
from datetime import date, timedelta, datetime
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.db import transaction
from django.db.models import Avg

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
            "Juana", "Victoria", "Elena", "Sonia", "Yolanda", "Gladys", "Mercedes", "Monica"
        ]

        APELLIDOS = [
            "Quispe", "Huaman", "Flores", "Sanchez", "Ramirez", "Mamani", "Diaz", "Gonzales", 
            "Perez", "Torres", "Rojas", "Ruiz", "Vargas", "Castillo", "Chavez", "Alvarez", 
            "Morales", "Rodriguez", "Gomez", "Hernandez", "Cabrera", "Lopez", "Romero", 
            "Medina", "Silva", "Herrera", "Castro", "Farfan", "Leon", "Cardenas", "Mendoza", 
            "Delgado", "Ortiz", "Loli", "Valdivia", "Ramos", "Espinoza", "Salazar", "Reyes", 
            "Gutierrez", "Benitez", "Caceres", "Campos", "Chacon", "Cordova", "Paredes", "Prado"
        ]

        # Generator for unique DNI
        used_dnis = set()
        def get_unique_dni(prefix="4"):
            while True:
                num = "".join([str(random.randint(0, 9)) for _ in range(7)])
                dni = f"{prefix}{num}"
                if dni not in used_dnis:
                    used_dnis.add(dni)
                    return dni

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
            
            # Director para San Agustin
            get_user_model().objects.create_user(
                username="director1",
                email="director1@sanagustin.edu.pe",
                password="directorpassword",
                first_name="Francisco",
                last_name="Bolognesi",
                rol=rol_director,
                institucion=inst1,
                dni=get_unique_dni("1")
            )

            # Director para Inmaculada Concepcion
            get_user_model().objects.create_user(
                username="director2",
                email="director2@inmaculada.edu.pe",
                password="directorpassword",
                first_name="Miguel",
                last_name="Grau",
                rol=rol_director,
                institucion=inst2,
                dni=get_unique_dni("1")
            )

            # Estructura Académica y Datos para ambas instituciones
            for inst, acronym, num_students in [(inst1, "SA", 80), (inst2, "IC", 60)]:
                self.stdout.write(f"Procesando datos para {inst.nombre}...")
                
                # 5. Estructura Académica (Niveles, Grados, Secciones)
                nivel_primaria = NivelEducativo.objects.create(institucion=inst, nombre="Primaria")
                nivel_secundaria = NivelEducativo.objects.create(institucion=inst, nombre="Secundaria")

                grados_primaria = [
                    Grado.objects.create(nivel=nivel_primaria, nombre=f"{i}° de Primaria") for i in range(1, 7)
                ]
                grados_secundaria = [
                    Grado.objects.create(nivel=nivel_secundaria, nombre=f"{i}° de Secundaria") for i in range(1, 6)
                ]
                todos_grados = grados_primaria + grados_secundaria

                # Secciones A y B por grado
                todas_secciones = []
                for gr in todos_grados:
                    for letter in ["A", "B"]:
                        todas_secciones.append(Seccion.objects.create(grado=gr, nombre=letter))

                # Periodos Académicos (2024, 2025 e Histórico/Activo 2026)
                periodos_list = []
                for y in [2024, 2025]:
                    for b in range(1, 5):
                        periodos_list.append(PeriodoAcademico(
                            institucion=inst, anio=y, bimestre=f"{b}° Bimestre", estado=False
                        ))
                
                # 2026: 1° Bimestre (Completo/Inactivo), 2° Bimestre (Activo en Mayo 2026), 3° y 4° (Futuro)
                periodos_list.append(PeriodoAcademico(institucion=inst, anio=2026, bimestre="1° Bimestre", estado=False))
                periodo_activo_2026 = PeriodoAcademico(institucion=inst, anio=2026, bimestre="2° Bimestre", estado=True)
                periodos_list.append(periodo_activo_2026)
                periodos_list.append(PeriodoAcademico(institucion=inst, anio=2026, bimestre="3° Bimestre", estado=False))
                periodos_list.append(PeriodoAcademico(institucion=inst, anio=2026, bimestre="4° Bimestre", estado=False))
                
                PeriodoAcademico.objects.bulk_create(periodos_list)
                
                todos_periodos = list(PeriodoAcademico.objects.filter(institucion=inst))
                periodos_2024 = [p for p in todos_periodos if p.anio == 2024]
                periodos_2025 = [p for p in todos_periodos if p.anio == 2025]
                periodos_2026 = [p for p in todos_periodos if p.anio == 2026]

                # Cursos
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
                    Curso(institucion=inst, nombre=f"{nombre}", area=area) for nombre, area in cursos_definicion
                ]
                Curso.objects.bulk_create(cursos_list)
                todos_cursos = list(Curso.objects.filter(institucion=inst))

                # 6. Docentes
                docentes_names = [
                    ("Ana Flores", "Comunicacion"),
                    ("Juan Ramos", "Matematica"),
                    ("Silvia Castro", "Ciencia y Tecnologia"),
                    ("Luis Mendoza", "Personal Social"),
                    ("Maria Ortiz", "Ingles"),
                    ("Roberto Quispe", "Educacion Fisica"),
                    ("Gabriela Loli", "Arte y Cultura"),
                    ("Jorge Valdivia", "Computacion"),
                    ("Carlos Prado", "Matematica"),
                    ("Patricia Delgado", "Comunicacion"),
                    ("Rosa Diaz", "Personal Social"),
                    ("Felipe Torres", "Ingles")
                ]
                
                docentes_to_create = []
                usuarios_to_create = []

                for idx, (name, specialty) in enumerate(docentes_names):
                    dni = get_unique_dni("4")
                    doc = Docente(
                        institucion=inst,
                        dni=dni,
                        nombres=f"{name} ({acronym})",
                        especialidad=specialty,
                        estado=True
                    )
                    docentes_to_create.append(doc)

                    first, last = name.split()
                    username = f"docente_{acronym.lower()}_{first.lower()}_{idx+1}"
                    usr = get_user_model()(
                        username=username,
                        email=f"{username}@{acronym.lower()}.edu.pe",
                        password=make_password("docentepassword"),
                        first_name=first,
                        last_name=f"{last} ({acronym})",
                        rol=rol_docente,
                        institucion=inst,
                        dni=dni,
                        estado=True
                    )
                    usuarios_to_create.append(usr)

                Docente.objects.bulk_create(docentes_to_create)
                get_user_model().objects.bulk_create(usuarios_to_create)
                todos_docentes = list(Docente.objects.filter(institucion=inst))

                # 7. Familias (Apoderados y Estudiantes)
                apoderados_to_create = []
                familias = []
                for idx in range(num_students):
                    ap_paterno = random.choice(APELLIDOS)
                    ap_materno = random.choice(APELLIDOS)
                    while ap_materno == ap_paterno:
                        ap_materno = random.choice(APELLIDOS)
                    familias.append((ap_paterno, ap_materno))

                apo_usuarios_to_create = []
                for idx, (paterno, materno) in enumerate(familias):
                    dni = get_unique_dni("5")
                    if idx % 2 == 0:
                        first_name = random.choice(NOMBRES_MASCULINOS)
                        parentesco = "Padre"
                    else:
                        first_name = random.choice(NOMBRES_FEMENINOS)
                        parentesco = "Madre"
                    
                    full_name = f"{first_name} {paterno} {materno}"
                    username = f"apo.{acronym.lower()}.{first_name.lower()}{idx+1}"
                    email = f"{username}@gmail.com"

                    usr = get_user_model()(
                        username=username,
                        email=email,
                        password=make_password("123456"),
                        first_name=first_name,
                        last_name=f"{paterno} {materno}",
                        rol=rol_apoderado,
                        institucion=inst,
                        dni=dni,
                        estado=True
                    )
                    apo_usuarios_to_create.append(usr)

                    apoderados_to_create.append(Apoderado(
                        nombres=full_name,
                        telefono=f"987654{idx+1:03d}",
                        correo=email,
                        parentesco=parentesco,
                        usuario=None
                    ))

                get_user_model().objects.bulk_create(apo_usuarios_to_create)
                usuarios_mapeados = {u.dni: u for u in get_user_model().objects.filter(institucion=inst)}
                
                for idx, apo in enumerate(apoderados_to_create):
                    dni = apo_usuarios_to_create[idx].dni
                    apo.usuario = usuarios_mapeados.get(dni)
                
                Apoderado.objects.bulk_create(apoderados_to_create)
                todos_apoderados = list(Apoderado.objects.filter(usuario__institucion=inst))

                # Estudiantes
                estudiantes_to_create = []
                alumnos_por_familia = []

                for idx in range(num_students):
                    fam_idx = idx % len(familias)
                    paterno, materno_padre = familias[fam_idx]
                    
                    materno_alumno = random.choice(APELLIDOS)
                    while materno_alumno in [paterno, materno_padre]:
                        materno_alumno = random.choice(APELLIDOS)

                    if idx % 2 == 0:
                        nombre_alumno = random.choice(NOMBRES_MASCULINOS)
                    else:
                        nombre_alumno = random.choice(NOMBRES_FEMENINOS)

                    dni = get_unique_dni("7")
                    grado_objetivo_2026 = idx % len(todos_grados)
                    edad = 6 + grado_objetivo_2026
                    birth_year = 2026 - edad
                    fecha_nac = date(birth_year, random.randint(1, 12), random.randint(1, 28))

                    est = Estudiante(
                        institucion=inst,
                        dni=dni,
                        nombres=nombre_alumno,
                        apellidos=f"{paterno} {materno_alumno}",
                        fecha_nacimiento=fecha_nac,
                        estado=True
                    )
                    estudiantes_to_create.append(est)
                    alumnos_por_familia.append((idx, fam_idx))

                Estudiante.objects.bulk_create(estudiantes_to_create)
                todos_estudiantes = list(Estudiante.objects.filter(institucion=inst))

                # Enlazar estudiantes con apoderados
                through_model = Apoderado.estudiantes.through
                through_list = []
                for idx, fam_idx in alumnos_por_familia:
                    student = todos_estudiantes[idx]
                    parent = todos_apoderados[fam_idx]
                    through_list.append(through_model(apoderado_id=parent.id, estudiante_id=student.id))
                through_model.objects.bulk_create(through_list)

                # 8. Matrículas Cronológicas Coherentes (2024, 2025, 2026)
                matriculas_to_create = []
                for idx, student in enumerate(todos_estudiantes):
                    grado_idx_2026 = idx % len(todos_grados)
                    sec_letra = "A" if (idx // len(todos_grados)) % 2 == 0 else "B"

                    # 2026 (Año Actual)
                    target_grado_2026 = todos_grados[grado_idx_2026]
                    target_section_2026 = next(s for s in todas_secciones if s.grado_id == target_grado_2026.id and s.nombre == sec_letra)
                    periodo_2026 = next(p for p in periodos_2026 if p.estado)
                    matriculas_to_create.append(Matricula(
                        estudiante=student,
                        periodo=periodo_2026,
                        grado=target_grado_2026,
                        seccion=target_section_2026
                    ))

                    # 2025 (Año Previo)
                    if grado_idx_2026 > 0:
                        grado_idx_2025 = grado_idx_2026 - 1
                        grado_2025 = todos_grados[grado_idx_2025]
                        seccion_2025 = next(s for s in todas_secciones if s.grado_id == grado_2025.id and s.nombre == sec_letra)
                        periodo_2025 = periodos_2025[-1]
                        matriculas_to_create.append(Matricula(
                            estudiante=student,
                            periodo=periodo_2025,
                            grado=grado_2025,
                            seccion=seccion_2025
                        ))

                    # 2024 (Hace 2 Años)
                    if grado_idx_2026 > 1:
                        grado_idx_2024 = grado_idx_2026 - 2
                        grado_2024 = todos_grados[grado_idx_2024]
                        seccion_2024 = next(s for s in todas_secciones if s.grado_id == grado_2024.id and s.nombre == sec_letra)
                        periodo_2024 = periodos_2024[-1]
                        matriculas_to_create.append(Matricula(
                            estudiante=student,
                            periodo=periodo_2024,
                            grado=grado_2024,
                            seccion=seccion_2024
                        ))

                Matricula.objects.bulk_create(matriculas_to_create)
                todas_matriculas = list(Matricula.objects.filter(estudiante__institucion=inst))

                # 9. Asignar Horarios Sin Colisiones
                horarios_to_create = []
                dias_semana = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes"]
                horas_bloque = [
                    ("08:00:00", "10:00:00"),
                    ("10:00:00", "12:00:00"),
                    ("12:00:00", "14:00:00")
                ]
                doc_busy_slots = set()
                sec_busy_slots = set()

                docentes_por_especialidad = {}
                for doc in todos_docentes:
                    if doc.especialidad not in docentes_por_especialidad:
                        docentes_por_especialidad[doc.especialidad] = []
                    docentes_por_especialidad[doc.especialidad].append(doc)

                for sec in todas_secciones:
                    for cur in todos_cursos:
                        especialidad_req = cur.nombre
                        docentes_pool = docentes_por_especialidad.get(especialidad_req, todos_docentes)
                        asignado = False
                        for dia in dias_semana:
                            for h_ini, h_fin in horas_bloque:
                                for doc in docentes_pool:
                                    doc_key = (doc.id, dia, h_ini)
                                    sec_key = (sec.id, dia, h_ini)
                                    if doc_key not in doc_busy_slots and sec_key not in sec_busy_slots:
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

                # 10. Evaluaciones
                evaluaciones_to_create = []
                for p in todos_periodos:
                    for cur in todos_cursos:
                        evaluaciones_to_create.append(Evaluacion(curso=cur, periodo=p, tipo="Examen de Unidad", peso=0.50))
                        evaluaciones_to_create.append(Evaluacion(curso=cur, periodo=p, tipo="Practicas de Clase", peso=0.30))
                        evaluaciones_to_create.append(Evaluacion(curso=cur, periodo=p, tipo="Proyecto Grupal", peso=0.20))
                Evaluacion.objects.bulk_create(evaluaciones_to_create)
                todas_evaluaciones = list(Evaluacion.objects.filter(curso__institucion=inst))

                eval_map = {}
                for ev in todas_evaluaciones:
                    key = (ev.periodo_id, ev.curso_id)
                    if key not in eval_map:
                        eval_map[key] = []
                    eval_map[key].append(ev)

                # 11. Differentiated Grade Profiles (2024, 2025, 2026)
                self.stdout.write(f"Generando calificaciones diferenciadas (2024-2026) para {inst.nombre}...")
                notas_to_create = []
                promedios_to_create = []
                libretas_to_create = []

                # Setup year-specific profile centers to fulfill user differentiation request
                # 2024: Low Performance (Salida de crisis)
                # 2025: High Performance (Éxito total)
                # 2026: Medium-to-Low challenging Performance (Retos pedagógicos)
                
                estudiante_perfiles = {}
                for idx, student in enumerate(todos_estudiantes):
                    perfil = idx % 5
                    estudiante_perfiles[student.id] = perfil

                for idx, matr in enumerate(todas_matriculas):
                    student = matr.estudiante
                    year = matr.periodo.anio
                    perfil = estudiante_perfiles[student.id]

                    # Base grade center according to year
                    if year == 2024:
                        # Differentiated behavior 2024: General lower grades (avg ~ 11.5)
                        if perfil == 0:
                            base = random.uniform(13.5, 15.0)
                        elif perfil in [1, 2, 3]:
                            base = random.uniform(10.0, 12.8)
                        else:
                            base = random.uniform(7.0, 10.0) # Highly critical desaprobados
                    elif year == 2025:
                        # Differentiated behavior 2025: Outstanding academic excellence! (avg ~ 15.8)
                        if perfil == 0:
                            base = random.uniform(17.5, 19.5)
                        elif perfil in [1, 2, 3]:
                            base = random.uniform(14.0, 16.8)
                        else:
                            base = random.uniform(12.0, 13.8) # Almost nobody fails!
                    else: # year == 2026
                        # Differentiated behavior 2026: Mid-level with targeted course challenges (avg ~ 12.8)
                        if perfil == 0:
                            base = random.uniform(15.0, 17.5)
                        elif perfil in [1, 2, 3]:
                            base = random.uniform(11.5, 14.5)
                        else:
                            base = random.uniform(8.0, 10.5)

                    year_periods = [p for p in todos_periodos if p.anio == year]

                    for per in year_periods:
                        # For 2026 (current year), since we are in May, only Bimestre 1 is fully complete!
                        # Bimestres 2, 3, and 4 do not have completed averages yet!
                        if year == 2026 and per.bimestre in ["2° Bimestre", "3° Bimestre", "4° Bimestre"]:
                            continue

                        libretas_to_create.append(Libreta(estudiante=student, periodo=per))
                        for cur in todos_cursos:
                            evs = eval_map.get((per.id, cur.id), [])
                            if not evs:
                                continue

                            weighted_sum = 0.0
                            for ev in evs:
                                calif = base + random.uniform(-1.5, 1.5)
                                # Extra challenge in Mathematics and Computers for 2026
                                if year == 2026 and cur.nombre in ["Matematica", "Computacion"]:
                                    calif -= 1.8
                                calif = round(max(0.0, min(20.0, calif)), 1)
                                
                                notas_to_create.append(Nota(
                                    evaluacion=ev,
                                    estudiante=student,
                                    calificacion=calif
                                ))
                                weighted_sum += calif * float(ev.peso)

                            final_avg = round(weighted_sum, 2)
                            promedios_to_create.append(Promedio(
                                  estudiante=student,
                                  curso=cur,
                                  periodo=per,
                                  promedio=final_avg
                            ))

                    if len(notas_to_create) > 5000:
                        Nota.objects.bulk_create(notas_to_create)
                        notas_to_create = []
                    if len(promedios_to_create) > 3000:
                        Promedio.objects.bulk_create(promedios_to_create)
                        promedios_to_create = []

                if notas_to_create:
                    Nota.objects.bulk_create(notas_to_create)
                if promedios_to_create:
                    Promedio.objects.bulk_create(promedios_to_create)
                Libreta.objects.bulk_create(libretas_to_create)

                # 12. Asistencias Diarias Diferenciadas
                self.stdout.write(f"Construyendo diario de asistencia multianual (2024-2026)...")
                asistencias_to_create = []
                
                hoy = date(2026, 5, 28) # Matching system current time
                
                dias_laborables = []
                for year in [2024, 2025, 2026]:
                    start_date = date(year, 3, 1)
                    end_date = date(year, 11, 30)
                    curr = start_date
                    while curr <= end_date:
                        if curr.weekday() < 5 and curr <= hoy: # Up to today (May 2026)
                            dias_laborables.append(curr)
                        curr += timedelta(days=1)

                for d in dias_laborables:
                    # Year-specific attendance ratios (user differentiation)
                    if d.year == 2024:
                        # 2024: Differentiated high absenteeism (low attendance!)
                        p_present, p_late, p_excuse = 0.82, 0.10, 0.03
                    elif d.year == 2025:
                        # 2025: Outstanding high presence!
                        p_present, p_late, p_excuse = 0.96, 0.03, 0.005
                    else:
                        # 2026: Standard/Average presence
                        p_present, p_late, p_excuse = 0.90, 0.07, 0.01

                    # Only seed full attendance for:
                    # - 2026 (March, April, May)
                    # - 2025 (Whole year)
                    # - 2024 (Last 3 months: Sept, Oct, Nov to optimize SQLite performance)
                    if d.year == 2024 and d.month < 9:
                        continue

                    for student in todos_estudiantes:
                        perf_base = estudiante_perfiles[student.id]
                        rand = random.random()
                        
                        # Adjust probability according to student risk profile
                        prob_p = p_present
                        prob_t = p_late
                        prob_fj = p_excuse
                        if perf_base == 4: # High Risk student
                            prob_p -= 0.12
                            prob_t += 0.08

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
                            observacion="Asistencia normal de clase" if state == "P" else "Registro diario"
                        ))

                    if len(asistencias_to_create) > 8000:
                        Asistencia.objects.bulk_create(asistencias_to_create)
                        asistencias_to_create = []

                if asistencias_to_create:
                    Asistencia.objects.bulk_create(asistencias_to_create)

                # Justificaciones
                justificaciones_to_create = []
                fj_asistencias = list(Asistencia.objects.filter(estudiante__institucion=inst, estado="FJ")[:60])
                for excuse in fj_asistencias:
                    justificaciones_to_create.append(Justificacion(
                        asistencia=excuse,
                        motivo="Descanso médico o justificación familiar oficial.",
                        documento="https://sibes360.pe/storage/med/certificado.pdf",
                        estado="Aprobada"
                    ))
                Justificacion.objects.bulk_create(justificaciones_to_create)

                # 13. Módulo de Finanzas Diferenciadas (2024, 2025, 2026)
                self.stdout.write(f"Conciliando historial financiero multianual...")
                pensiones_to_create = []
                pagos_to_create = []
                meses_escolares = ["Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Setiembre", "Octubre", "Noviembre", "Diciembre"]

                for student in todos_estudiantes:
                    perf = estudiante_perfiles[student.id]

                    # 2024: S/ 400.00 - Fully Paid (Past Year)
                    pagos_to_create.append(Pago(
                        estudiante=student,
                        monto=380.00,
                        fecha=date(2024, 2, random.randint(15, 27)),
                        concepto="Matricula Anual 2024",
                        comprobante=f"MAT-2024-{acronym}-{student.id:04d}"
                    ))
                    for idx, mes in enumerate(meses_escolares):
                        pensiones_to_create.append(Pension(
                            estudiante=student,
                            periodo=f"{mes} 2024",
                            monto=400.00,
                            estado="Pagado"
                        ))

                    # 2025: S/ 420.00 - Fully Paid (Past Year)
                    pagos_to_create.append(Pago(
                        estudiante=student,
                        monto=400.00,
                        fecha=date(2025, 2, random.randint(15, 27)),
                        concepto="Matricula Anual 2025",
                        comprobante=f"MAT-2025-{acronym}-{student.id:04d}"
                    ))
                    for idx, mes in enumerate(meses_escolares):
                        pensiones_to_create.append(Pension(
                            estudiante=student,
                            periodo=f"{mes} 2025",
                            monto=420.00,
                            estado="Pagado"
                        ))

                    # 2026: S/ 440.00 - Current active year (differentiated paid/vencido)
                    pagos_to_create.append(Pago(
                        estudiante=student,
                        monto=420.00,
                        fecha=date(2026, 2, random.randint(15, 27)),
                        concepto="Matricula Anual 2026",
                        comprobante=f"MAT-2026-{acronym}-{student.id:04d}"
                    ))
                    for idx, mes in enumerate(meses_escolares):
                        # March & April (0-1) -> Fully Paid
                        if idx <= 1:
                            state = "Pagado"
                        # May (Current Month) -> 85% paid, 15% Vencido (moroso)
                        elif idx == 2:
                            state = "Pagado" if (perf != 4 or random.random() < 0.30) else "Vencido"
                        # June to December (Future Months) -> Pendiente
                        else:
                            state = "Pendiente"

                        pensiones_to_create.append(Pension(
                            estudiante=student,
                            periodo=f"{mes} 2026",
                            monto=440.00,
                            estado=state
                        ))

                Pension.objects.bulk_create(pensiones_to_create)
                
                # Fetch created paid pensions to emit Pago receipts
                pensiones_pagadas = Pension.objects.filter(estudiante__institucion=inst, estado="Pagado")
                for pens in pensiones_pagadas:
                    mes_str, anio_str = pens.periodo.split()
                    anio = int(anio_str)
                    mes_idx = meses_escolares.index(mes_str)
                    
                    dia_mes = random.randint(1, 8)
                    p_date = date(anio, mes_idx + 3, dia_mes)
                    if p_date.weekday() >= 5:
                        p_date += timedelta(days=2)

                    pagos_to_create.append(Pago(
                        estudiante=pens.estudiante,
                        monto=pens.monto,
                        fecha=p_date,
                        concepto=f"Pension Mensual - {pens.periodo}",
                        comprobante=f"REC-{anio}-{acronym}-{pens.id:06d}"
                    ))

                    if len(pagos_to_create) > 4000:
                        Pago.objects.bulk_create(pagos_to_create)
                        pagos_to_create = []

                if pagos_to_create:
                    Pago.objects.bulk_create(pagos_to_create)

                # 14. Conducta, Alertas y Comunicaciones Diferenciadas
                self.stdout.write(f"Agregando bitacoras de conducta e incidencias...")
                conductas_to_create = []
                for student in todos_estudiantes:
                    perf = estudiante_perfiles[student.id]
                    # 2025: Differentiated Outstanding Behavior (lots of merits)
                    if perf in [0, 1] and random.random() < 0.45:
                        conductas_to_create.append(Conducta(
                            estudiante=student,
                            fecha=date(2025, random.randint(3, 10), random.randint(1, 28)),
                            tipo="Positiva",
                            descripcion="Alumno ejemplar. Colabora de forma activa en el orden del aula y apoyo académico a compañeros."
                        ))
                    
                    # 2024: Differentiated High Misconduct Warnings
                    if perf == 4 and random.random() < 0.60:
                        t_inc = "Grave" if random.random() < 0.35 else "Leve"
                        desc_inc = (
                            "Llegada tarde reiterada a clases y desatención a las explicaciones del docente en 2024." 
                            if t_inc == "Leve" else 
                            "Comportamiento inadecuado disruptivo reiterado y falta de respeto verbal a sus compañeros en 2024."
                        )
                        conductas_to_create.append(Conducta(
                            estudiante=student,
                            fecha=date(2024, random.randint(3, 10), random.randint(1, 28)),
                            tipo=t_inc,
                            descripcion=desc_inc
                        ))

                    # 2026: Normal active behavior warnings
                    if perf == 4 and random.random() < 0.35:
                        conductas_to_create.append(Conducta(
                            estudiante=student,
                            fecha=date(2026, random.randint(3, 5), random.randint(1, 28)),
                            tipo="Leve",
                            descripcion="Conversaciones reiteradas y desatención a indicaciones durante clases."
                        ))

                Conducta.objects.bulk_create(conductas_to_create)

                # Comunicados
                Comunicado.objects.create(
                    institucion=inst,
                    titulo=f"Inicio de Evaluaciones del Primer Trimestre 2026 - {acronym}",
                    mensaje="Estimados apoderados, les recordamos que el rol de evaluaciones finales ha sido publicado en la sección académica del portal."
                )

                # Alertas Coherentes
                alertas_to_create = []
                promedios_riesgo = Promedio.objects.filter(periodo=periodo_activo_2026, promedio__lt=11.0, estudiante__institucion=inst)
                for prom in promedios_riesgo:
                    alertas_to_create.append(Alerta(
                        estudiante=prom.estudiante,
                        tipo="Baja Calificacion",
                        descripcion=f"Riesgo Académico: Promedio desaprobatorio de {prom.promedio} registrado en {prom.curso.nombre}.",
                        estado="Activa"
                    ))

                pensiones_vencidas = Pension.objects.filter(estado="Vencido", estudiante__institucion=inst)
                for pens in pensiones_vencidas:
                    alertas_to_create.append(Alerta(
                        estudiante=pens.estudiante,
                        tipo="Pensiones Vencidas",
                        descripcion=f"Riesgo Financiero: Se registra mora en el pago de pensiones para el periodo {pens.periodo}.",
                        estado="Activa"
                    ))
                Alerta.objects.bulk_create(alertas_to_create)

        self.stdout.write(self.style.SUCCESS("--- ¡SEMINADO COMPLETADO CON ÉXITO Y COHERENCIA TOTAL! ---"))
