import React from 'react';

const CompanyOverview = ({ data }) => {
  if (!data) return null;

  return (
    <div className="glass-panel p-6 animate-fade-in">
      <h2 className="text-xl font-bold mb-4 text-slate-300 tracking-wide">Company Overview</h2>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-lg">
          <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">Name</span>
          <span className="text-white font-semibold">{data.company_name}</span>
        </div>
        <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-lg">
          <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">Ticker</span>
          <span className="text-blue-400 font-bold bg-blue-500/10 px-3 py-1 rounded-md">{data.ticker}</span>
        </div>
        <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-lg">
          <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">SIC / Industry</span>
          <span className="text-slate-300 text-sm font-medium">{data.sic}</span>
        </div>
      </div>
    </div>
  );
};

export default CompanyOverview;
