import React from 'react';

const KPICard = ({ title, value, subtitle, trend, trendType, icon: Icon, color = 'sibesPrimary' }) => {
  const getColorClass = () => {
    switch (color) {
      case 'danger':
        return 'text-[#ff6584] bg-red-50';
      case 'success':
        return 'text-[#2dce89] bg-emerald-50';
      case 'warning':
        return 'text-[#ffb236] bg-amber-50';
      default:
        return 'text-[#6c63ff] bg-indigo-50';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:translate-y-[-2px] transition-all duration-300 flex flex-col justify-between h-36">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-xs font-semibold text-[#8898aa] uppercase tracking-wider block mb-1">
            {title}
          </span>
          <span className="text-2xl font-bold text-[#1a1f36] tracking-tight">
            {value}
          </span>
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-lg ${getColorClass()} flex items-center justify-center`}>
            <Icon size={20} className="stroke-[2.5]" />
          </div>
        )}
      </div>
      
      <div className="mt-4 flex items-center text-xs font-medium">
        {trend && (
          <span className={`mr-1.5 font-bold ${
            trendType === 'up' ? 'text-[#2dce89]' : trendType === 'down' ? 'text-[#ff6584]' : 'text-slate-500'
          }`}>
            {trend}
          </span>
        )}
        <span className="text-slate-400">
          {subtitle || 'Última actualización'}
        </span>
      </div>
    </div>
  );
};

export default KPICard;
