import React, { useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Filter, ArrowUpDown } from 'lucide-react';

const MOCK_DATA = [
  { id: 'JPM', mktCap: 550, nim: 2.8, acqScore: 78, exchange: 'NYSE' },
  { id: 'BAC', mktCap: 300, nim: 2.1, acqScore: 82, exchange: 'NYSE' },
  { id: 'GS', mktCap: 120, nim: 1.5, acqScore: 65, exchange: 'NYSE' },
  { id: 'MS', mktCap: 140, nim: 1.8, acqScore: 71, exchange: 'NYSE' },
  { id: 'C', mktCap: 110, nim: 2.5, acqScore: 88, exchange: 'NYSE' },
  { id: 'HSBC', mktCap: 160, nim: 1.6, acqScore: 55, exchange: 'LSE' },
  { id: 'BARC', mktCap: 40, nim: 1.9, acqScore: 92, exchange: 'LSE' },
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl shrink-0 z-50">
        <p className="text-white font-bold text-lg mb-1">{data.id}</p>
        <p className="text-slate-400 text-sm">Market Cap: <span className="text-blue-400">${data.mktCap}B</span></p>
        <p className="text-slate-400 text-sm">NIM: <span className="text-emerald-400">{data.nim}%</span></p>
        <p className="text-slate-400 text-sm">Acquisition Score: <span className="text-amber-400">{data.acqScore}</span></p>
      </div>
    );
  }
  return null;
};

const MarketExplorer = () => {
  const [filterEx, setFilterEx] = useState('ALL');

  const filteredData = filterEx === 'ALL' ? MOCK_DATA : MOCK_DATA.filter(d => d.exchange === filterEx);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="mb-6 border-b border-slate-800 pb-4">
         <h2 className="text-3xl font-black tracking-tight text-white mb-1">Market Explorer</h2>
         <p className="text-slate-400 text-sm">Sector Heatmap & Screener targeting Banking and Investment Houses.</p>
      </div>

      <div className="premium-card mb-6">
        <div className="flex justify-between w-full mb-6">
           <h3 className="text-white font-bold">Sector Heatmap: Valuation & Margins</h3>
           <div className="text-xs text-slate-500 italic">X = Market Cap (Bubble Size), Y = Net Interest Margin (NIM)</div>
        </div>

        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" dataKey="mktCap" name="Market Cap" stroke="#64748b" tickFormatter={v => `$${v}B`} />
              <YAxis type="number" dataKey="nim" name="NIM" stroke="#64748b" tickFormatter={v => `${v}%`} />
              <ZAxis type="number" dataKey="mktCap" range={[100, 2000]} name="Volume" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
              
              {/* Plotting points mapping color intensity to Acq Score */}
              <Scatter data={filteredData} fill="#10b981" shape={(props) => {
                 const { cx, cy, payload } = props;
                 const fill = payload.acqScore > 80 ? '#10b981' : payload.acqScore > 65 ? '#f59e0b' : '#ef4444';
                 return <circle cx={cx} cy={cy} r={Math.sqrt(payload.mktCap)*1.5} fill={fill} fillOpacity={0.6} stroke={fill} strokeWidth={2}/>
              }}/>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="premium-card">
         <div className="flex justify-between items-center mb-6">
           <h3 className="text-white font-bold flex items-center gap-2"><Filter size={16}/> Target Directory</h3>
           
           <div className="flex gap-4">
              <select className="bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded px-3 py-1 outline-none focus-emerald" onChange={(e) => setFilterEx(e.target.value)} value={filterEx}>
                <option value="ALL">All Exchanges</option>
                <option value="NYSE">NYSE</option>
                <option value="LSE">LSE</option>
              </select>
           </div>
         </div>

         <div className="overflow-x-auto w-full">
            <table className="w-full text-left">
               <thead>
                 <tr className="border-b border-slate-700/50">
                   <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1 cursor-pointer hover:text-white">Ticker <ArrowUpDown size={12}/></th>
                   <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Exchange</th>
                   <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Mkt Cap</th>
                   <th className="py-3 px-4 text-xs font-semibold text-slate-500 hover:text-emerald-400 cursor-pointer uppercase tracking-wider">Net Interest Margin (NIM)</th>
                   <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Acquisition Score</th>
                 </tr>
               </thead>
               <tbody>
                 {filteredData.map(row => (
                   <tr key={row.id} className="border-b border-slate-700/20 hover:bg-slate-800/50 transition-colors group">
                     <td className="py-4 px-4 font-bold text-blue-400 group-hover:text-blue-300 transition-colors"><a href={`/intelligence/${row.id}`}>{row.id}</a></td>
                     <td className="py-4 px-4 text-slate-400 text-sm border border-slate-700/50 max-w-fit px-1 m-1 bg-slate-900 rounded">{row.exchange}</td>
                     <td className="py-4 px-4 text-slate-200">${row.mktCap}B</td>
                     <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded text-sm font-semibold ${row.nim > 2.0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'text-slate-300'}`}>
                           {row.nim}% {row.nim > 2.0 && '🔥'}
                        </span>
                     </td>
                     <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2 text-sm font-bold">
                           <span className={row.acqScore > 80 ? "text-emerald-400": "text-slate-300"}>{row.acqScore}</span>
                           <div className="w-12 h-1 bg-slate-700 rounded-full"><div className="h-full bg-blue-500 rounded-full" style={{width: `${row.acqScore}%`}}/></div>
                        </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default MarketExplorer;
