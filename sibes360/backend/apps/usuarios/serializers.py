from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Usuario, Rol

class RolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rol
        fields = '__all__'

class UsuarioSerializer(serializers.ModelSerializer):
    rol_nombre = serializers.ReadOnlyField(source='rol.nombre_rol')
    institucion_nombre = serializers.ReadOnlyField(source='institucion.nombre')

    class Meta:
        model = Usuario
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'institucion', 'institucion_nombre', 'rol', 'rol_nombre', 'estado', 'password', 'dni']
        extra_kwargs = {
            'password': {'write_only': True, 'required': False}
        }

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = super().create(validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['username'] = user.username
        token['email'] = user.email
        token['rol'] = user.rol.nombre_rol if user.rol else None
        token['institucion'] = user.institucion.nombre if user.institucion else None
        token['institucion_id'] = user.institucion.id if user.institucion else None
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Check custom user active status
        if not self.user.estado:
            raise serializers.ValidationError({"detail": "Esta cuenta está desactivada por el administrador."})
            
        # Check parent institution active status
        if self.user.institucion and not self.user.institucion.estado:
            raise serializers.ValidationError({"detail": "La institución educativa de esta cuenta se encuentra suspendida."})

        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'rol': self.user.rol.nombre_rol if self.user.rol else None,
            'institucion': self.user.institucion.nombre if self.user.institucion else None,
            'institucion_id': self.user.institucion.id if self.user.institucion else None,
            'estado': self.user.estado
        }
        return data

