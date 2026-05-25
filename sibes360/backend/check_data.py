from apps.usuarios.models import Usuario
from apps.apoderados.models import Apoderado
from apps.asistencia.models import Asistencia

user = Usuario.objects.filter(email='juan@gmail.com').first()
print('User:', user)
if user:
    print('Rol:', getattr(getattr(user, 'rol', None), 'nombre_rol', None))
    apo = Apoderado.objects.filter(usuario=user).first()
    print('Apoderado:', apo)
    if apo:
        print('Students:', apo.estudiantes.all())
        for student in apo.estudiantes.all():
            print('  Asistencias for', student.nombres, ':', Asistencia.objects.filter(estudiante=student).count())
            print('  Data:', list(Asistencia.objects.filter(estudiante=student).values()))
