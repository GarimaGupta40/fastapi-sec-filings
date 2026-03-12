import React from 'react';
import { BarChart2 } from 'lucide-react';

const EmptyChartState = ({ 
  message = "No data available", 
  subtitle = "Financial metrics are not available for this selection.", 
  height = "400px" 
}) => {
  return (
    <div 
      className="flex flex-col items-center justify-center w-full text-center p-8 animate-fade-in bg-slate-900/20 rounded-2xl border border-slate-800/50" 
      style={{ minHeight: height }}
    >
      <div className="p-4 bg-slate-800/40 rounded-full mb-4 border border-slate-700/30 shadow-inner">
        <BarChart2 size={32} className="text-slate-500" />
      </div>
      <h4 className="text-slate-200 font-bold text-lg mb-2 uppercase tracking-tight">{message}</h4>
      <p className="text-slate-500 text-sm max-w-[280px] mx-auto font-medium leading-relaxed">
        {subtitle}
      </p>
    </div>
  );
};

export default EmptyChartState;
