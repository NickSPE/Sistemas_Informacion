import os

files = ['AsistenciaPadre.jsx', 'NotasPadre.jsx', 'ConductaPadre.jsx', 'PagosPadre.jsx']
base_dir = r"c:\Users\juan9\OneDrive\Desktop\ciclo 7\SISTEMAS DE INFORMACION\SIBES360\Sistemas_Informacion\sibes360\frontend\src\pages\portal"

for name in files:
    fpath = os.path.join(base_dir, name)
    content = open(fpath, "r", encoding="utf-8").read()
    
    # Let's just rewrite the whole file cleanly, since it's very short.
    path_suffix = name.lower().replace('padre.jsx', '')
    if path_suffix == 'asistencia':
        endpoint = 'asistencia'
    elif path_suffix == 'notas':
        endpoint = 'notas'
    elif path_suffix == 'conducta':
        endpoint = 'conducta'
    elif path_suffix == 'pagos':
        endpoint = 'pagos'
    else:
        endpoint = 'unknown'

    new_content = f"""import React, {{ useState, useEffect }} from 'react';
import axios from 'axios';

export default function {name.replace('.jsx', '')}() {{
  const [data, setData] = useState([]);
  
  useEffect(() => {{
    axios.get('http://localhost:8000/api/{endpoint}/', {{ 
      headers: {{ Authorization: `Bearer ${{localStorage.getItem('token')}}` }} 
    }})
    .then(res => setData(res.data))
    .catch(err => console.error(err));
  }}, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">{name.replace('Padre.jsx', '').capitalize()}</h2>
      <pre className="bg-gray-100 p-4 rounded">{{JSON.stringify(data, null, 2)}}</pre>
    </div>
  );
}}
"""
    open(fpath, "w", encoding="utf-8").write(new_content)

print("Done generating components")
