from django.db import models

class Apoderado(models.Model):
    estudiantes = models.ManyToManyField(
        'estudiantes.Estudiante',
        related_name='apoderados'
    )
    nombres = models.CharField(max_length=200)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    correo = models.EmailField(blank=True, null=True)
    parentesco = models.CharField(max_length=50)
    usuario = models.OneToOneField(
        'usuarios.Usuario',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='apoderado_profile'
    )

    def __str__(self):
        return f"{self.nombres} ({self.parentesco})"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.correo and not self.usuario:
            from usuarios.models import Usuario, Rol
            rol_apoderado, _ = Rol.objects.get_or_create(nombre_rol='Apoderado')
            user, created = Usuario.objects.get_or_create(
                username=self.correo,
                defaults={'email': self.correo, 'rol': rol_apoderado}
            )
            if created:
                user.set_password('123456')
                user.save()
            
            Apoderado.objects.filter(pk=self.pk).update(usuario=user)
            self.usuario = user

