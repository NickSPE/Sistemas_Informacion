import os

base_dir = r"c:\Users\juan9\OneDrive\Desktop\ciclo 7\SISTEMAS DE INFORMACION\SIBES360\Sistemas_Informacion\sibes360\frontend\src\pages\portal"

notas_jsx = """import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function NotasPadre() {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    axios.get('http://localhost:8000/api/notas/', { 
      headers: { Authorization: `Bearer ${localStorage.getItem('sibes360_token')}` } 
    })
    .then(res => setData(res.data))
    .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md m-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">Calificaciones</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="py-3 px-4 text-left font-semibold">Estudiante</th>
              <th className="py-3 px-4 text-left font-semibold">Curso</th>
              <th className="py-3 px-4 text-left font-semibold">Tipo Evaluación</th>
              <th className="py-3 px-4 text-center font-semibold">Calificación</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {data.length > 0 ? data.map((item) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{item.estudiante_nombres} {item.estudiante_apellidos}</td>
                <td className="py-3 px-4">{item.curso_nombre}</td>
                <td className="py-3 px-4">{item.evaluacion_tipo}</td>
                <td className="py-3 px-4 text-center font-bold text-indigo-700">{item.calificacion}</td>
              </tr>
            )) : (
              <tr><td colSpan="4" className="py-4 text-center text-gray-500">No hay calificaciones registradas</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
"""

asistencia_jsx = """import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AsistenciaPadre() {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    axios.get('http://localhost:8000/api/asistencia/', { 
      headers: { Authorization: `Bearer ${localStorage.getItem('sibes360_token')}` } 
    })
    .then(res => setData(res.data))
    .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md m-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">Control de Asistencia</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="py-3 px-4 text-left font-semibold">Estudiante</th>
              <th className="py-3 px-4 text-left font-semibold">Fecha</th>
              <th className="py-3 px-4 text-center font-semibold">Estado</th>
              <th className="py-3 px-4 text-left font-semibold">Observación</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {data.length > 0 ? data.map((item) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{item.estudiante_nombres} {item.estudiante_apellidos}</td>
                <td className="py-3 px-4">{item.fecha}</td>
                <td className="py-3 px-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    item.estado === 'P' ? 'bg-green-100 text-green-800' 
                    : item.estado === 'F' ? 'bg-red-100 text-red-800'
                    : item.estado === 'T' ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                  }`}>
                    {item.estado === 'P' ? 'Presente' : item.estado === 'F' ? 'Falta' : item.estado === 'T' ? 'Tardanza' : item.estado}
                  </span>
                </td>
                <td className="py-3 px-4">{item.observacion || '-'}</td>
              </tr>
            )) : (
              <tr><td colSpan="4" className="py-4 text-center text-gray-500">No hay registros de asistencia</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
"""

pagos_jsx = """import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function PagosPadre() {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    axios.get('http://localhost:8000/api/pagos/', { 
      headers: { Authorization: `Bearer ${localStorage.getItem('sibes360_token')}` } 
    })
    .then(res => setData(res.data))
    .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md m-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">Estado de Cuenta</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="py-3 px-4 text-left font-semibold">Estudiante</th>
              <th className="py-3 px-4 text-left font-semibold">Concepto</th>
              <th className="py-3 px-4 text-left font-semibold">Fecha</th>
              <th className="py-3 px-4 text-left font-semibold">Comprobante</th>
              <th className="py-3 px-4 text-center font-semibold">Monto</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {data.length > 0 ? data.map((item) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{item.estudiante_nombres} {item.estudiante_apellidos}</td>
                <td className="py-3 px-4">{item.concepto}</td>
                <td className="py-3 px-4">{item.fecha}</td>
                <td className="py-3 px-4">{item.comprobante || '-'}</td>
                <td className="py-3 px-4 text-center font-bold text-green-700">S/ {item.monto}</td>
              </tr>
            )) : (
              <tr><td colSpan="5" className="py-4 text-center text-gray-500">No hay pagos registrados</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
"""

conducta_jsx = """import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ConductaPadre() {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    axios.get('http://localhost:8000/api/conducta/', { 
      headers: { Authorization: `Bearer ${localStorage.getItem('sibes360_token')}` } 
    })
    .then(res => setData(res.data))
    .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md m-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">Reportes de Conducta</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="py-3 px-4 text-left font-semibold">Estudiante</th>
              <th className="py-3 px-4 text-left font-semibold">Fecha</th>
              <th className="py-3 px-4 text-left font-semibold">Tipo</th>
              <th className="py-3 px-4 text-left font-semibold">Descripción</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {data.length > 0 ? data.map((item) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{item.estudiante_nombres} {item.estudiante_apellidos}</td>
                <td className="py-3 px-4">{item.fecha}</td>
                <td className="py-3 px-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    item.tipo.toLowerCase().includes('positiva') ? 'bg-green-100 text-green-800' 
                    : item.tipo.toLowerCase().includes('grave') ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {item.tipo}
                  </span>
                </td>
                <td className="py-3 px-4">{item.descripcion}</td>
              </tr>
            )) : (
              <tr><td colSpan="4" className="py-4 text-center text-gray-500">No hay reportes de conducta</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
"""

open(os.path.join(base_dir, 'NotasPadre.jsx'), 'w', encoding='utf-8').write(notas_jsx)
open(os.path.join(base_dir, 'AsistenciaPadre.jsx'), 'w', encoding='utf-8').write(asistencia_jsx)
open(os.path.join(base_dir, 'PagosPadre.jsx'), 'w', encoding='utf-8').write(pagos_jsx)
open(os.path.join(base_dir, 'ConductaPadre.jsx'), 'w', encoding='utf-8').write(conducta_jsx)
