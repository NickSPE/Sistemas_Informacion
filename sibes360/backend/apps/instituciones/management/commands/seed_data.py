import random
from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth import get_user_model
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
    help = 'Seeds SIBES 360 database with realistic Peruvian school data'

    def handle(self, *args, **kwargs):
        self.stdout.write("Starting database seeding...")

        # 1. Clean Database
        self.stdout.write("Cleaning existing database...")
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

        # 2. Create Roles
        self.stdout.write("Creating roles...")
        rol_admin = Rol.objects.create(nombre_rol="SuperAdmin", descripcion="Acceso total al sistema")
        rol_director = Rol.objects.create(nombre_rol="Director", descripcion="Gestión de una institución educativa")
        rol_docente = Rol.objects.create(nombre_rol="Docente", descripcion="Gestión académica y de alumnos")
        rol_apoderado = Rol.objects.create(nombre_rol="Apoderado", descripcion="Visualización del progreso del alumno")

        # 3. Create Institutions
        self.stdout.write("Creating institutions...")
        inst1 = InstitucionEducativa.objects.create(
            nombre="Colegio San Agustín de Lima",
            ruc="20123456789",
            direccion="Av. Javier Prado Este 980, San Isidro",
            telefono="014402010"
        )
        inst2 = InstitucionEducativa.objects.create(
            nombre="Colegio Inmaculada Concepción",
            ruc="20987654321",
            direccion="Av. Camino Real 450, Santiago de Surco",
            telefono="012713928"
        )
        inst3 = InstitucionEducativa.objects.create(
            nombre="Colegio Fe y Alegría N° 2",
            ruc="20555444332",
            direccion="Av. Las Flores 320, San Juan de Lurigancho",
            telefono="013881928"
        )

        # 4. Create Users
        self.stdout.write("Creating users...")
        # SuperAdmin
        admin_user = get_user_model().objects.create_superuser(
            username="admin",
            email="admin@sibes360.pe",
            password="adminpassword",
            first_name="Diego",
            last_name="Alvarado",
            rol=rol_admin,
            institucion=None
        )

        # Director Colegio San Agustín
        dir_user1 = get_user_model().objects.create_user(
            username="director1",
            email="director1@sanagustin.edu.pe",
            password="directorpassword",
            first_name="Francisco",
            last_name="Bolognesi",
            rol=rol_director,
            institucion=inst1
        )

        # Director Colegio Inmaculada
        dir_user2 = get_user_model().objects.create_user(
            username="director2",
            email="director2@inmaculada.edu.pe",
            password="directorpassword",
            first_name="Miguel",
            last_name="Grau",
            rol=rol_director,
            institucion=inst2
        )

        # 5. Create Academic Structure (Niveles, Grados, Secciones, Cursos, Periodos)
        self.stdout.write("Creating academic structure...")
        # San Agustin Academics
        nivel_primaria = NivelEducativo.objects.create(institucion=inst1, nombre="Primaria")
        nivel_secundaria = NivelEducativo.objects.create(institucion=inst1, nombre="Secundaria")

        grado_1p = Grado.objects.create(nivel=nivel_primaria, nombre="1er Grado")
        grado_2p = Grado.objects.create(nivel=nivel_primaria, nombre="2do Grado")
        grado_5s = Grado.objects.create(nivel=nivel_secundaria, nombre="5to Año")

        seccion_1p_a = Seccion.objects.create(grado=grado_1p, nombre="A")
        seccion_2p_a = Seccion.objects.create(grado=grado_2p, nombre="A")
        seccion_5s_a = Seccion.objects.create(grado=grado_5s, nombre="A")
        seccion_5s_b = Seccion.objects.create(grado=grado_5s, nombre="B")

        periodo_2025_1b = PeriodoAcademico.objects.create(institucion=inst1, anio=2025, bimestre="I Bimestre", estado=True)
        periodo_2025_2b = PeriodoAcademico.objects.create(institucion=inst1, anio=2025, bimestre="II Bimestre", estado=False)

        cursos_data = [
            ("Matemática", "Matemática"),
            ("Comunicación", "Comunicación"),
            ("Ciencia y Tecnología", "Ciencias"),
            ("Personal Social", "Ciencias Sociales"),
            ("Educación Física", "Deportes"),
            ("Arte y Cultura", "Arte"),
            ("Inglés", "Idiomas")
        ]
        cursos = []
        for name, area in cursos_data:
            cursos.append(Curso.objects.create(institucion=inst1, nombre=name, area=area))

        # 6. Create Teachers (Docentes) and their login credentials
        self.stdout.write("Creating teachers...")
        docentes_data = [
            ("72839201", "Ana María Flores", "Matemática"),
            ("71829302", "Juan Carlos Ramos", "Comunicación"),
            ("70819203", "Silvia Patricia Castro", "Ciencia y Tecnología"),
            ("69809104", "Luis Alberto Mendoza", "Personal Social"),
            ("68799005", "María Fernanda Ortiz", "Inglés"),
            ("67788906", "Roberto Carlos Quispe", "Educación Física"),
            ("66778807", "Gabriela Isabel Loli", "Arte y Cultura"),
            ("65768708", "Jorge Luis Valdivia", "Computación")
        ]
        docentes = []
        for idx, (dni, name, spec) in enumerate(docentes_data):
            doc = Docente.objects.create(
                institucion=inst1,
                dni=dni,
                nombres=name,
                especialidad=spec
            )
            docentes.append(doc)
            # Create user login for docente
            first, *last = name.split()
            username = f"docente{idx+1}"
            get_user_model().objects.create_user(
                username=username,
                email=f"{username}@sanagustin.edu.pe",
                password="docentepassword",
                first_name=first,
                last_name=" ".join(last),
                rol=rol_docente,
                institucion=inst1
            )

        # 7. Create 20 Peruvian Students and their Parents (Apoderados)
        self.stdout.write("Creating students and parents...")
        first_names = [
            "Mateo", "Sofía", "Thiago", "Camila", "Liam", "Valentina", "Lucas", "Luciana", "Benjamin", "María",
            "Santiago", "Isabella", "Sebastian", "Valeria", "Matías", "Mariana", "Alejandro", "Gabriela", "Daniel", "Daniela"
        ]
        last_names = [
            "Quispe", "Flores", "Huamán", "Rodriguez", "Mamani", "Diaz", "Gonzales", "Perez", "Torres", "Rojas",
            "Sanchez", "Ramirez", "Gomez", "Ruiz", "Hernandez", "Vargas", "Castillo", "Chavez", "Alvarez", "Morales"
        ]
        
        students = []
        parent_relations = ["Padre", "Madre", "Tío", "Tía", "Abuela", "Abuelo"]

        for i in range(20):
            dni = f"75{random.randint(100000, 999999)}"
            fn = first_names[i]
            ln = f"{last_names[i]} {last_names[(i+5)%20]}"
            birth_year = random.choice([2013, 2014, 2015, 2016, 2018])
            dob = date(birth_year, random.randint(1, 12), random.randint(1, 28))
            
            # Select institution (most in inst1, some in inst2/inst3)
            if i < 16:
                inst = inst1
            elif i == 16 or i == 17:
                inst = inst2
            else:
                inst = inst3

            stud = Estudiante.objects.create(
                institucion=inst,
                dni=dni,
                nombres=fn,
                apellidos=ln,
                fecha_nacimiento=dob
            )
            students.append(stud)

            # Create parent
            parent_fn = f"Carlos" if random.choice([True, False]) else f"Patricia"
            parent_name = f"{parent_fn} {last_names[i]}"
            phone = f"9{random.randint(10000000, 99999999)}"
            email = f"apoderado{i+1}@gmail.com"
            rel = random.choice(parent_relations)
            
            apoderado = Apoderado.objects.create(
                estudiante=stud,
                nombres=parent_name,
                telefono=phone,
                correo=email,
                parentesco=rel
            )
            
            # Create user for parent (for active login simulation)
            username = f"apoderado{i+1}"
            get_user_model().objects.create_user(
                username=username,
                email=email,
                password="apoderadopassword",
                first_name=parent_fn,
                last_name=last_names[i],
                rol=rol_apoderado,
                institucion=inst
            )

        # 8. Enroll students (Matrícula) in San Agustin (inst1)
        self.stdout.write("Enrolling students...")
        # 16 students in San Agustin. Let's enroll:
        # 6 in 1er Grado A
        # 5 in 2do Grado A
        # 5 in 5to Año A
        for idx, stud in enumerate(students[:16]):
            if idx < 6:
                grad = grado_1p
                secc = seccion_1p_a
            elif idx < 11:
                grad = grado_2p
                secc = seccion_2p_a
            else:
                grad = grado_5s
                secc = seccion_5s_a
            
            Matricula.objects.create(
                estudiante=stud,
                periodo=periodo_2025_1b,
                grado=grad,
                seccion=secc
            )

        # 9. Create Schedules (Horarios) for classes in inst1
        self.stdout.write("Creating class schedules...")
        days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]
        for idx, curso in enumerate(cursos):
            docente = docentes[idx % len(docentes)]
            # Schedule for 5to Año A
            Horario.objects.create(
                docente=docente,
                curso=curso,
                seccion=seccion_5s_a,
                dia=days[idx % len(days)],
                hora_inicio="08:00:00",
                hora_fin="09:30:00"
            )
            # Schedule for 2do Grado A
            Horario.objects.create(
                docente=docente,
                curso=curso,
                seccion=seccion_2p_a,
                dia=days[(idx + 1) % len(days)],
                hora_inicio="09:45:00",
                hora_fin="11:15:00"
            )

        # 10. Attendance (Asistencia) data for the last 5 days
        self.stdout.write("Seeding attendance records...")
        today = date.today()
        for offset in range(5):
            fecha = today - timedelta(days=offset)
            # Only weekdays
            if fecha.weekday() >= 5:
                continue
            for stud in students[:16]:
                # 90% attendance probability
                rand_val = random.random()
                if rand_val < 0.88:
                    estado = 'P' # Present
                elif rand_val < 0.94:
                    estado = 'T' # Late (Tardanza)
                elif rand_val < 0.97:
                    estado = 'FJ' # Excused absence (Falta Justificada)
                else:
                    estado = 'F' # Unexcused absence
                
                asist = Asistencia.objects.create(
                    estudiante=stud,
                    fecha=fecha,
                    estado=estado,
                    observacion="Llegó a tiempo" if estado == 'P' else "Incidente menor"
                )

                if estado == 'FJ':
                    Justificacion.objects.create(
                        asistencia=asist,
                        motivo="Falta por cita médica en Essalud",
                        documento="https://example.com/certificado_medico.pdf",
                        estado="Aprobada"
                    )

        # 11. Evaluations & Grades (Evaluaciones y Notas)
        self.stdout.write("Seeding academic evaluations and grades (0-20 scale)...")
        # Let's create 3 evaluations for each course in period 1
        for curso in cursos:
            eval_bimestral = Evaluacion.objects.create(
                curso=curso,
                periodo=periodo_2025_1b,
                tipo="Examen Bimestral",
                peso=0.40
            )
            eval_tarea = Evaluacion.objects.create(
                curso=curso,
                periodo=periodo_2025_1b,
                tipo="Tareas y Prácticas",
                peso=0.30
            )
            eval_proyecto = Evaluacion.objects.create(
                curso=curso,
                periodo=periodo_2025_1b,
                tipo="Proyecto Grupal",
                peso=0.30
            )

            # Insert grades for each student matriculated
            for stud in students[:16]:
                # Generate realistic grades (highly concentrated between 11 and 19, with occasional low/high grades)
                nota_bim = random.choices(
                    [18.5, 17.0, 16.0, 15.0, 14.0, 12.0, 11.0, 9.5, 19.0, 15.5],
                    weights=[10, 15, 20, 15, 10, 10, 5, 5, 5, 5]
                )[0]
                nota_tar = random.randint(11, 20)
                nota_proj = random.randint(12, 20)

                Nota.objects.create(evaluacion=eval_bimestral, estudiante=stud, calificacion=nota_bim)
                Nota.objects.create(evaluacion=eval_tarea, estudiante=stud, calificacion=nota_tar)
                Nota.objects.create(evaluacion=eval_proyecto, estudiante=stud, calificacion=nota_proj)

                # Calculate weighted average
                avg = float(nota_bim) * 0.40 + float(nota_tar) * 0.30 + float(nota_proj) * 0.30
                Promedio.objects.create(
                    estudiante=stud,
                    curso=curso,
                    periodo=periodo_2025_1b,
                    promedio=round(avg, 2)
                )

        # 12. Seeding payments (Pensiones y Pagos) in Peruvian Soles (S/)
        self.stdout.write("Seeding school fee payments in Soles (S/)...")
        months = ["Matrícula 2025", "Marzo 2025", "Abril 2025", "Mayo 2025"]
        for stud in students[:16]:
            # Matricula fee S/ 450
            Pension.objects.create(estudiante=stud, periodo="Matrícula 2025", monto=450.00, estado="Pagado")
            Pago.objects.create(estudiante=stud, monto=450.00, concepto="Matrícula Académica 2025", comprobante="B001-000492")

            # March pension S/ 600
            Pension.objects.create(estudiante=stud, periodo="Marzo 2025", monto=600.00, estado="Pagado")
            Pago.objects.create(estudiante=stud, monto=600.00, concepto="Pensión Mensual de Marzo", comprobante="B001-000673")

            # April pension S/ 600 (some pagado, some pendiente, some vencido)
            rand_state = random.choices(["Pagado", "Pendiente", "Vencido"], weights=[70, 20, 10])[0]
            Pension.objects.create(estudiante=stud, periodo="Abril 2025", monto=600.00, estado=rand_state)
            if rand_state == "Pagado":
                Pago.objects.create(estudiante=stud, monto=600.00, concepto="Pensión Mensual de Abril", comprobante="B001-000844")

            # May pension S/ 600
            rand_state_may = random.choices(["Pagado", "Pendiente"], weights=[40, 60])[0]
            Pension.objects.create(estudiante=stud, periodo="Mayo 2025", monto=600.00, estado=rand_state_may)
            if rand_state_may == "Pagado":
                Pago.objects.create(estudiante=stud, monto=600.00, concepto="Pensión Mensual de Mayo", comprobante="B001-001032")

        # 13. Seeding behavior logs (Conducta)
        self.stdout.write("Seeding student behavior records...")
        conductas_desc = [
            ("Positiva", "Participación destacada en la feria escolar de ciencias."),
            ("Leve", "Se le llamó la atención por conversar en clases de inglés."),
            ("Positiva", "Mostró compañerismo al ayudar a un compañero de aula lesionado."),
            ("Grave", "Llegó 45 minutos tarde y evadió la entrada sin justificar.")
        ]
        for i in range(5):
            stud = random.choice(students[:16])
            tipo, desc = random.choice(conductas_desc)
            Conducta.objects.create(
                estudiante=stud,
                fecha=today - timedelta(days=random.randint(1, 15)),
                tipo=tipo,
                descripcion=desc
            )

        # 14. Bulletins (Libretas) emission
        self.stdout.write("Seeding report card bulletin records...")
        for stud in students[:5]:
            Libreta.objects.create(
                estudiante=stud,
                periodo=periodo_2025_1b
            )

        # 15. Alerts (Alertas) trigger
        self.stdout.write("Creating school warning alerts...")
        # Check low averages
        low_promedios = Promedio.objects.filter(promedio__lt=11.0)
        for p in low_promedios[:3]:
            Alerta.objects.create(
                estudiante=p.estudiante,
                tipo="Bajo Rendimiento Académico",
                descripcion=f"El estudiante tiene un promedio desaprobatorio de {p.promedio} en {p.curso.nombre}.",
                estado="Activa"
            )
        # Check absences
        frequent_absences = Asistencia.objects.filter(estado='F')
        for f in frequent_absences[:2]:
            Alerta.objects.create(
                estudiante=f.estudiante,
                tipo="Inasistencia Injustificada",
                descripcion=f"El estudiante registró una inasistencia injustificada el día {f.fecha.strftime('%d/%m/%Y')}.",
                estado="Activa"
            )

        # 16. Notices & Parent Meetings (Comunicados y Citaciones)
        self.stdout.write("Seeding communications, notices, and meetings...")
        Comunicado.objects.create(
            institucion=inst1,
            titulo="Inicio de Evaluaciones Mensuales del I Bimestre",
            mensaje="Estimados padres de familia, se les recuerda que las evaluaciones mensuales inician el lunes 26. Agradecemos su apoyo en repasar los temas escolares."
        )
        Comunicado.objects.create(
            institucion=inst1,
            titulo="Simulacro Nacional de Sismos",
            mensaje="El colegio participará activamente del simulacro convocado por INDECI el día jueves a las 10:00 am. Se solicita que todos asistan con sus credenciales de seguridad."
        )

        for stud in students[:3]:
            apo = stud.apoderados.first()
            if apo:
                Citacion.objects.create(
                    estudiante=stud,
                    apoderado=apo,
                    fecha=timezone.now() + timedelta(days=3),
                    motivo="Entrevista con el tutor para revisar rendimiento académico general.",
                    asistencia="P"
                )

        # 17. Aggregated general reports (Reportes log)
        self.stdout.write("Logging report logs...")
        Reporte.objects.create(
            institucion=inst1,
            tipo="Estadísticas de Notas del Aula",
            usuario=dir_user1
        )
        Reporte.objects.create(
            institucion=inst1,
            tipo="Morosidad Mensual y Cobranza",
            usuario=dir_user1
        )

        self.stdout.write(self.style.SUCCESS("Database seeded successfully with Peruvian context data!"))
