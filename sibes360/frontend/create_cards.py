import os

base_dir = r"c:\Users\juan9\OneDrive\Desktop\ciclo 7\SISTEMAS DE INFORMACION\SIBES360\Sistemas_Informacion\sibes360\frontend\src\pages\portal"

def make_component(name, title, icon, cols, rows):
    url_path = name.replace("Padre", "").lower()
    return f"""import React, {{ useState, useEffect }} from 'react';
import axios from 'axios';

export default function {name}() {{
  const [data, setData] = useState([]);
  
  useEffect(() => {{
    axios.get('http://localhost:8000/api/{url_path}/', {{ 
      headers: {{ Authorization: `Bearer ${{localStorage.getItem('sibes360_token')}}` }} 
    }})
    .then(res => setData(res.data))
    .catch(err => console.error(err));
  }}, []);

  // Agrupar los datos por estudiante para no mezclarlos en una sola lista
  const groupedData = data.reduce((acc, item) => {{
    const studentName = item.estudiante_nombres 
      ? `${{item.estudiante_nombres}} ${{item.estudiante_apellidos}}` 
      : `Estudiante #${{item.estudiante || 'Desconocido'}}`;
      
    if (!acc[studentName]) acc[studentName] = [];
    acc[studentName].push(item);
    return acc;
  }}, {{}});

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        
        <h2 className="text-3xl font-extrabold text-slate-800 mb-8 pb-4 border-b border-indigo-100 flex items-center">
          <span className="text-4xl mr-3">{icon}</span> 
          {title}
        </h2>
        
        {{Object.keys(groupedData).length > 0 ? (
          Object.entries(groupedData).map(([studentName, records], idx) => (
            <div key={{idx}} className="mb-10 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              
              {/* Tarjeta / Encabezado por cada Estudiante */}
              <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-white text-indigo-700 rounded-full flex items-center justify-center font-black text-xl mr-4 shadow-sm">
                    {{studentName.charAt(0)}}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{{studentName}}</h3>
                    <p className="text-indigo-200 text-sm">Resumen de {title.toLowerCase()}</p>
                  </div>
                </div>
                <div className="bg-indigo-800 text-indigo-100 px-3 py-1 rounded-lg text-sm font-semibold">
                  {{records.length}} registro(s)
                </div>
              </div>
              
              {/* Tabla individual del Estudiante */}
              <div className="overflow-x-auto p-4 md:p-6">
                <table className="min-w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-200 text-slate-500 uppercase tracking-wider text-xs">
                      {cols}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {{records.map((item) => (
                      <tr key={{item.id}} className="hover:bg-slate-50 transition-colors">
                        {rows}
                      </tr>
                    ))}}
                  </tbody>
                </table>
              </div>
              
            </div>
          ))
        ) : (
          <div className="bg-white p-16 rounded-3xl shadow-sm border border-slate-100 text-center">
            <div className="text-slate-300 mb-4"><span className="text-7xl">📭</span></div>
            <h3 className="text-2xl font-bold text-slate-600 mb-2">No hay registros</h3>
            <p className="text-slate-400">Aún no se ha ingresado información de {title.toLowerCase()} para sus hijos en este periodo.</p>
          </div>
        )}}
      </div>
    </div>
  );
}}
"""

notas = make_component(
    "NotasPadre", "Calificaciones y Notas", "🎓",
    """<th className="py-4 px-4 font-bold text-slate-700">Curso</th>
       <th className="py-4 px-4 font-bold text-slate-700">Evaluación</th>
       <th className="py-4 px-4 font-bold text-slate-700 text-center">Calificación</th>""",
    """<td className="py-4 px-4 font-medium text-slate-800">{item.curso_nombre || '-'}</td>
       <td className="py-4 px-4 text-slate-600">{item.evaluacion_tipo || '-'}</td>
       <td className="py-4 px-4 text-center">
         <span className={`inline-block font-bold px-4 py-1.5 rounded-lg border ${
            parseFloat(item.calificacion) >= 11 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
         }`}>
           {item.calificacion}
         </span>
       </td>"""
)

asistencia = make_component(
    "AsistenciaPadre", "Control de Asistencia", "📅",
    """<th className="py-4 px-4 font-bold text-slate-700">Fecha</th>
       <th className="py-4 px-4 font-bold text-slate-700 text-center">Estado</th>
       <th className="py-4 px-4 font-bold text-slate-700">Observación</th>""",
    """<td className="py-4 px-4 font-medium text-slate-700 whitespace-nowrap">{item.fecha}</td>
       <td className="py-4 px-4 text-center">
          <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border ${
            item.estado === 'P' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
            : item.estado === 'F' ? 'bg-rose-50 text-rose-700 border-rose-200'
            : item.estado === 'T' ? 'bg-amber-50 text-amber-700 border-amber-200'
            : 'bg-slate-100 text-slate-700 border-slate-200'
          }`}>
            {item.estado === 'P' ? 'Presente' : item.estado === 'F' ? 'Falta' : item.estado === 'T' ? 'Tardanza' : item.estado}
          </span>
       </td>
       <td className="py-4 px-4 text-slate-500 italic">{item.observacion || '-'}</td>"""
)

pagos = make_component(
    "PagosPadre", "Estado de Cuenta", "💳",
    """<th className="py-4 px-4 font-bold text-slate-700">Concepto</th>
       <th className="py-4 px-4 font-bold text-slate-700 text-left">Fecha de Pago</th>
       <th className="py-4 px-4 font-bold text-slate-700">Comprobante</th>
       <th className="py-4 px-4 font-bold text-slate-700 text-right">Monto</th>""",
    """<td className="py-4 px-4 font-medium text-slate-800">{item.concepto || 'Pensión Regular'}</td>
       <td className="py-4 px-4 text-slate-600 whitespace-nowrap">{item.fecha}</td>
       <td className="py-4 px-4 text-slate-400 font-mono text-xs">{item.comprobante || '(Sin comprobante)'}</td>
       <td className="py-4 px-4 text-right">
         <span className="font-extrabold text-teal-700 bg-teal-50 border border-teal-100 px-3 py-1.5 rounded-lg whitespace-nowrap">
           S/ {item.monto || '0.00'}
         </span>
       </td>"""
)

conducta = make_component(
    "ConductaPadre", "Reportes de Conducta", "🛡️",
    """<th className="py-4 px-4 font-bold text-slate-700">Fecha</th>
       <th className="py-4 px-4 font-bold text-slate-700 text-center">Clasificación</th>
       <th className="py-4 px-4 font-bold text-slate-700">Descripción del Suceso</th>""",
    """<td className="py-4 px-4 whitespace-nowrap font-medium text-slate-600">{item.fecha}</td>
       <td className="py-4 px-4 text-center">
         <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${
           (item.tipo || '').toLowerCase().includes('positiva') ? 'bg-blue-50 text-blue-700 border-blue-200' 
           : (item.tipo || '').toLowerCase().includes('grave') ? 'bg-red-50 text-red-700 border-red-200'
           : 'bg-orange-50 text-orange-700 border-orange-200'
         }`}>
           {item.tipo || 'General'}
         </span>
       </td>
       <td className="py-4 px-4 text-slate-600">{item.descripcion || '-'}</td>"""
)

with open(os.path.join(base_dir, 'NotasPadre.jsx'), 'w', encoding='utf-8') as f: f.write(notas)
with open(os.path.join(base_dir, 'AsistenciaPadre.jsx'), 'w', encoding='utf-8') as f: f.write(asistencia)
with open(os.path.join(base_dir, 'PagosPadre.jsx'), 'w', encoding='utf-8') as f: f.write(pagos)
with open(os.path.join(base_dir, 'ConductaPadre.jsx'), 'w', encoding='utf-8') as f: f.write(conducta)

print("Componentes generados con hermosas tarjetas separadas.")
