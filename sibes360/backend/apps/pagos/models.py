from django.db import models

class Pago(models.Model):
    estudiante = models.ForeignKey(
        'estudiantes.Estudiante',
        on_delete=models.CASCADE,
        related_name='pagos'
    )
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    fecha = models.DateField(auto_now_add=True)
    concepto = models.CharField(max_length=200) # e.g. Matrícula, Cuota de ingreso, etc.
    comprobante = models.CharField(max_length=255, blank=True, null=True) # File path or invoice number

    def __str__(self):
        return f"Pago {self.concepto} - S/ {self.monto} ({self.estudiante})"

class Pension(models.Model):
    estudiante = models.ForeignKey(
        'estudiantes.Estudiante',
        on_delete=models.CASCADE,
        related_name='pensiones'
    )
    periodo = models.CharField(max_length=50) # e.g. Marzo 2025, Abril 2025
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    # Pendiente, Pagado, Vencido
    estado = models.CharField(max_length=20, default='Pendiente')

    def __str__(self):
        return f"Pensión {self.periodo} - S/ {self.monto} ({self.estado}) - {self.estudiante}"
