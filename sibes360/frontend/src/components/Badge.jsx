import React from 'react';

const Badge = ({ type, text }) => {
  const getStyles = () => {
    switch (type?.toLowerCase()) {
      case 'p':
      case 'presente':
      case 'pagado':
      case 'activa':
      case 'positiva':
      case 'aprobada':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'f':
      case 'falta':
      case 'vencido':
      case 'grave':
      case 'rechazada':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 't':
      case 'tardanza':
      case 'pendiente':
      case 'leve':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'fj':
      case 'falta justificada':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${getStyles()}`}>
      {text || type}
    </span>
  );
};

export default Badge;
