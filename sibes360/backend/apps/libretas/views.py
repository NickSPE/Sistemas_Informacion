from django.http import HttpResponse
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Libreta
from .serializers import LibretaSerializer
from notas.models import Promedio
from apoderados.models import Apoderado
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
import io

class LibretaViewSet(viewsets.ModelViewSet):
    queryset = Libreta.objects.all()
    serializer_class = LibretaSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Libreta.objects.none()

        rol = user.rol.nombre_rol if user.rol else None

        if rol == 'SuperAdmin':
            return Libreta.objects.all()
        elif rol in ['Director', 'Docente']:
            return Libreta.objects.filter(estudiante__institucion=user.institucion)
        elif rol == 'Apoderado':
            student_ids = Apoderado.objects.filter(correo=user.email).values_list('estudiante_id', flat=True)
            return Libreta.objects.filter(estudiante_id__in=student_ids)
        else:
            return Libreta.objects.none()

    @action(detail=True, methods=['get'], url_path='pdf')
    def pdf(self, request, pk=None):
        try:
            libreta = self.get_object()
        except Libreta.DoesNotExist:
            return Response({"error": "La libreta no existe"}, status=status.HTTP_404_NOT_FOUND)

        student = libreta.estudiante
        user = request.user
        
        # Security validation for Apoderado
        if user.is_authenticated and user.rol:
            rol = user.rol.nombre_rol
            if rol == 'Apoderado':
                student_ids = Apoderado.objects.filter(correo=user.email).values_list('estudiante_id', flat=True)
                if student.id not in student_ids:
                    return Response({"error": "No está autorizado para ver esta libreta"}, status=status.HTTP_403_FORBIDDEN)
            elif rol in ['Director', 'Docente']:
                if student.institucion != user.institucion:
                    return Response({"error": "No está autorizado para ver esta libreta"}, status=status.HTTP_403_FORBIDDEN)

        period = libreta.periodo
        school = student.institucion

        # Fetch Promedios for the student and period
        promedios = Promedio.objects.filter(estudiante=student, periodo=period)

        # Create memory buffer for PDF
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=30, leftMargin=30, topMargin=30, bottomMargin=30)
        story = []

        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            'TitleStyle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=22,
            leading=26,
            textColor=colors.HexColor('#1a1f36'),
            alignment=1 # Center
        )
        subtitle_style = ParagraphStyle(
            'SubtitleStyle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=12,
            leading=16,
            textColor=colors.HexColor('#8898aa'),
            alignment=1 # Center
        )
        section_style = ParagraphStyle(
            'SectionStyle',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=14,
            leading=18,
            textColor=colors.HexColor('#1a1f36'),
            spaceBefore=10,
            spaceAfter=10
        )
        text_style = ParagraphStyle(
            'TextStyle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            leading=14,
            textColor=colors.HexColor('#1a1f36')
        )

        # Title and Header
        story.append(Paragraph(f"SIBES 360 - LIBRETA DE NOTAS", title_style))
        story.append(Paragraph(f"{school.nombre}", subtitle_style))
        story.append(Spacer(1, 20))

        # Student Details Card
        details_data = [
            [Paragraph(f"<b>Estudiante:</b> {student.apellidos}, {student.nombres}", text_style), 
             Paragraph(f"<b>DNI:</b> {student.dni}", text_style)],
            [Paragraph(f"<b>Periodo:</b> {period.bimestre} {period.anio}", text_style), 
             Paragraph(f"<b>Fecha de Emisión:</b> {libreta.fecha_emision.strftime('%d/%m/%Y')}", text_style)]
        ]
        details_table = Table(details_data, colWidths=[270, 270])
        details_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f4f6fb')),
            ('PADDING', (0,0), (-1,-1), 10),
            ('BOTTOMPADDING', (0,0), (-1,-1), 10),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#8898aa')),
        ]))
        story.append(details_table)
        story.append(Spacer(1, 20))

        # Academic Performance Title
        story.append(Paragraph("Resumen de Calificaciones", section_style))

        # Grades Table
        grades_data = [
            ["Área / Curso", "Promedio Final", "Calificación (Letras / Escala)"]
        ]

        for p in promedios:
            score = float(p.promedio)
            # Define standard text description in Peru (0-20 scale)
            if score >= 18:
                desc = "AD (Logro Destacado)"
            elif score >= 14:
                desc = "A (Logro Previsto)"
            elif score >= 11:
                desc = "B (En Proceso)"
            else:
                desc = "C (En Inicio)"
            
            grades_data.append([p.curso.nombre, f"{score:.1f}", desc])

        if len(promedios) == 0:
            grades_data.append(["No hay calificaciones registradas para este periodo.", "-", "-"])

        grades_table = Table(grades_data, colWidths=[280, 100, 160])
        grades_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a1f36')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('ALIGN', (0, 1), (0, -1), 'LEFT'), # Left align subject names
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
            ('TOPPADDING', (0, 0), (-1, 0), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')]),
            ('PADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(grades_table)
        story.append(Spacer(1, 40))

        # Signatures
        sig_data = [
            ["_________________________", "_________________________"],
            ["Firma del Director", "Firma del Tutor/Docente"]
        ]
        sig_table = Table(sig_data, colWidths=[270, 270])
        sig_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 1), (-1, 1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 1), (-1, 1), 10),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#1a1f36')),
        ]))
        story.append(sig_table)

        # Build PDF
        doc.build(story)
        
        pdf_data = buffer.getvalue()
        buffer.close()

        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="Libreta_{student.dni}_{period.anio}.pdf"'
        response.write(pdf_data)
        
        return response
