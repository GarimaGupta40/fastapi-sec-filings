import React from 'react';

const FinancialMetrics = ({ data }) => {
  if (!data?.financial_metrics?.profitability) return null;

  const prof = data.financial_metrics.profitability;

  const formatPercent = (val) => val != null ? `${(val * 100).toFixed(2)}%` : 'N/A';
  const formatNum = (val) => val != null ? val.toFixed(2) : 'N/A';

  return (
    <div className="glass-panel p-6 animate-fade-in delay-100">
      <h2 className="text-xl font-bold mb-4 text-slate-300 tracking-wide">Key Metrics</h2>
      <div className="grid grid-cols-2 gap-4">
        
        <div className="premium-metric-card group">
          <div className="text-slate-400 text-xs uppercase tracking-wider mb-1 group-hover:text-blue-400 transition-colors">ROE</div>
          <div className="text-2xl font-bold text-white">{formatPercent(prof.roe)}</div>
        </div>
        
        <div className="premium-metric-card group">
          <div className="text-slate-400 text-xs uppercase tracking-wider mb-1 group-hover:text-amber-400 transition-colors">ROA</div>
          <div className="text-2xl font-bold text-white">{formatPercent(prof.roa)}</div>
        </div>
        
        <div className="premium-metric-card group">
          <div className="text-slate-400 text-xs uppercase tracking-wider mb-1 group-hover:text-emerald-400 transition-colors">EBITDA Margin</div>
          <div className="text-2xl font-bold text-white">{formatPercent(prof.ebitda_margin)}</div>
        </div>

        <div className="premium-metric-card group">
          <div className="text-slate-400 text-xs uppercase tracking-wider mb-1 group-hover:text-purple-400 transition-colors">EV / EBITDA</div>
          <div className="text-2xl font-bold text-white">{formatNum(data.financial_metrics.valuation?.ev_to_ebitda)}</div>
        </div>

      </div>
    </div>
  );
};

export default FinancialMetrics;
