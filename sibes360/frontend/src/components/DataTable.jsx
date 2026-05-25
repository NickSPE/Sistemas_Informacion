import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';

const DataTable = ({ columns, data, searchField, onAdd, addLabel, title }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = data.filter((item) => {
    if (!searchTerm || !searchField) return true;
    const value = item[searchField];
    return value ? String(value).toLowerCase().includes(searchTerm.toLowerCase()) : true;
  });

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col h-full">
      {/* Header bar */}
      <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-slate-50/20">
        <div>
          <h2 className="text-base font-bold text-[#1a1f36] tracking-tight">{title}</h2>
        </div>
        
        <div className="flex items-center gap-3">
          {searchField && (
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-[#8898aa]" size={16} />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-1.5 text-xs border border-slate-200 rounded-lg w-full sm:w-60 focus:outline-none focus:border-[#6c63ff] bg-white text-[#1a1f36] transition-all"
              />
            </div>
          )}
          
          {onAdd && (
            <button
              onClick={onAdd}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#6c63ff] hover:bg-[#5b52e0] text-white rounded-lg transition-all"
            >
              <Plus size={14} className="stroke-[2.5]" />
              {addLabel || 'Agregar'}
            </button>
          )}
        </div>
      </div>

      {/* Table grid */}
      <div className="overflow-x-auto flex-grow max-h-[500px]">
        <table className="w-full text-left border-collapse table-fixed min-w-[600px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className="px-5 py-3 text-xs font-bold text-[#8898aa] uppercase tracking-wider select-none"
                  style={{ width: col.width || 'auto' }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredData.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-slate-50/40 transition-colors group">
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className="px-5 py-2.5 text-xs text-[#1a1f36] truncate">
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
            
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-5 py-10 text-center text-xs text-[#8898aa]">
                  No se encontraron registros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
