import React, { useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, Tooltip as RechartsTooltip, BarChart, Bar, Legend } from 'recharts';
import EmptyChartState from '../components/EmptyChartState';

const QUADRANT_DATA = [
  { id: 'JPM', pe: 11.5, roe: 15.4, fill: '#3b82f6' },
  { id: 'BAC', pe: 10.2, roe: 11.1, fill: '#10b981' },
  { id: 'GS', pe: 14.8, roe: 10.5, fill: '#f59e0b' },
  { id: 'MS', pe: 13.9, roe: 13.2, fill: '#8b5cf6' },
  { id: 'C', pe: 7.8, roe: 6.8, fill: '#ef4444' },
];

const COMPARE_DATA = [
  { name: 'Tier 1 Capital', JPM: 13.1, BAC: 11.8, C: 13.4 },
  { name: 'Efficiency Ratio', JPM: 58.2, BAC: 63.8, C: 68.5 },
];

const PeerBenchmarking = () => {
  const [tickers, setTickers] = useState(['JPM', 'BAC', 'C']);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="mb-6 border-b border-slate-800 pb-4">
         <h2 className="text-3xl font-black tracking-tight text-white mb-1">Peer Benchmarking</h2>
         <p className="text-slate-400 text-sm">Relative Valuation Quadrants & Side-by-Side SOW Comparisons.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Quadrant Chart */}
        <div className="premium-card flex flex-col h-[500px]">
          <h3 className="text-white font-bold mb-1 tracking-wide">Return vs Valuation Quadrant</h3>
          <p className="text-slate-500 text-xs italic mb-4">X = P/E Ratio (Lower is Cheaper), Y = Return on Equity (Higher is Better)</p>

          <div className="flex-1 w-full bg-slate-900 border border-slate-800 rounded-xl relative">
            {QUADRANT_DATA.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" dataKey="pe" name="P/E Ratio" stroke="#64748b" domain={[4, 18]} />
                  <YAxis type="number" dataKey="roe" name="ROE" stroke="#64748b" domain={[2, 20]} />
                  <RechartsTooltip cursor={{strokeDasharray:'3 3'}} content={({active, payload}) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                         <div className="bg-slate-800 border border-slate-700 p-2 rounded shadow text-sm">
                           <div className="font-bold text-white">{data.id}</div>
                           <div className="text-slate-400">P/E: <span className="text-blue-400">{data.pe}</span></div>
                           <div className="text-slate-400">ROE: <span className="text-emerald-400">{data.roe}%</span></div>
                         </div>
                      )
                    }
                    return null;
                  }}/>
                  {/* Quadrant Lines (Means) */}
                  <ReferenceLine x={11} stroke="#ef4444" strokeDasharray="3 3" />
                  <ReferenceLine y={11} stroke="#ef4444" strokeDasharray="3 3" />
                  
                  <Scatter data={QUADRANT_DATA} shape={(props) => {
                    const { cx, cy, payload } = props;
                    return (
                       <g>
                         <circle cx={cx} cy={cy} r={8} fill={payload.fill} fillOpacity={0.8} stroke={payload.fill} strokeWidth={2}/>
                         <text x={cx} y={cy - 12} textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="bold">{payload.id}</text>
                       </g>
                    );
                  }}/>
                </ScatterChart>
              </ResponsiveContainer>
            ) : (
                <EmptyChartState message="No quadrant data" subtitle="Peer valuation quadrants cannot be generated without sufficient data points." height="100%" />
            )}
            
            {/* Quadrant Labels */}
            <div className="absolute top-4 left-10 text-[10px] font-bold text-emerald-500/50 uppercase">Value / High Return (Buy Target)</div>
            <div className="absolute top-4 right-4 text-[10px] font-bold text-slate-500/50 uppercase">Premium / High Return</div>
            <div className="absolute bottom-10 left-10 text-[10px] font-bold text-slate-500/50 uppercase">Value Trap / Low Return</div>
            <div className="absolute bottom-10 right-4 text-[10px] font-bold text-rose-500/50 uppercase">Expensive / Low Return (Avoid)</div>
          </div>
        </div>

        {/* Side-by-Side Compare */}
        <div className="premium-card flex flex-col h-[500px]">
          <div className="flex justify-between items-center mb-1">
             <h3 className="text-white font-bold tracking-wide">Direct Structural Comparison</h3>
             <div className="flex gap-2">
                {tickers.map(t => <span key={t} className="bg-slate-800 text-xs font-bold px-2 py-1 rounded text-slate-300">{t}</span>)}
                <button className="bg-slate-800 text-xs font-bold px-2 py-1 rounded text-emerald-400 hover:bg-slate-700 transition">Edit</button>
             </div>
          </div>
          <p className="text-slate-500 text-xs italic mb-4">Tier 1 Capital vs Efficiency Ratio (Banking SOW)</p>

          <div className="flex-1 w-full mt-8">
            {COMPARE_DATA.length > 0 ? (
              <ResponsiveContainer width="100%" height="80%">
                <BarChart data={COMPARE_DATA} margin={{ top: 20, right: 0, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" axisLine={false} tickLine={false}/>
                  <YAxis stroke="#64748b" axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                  <RechartsTooltip cursor={{fill: '#1e293b'}} contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc'}}/>
                  <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}}/>
                  <Bar dataKey="JPM" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                  <Bar dataKey="BAC" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                  <Bar dataKey="C" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
                <EmptyChartState message="No comparison data" subtitle="Direct structural comparison is currently unavailable for these peers." height="100%" />
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PeerBenchmarking;
