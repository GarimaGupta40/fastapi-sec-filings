import React from 'react';

const TrendChart = ({ data }) => {
  if (!data) return null;

  return (
    <div className="glass-panel p-6 animate-fade-in delay-200">
      <h2 className="text-xl font-bold mb-4 text-slate-300 tracking-wide">Trend Analysis</h2>
      
      <div className="flex flex-col gap-4">
        
        <div className="flex items-center justify-between p-4 bg-slate-800/40 rounded-xl hover:bg-slate-700/60 transition-colors border-l-4 border-emerald-500">
          <div>
            <div className="text-slate-400 text-sm uppercase font-semibold tracking-wider">Revenue CAGR</div>
            <div className={`mt-1 font-bold ${data.revenue_trend === 'growing' ? 'text-emerald-400' : 'text-rose-400'}`}>
              <span className="capitalize">{data.revenue_trend || "N/A"}</span>
              {data.revenue_cagr && <span className="ml-2 text-slate-300 opacity-80 text-sm">({(data.revenue_cagr * 100).toFixed(1)}%)</span>}
            </div>
          </div>
          {data.revenue_trend === 'growing' ? (
            <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
            </svg>
          )}
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-800/40 rounded-xl hover:bg-slate-700/60 transition-colors border-l-4 border-blue-500">
          <div>
            <div className="text-slate-400 text-sm uppercase font-semibold tracking-wider">Net Income CAGR</div>
            <div className={`mt-1 font-bold ${data.net_income_trend === 'growing' ? 'text-blue-400' : 'text-rose-400'}`}>
              <span className="capitalize">{data.net_income_trend || "N/A"}</span>
              {data.net_income_cagr && <span className="ml-2 text-slate-300 opacity-80 text-sm">({(data.net_income_cagr * 100).toFixed(1)}%)</span>}
            </div>
          </div>
          {data.net_income_trend === 'growing' ? (
             <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
             </svg>
          ) : (
             <svg className="w-8 h-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
             </svg>
          )}
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-800/40 rounded-xl hover:bg-slate-700/60 transition-colors border-l-4 border-amber-500">
          <div>
            <div className="text-slate-400 text-sm uppercase font-semibold tracking-wider">FCF Trend</div>
            <div className={`mt-1 font-bold ${data.free_cash_flow_trend === 'growing' ? 'text-amber-400' : 'text-rose-400'}`}>
              <span className="capitalize">{data.free_cash_flow_trend || "N/A"}</span>
            </div>
          </div>
          {data.free_cash_flow_trend === 'growing' ? (
             <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
             </svg>
          ) : (
             <svg className="w-8 h-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
             </svg>
          )}
        </div>

      </div>
    </div>
  );
};

export default TrendChart;
