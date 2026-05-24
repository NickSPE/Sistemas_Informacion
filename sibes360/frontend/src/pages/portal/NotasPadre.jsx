import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function NotasPadre() {
  const [data, setData] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  
  useEffect(() => {
    axios.get('http://localhost:8000/api/notas/', { 
      headers: { Authorization: `Bearer ${localStorage.getItem('sibes360_token')}` } 
    })
    .then(res => setData(res.data))
    .catch(err => console.error(err));
  }, []);

  // Agrupar los datos por estudiante
  const groupedData = data.reduce((acc, item) => {
    const studentName = item.estudiante_nombres 
      ? `${item.estudiante_nombres} ${item.estudiante_apellidos}` 
      : `Estudiante #${item.estudiante || 'Desconocido'}`;
      
    if (!acc[studentName]) acc[studentName] = [];
    acc[studentName].push(item);
    return acc;
  }, {});

  const studentNames = Object.keys(groupedData);

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-extrabold text-slate-800 mb-6 pb-4 border-b border-indigo-100 flex items-center">
          <span className="text-4xl mr-3">🎓</span> 
          Calificaciones
        </h2>
        
        {studentNames.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            
            {/* PESTAÑAS (TABS) PARA SELECCIONAR ESTUDIANTE */}
            <div className="flex flex-wrap border-b border-slate-200 bg-slate-50">
              {studentNames.map((name, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTab(index)}
                  className={`flex items-center px-6 py-4 text-sm font-bold transition-colors ${
                    activeTab === index 
                      ? 'bg-white border-t-2 border-t-indigo-600 text-indigo-700 w-full md:w-auto relative top-[1px]' 
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 w-full md:w-auto'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                    activeTab === index ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {name.charAt(0)}
                  </div>
                  {name}
                </button>
              ))}
            </div>

            {/* CONTENIDO DE LA PESTAÑA ACTIVA */}
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-800">
                   Registros de {studentNames[activeTab]}
                </h3>
                <span className="bg-indigo-100 text-indigo-800 py-1 px-3 rounded-lg text-sm font-semibold">
                  {groupedData[studentNames[activeTab]].length} registros
                </span>
              </div>
              
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-full text-sm text-left border-collapse">
                  <thead className="bg-slate-50">
                    <tr className="border-b-2 border-slate-200 text-slate-500 uppercase tracking-wider text-xs">
                      <th className="py-4 px-4 font-bold text-slate-700">Curso</th>
<th className="py-4 px-4 font-bold text-slate-700">Evaluación</th>
<th className="py-4 px-4 font-bold text-slate-700 text-center">Calificación</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {groupedData[studentNames[activeTab]].map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-4 font-medium text-slate-800">{item.curso_nombre || '-'}</td>
<td className="py-4 px-4 text-slate-600">{item.evaluacion_tipo || '-'}</td>
<td className="py-4 px-4 text-center">
<span className={`inline-block font-bold px-4 py-1.5 rounded-lg border ${parseFloat(item.calificacion) >= 11 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
{item.calificacion}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-16 rounded-3xl shadow-sm border border-slate-100 text-center">
             <div className="text-slate-300 mb-4"><span className="text-7xl">📭</span></div>
             <h3 className="text-2xl font-bold text-slate-600 mb-2">No hay registros</h3>
             <p className="text-slate-400">Aún no se ha ingresado información para sus hijos.</p>
          </div>
        )}
      </div>
    </div>
  );
}
