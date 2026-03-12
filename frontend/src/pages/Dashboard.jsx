import React, { useState } from 'react';
import { 
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, 
  LineChart, Line, Legend, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Cell
} from 'recharts';
import { Database, FileText, Target, Activity, ExternalLink, Bookmark, ShieldAlert, Award, TrendingUp, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EmptyChartState from '../components/EmptyChartState';

const MOCK_HEATMAP = [
  { name: 'Technology', roe: 25.4, growth: 18.2, cap: 12000, fill: '#3b82f6' },
  { name: 'Banking', roe: 12.5, growth: 6.8, cap: 8000, fill: '#10b981' },
  { name: 'Healthcare', roe: 18.2, growth: 11.5, cap: 6500, fill: '#f59e0b' },
  { name: 'Energy', roe: 21.0, growth: 4.2, cap: 4500, fill: '#ef4444' },
  { name: 'Retail', roe: 14.8, growth: 8.5, cap: 3500, fill: '#8b5cf6' },
  { name: 'Finance', roe: 15.2, growth: 9.1, cap: 5000, fill: '#0ea5e9' }
];

const MOCK_PEER = [
  { name: 'AAPL', evEbitda: 22.4, roe: 145, growth: 8.2, fill: '#3b82f6' },
  { name: 'MSFT', evEbitda: 24.1, roe: 39.5, growth: 11.5, fill: '#10b981' },
  { name: 'GOOGL', evEbitda: 14.5, roe: 28.2, growth: 10.1, fill: '#f59e0b' },
  { name: 'JPM', evEbitda: 10.2, roe: 15.4, growth: 8.5, fill: '#8b5cf6' },
  { name: 'BAC', evEbitda: 9.1, roe: 11.2, growth: 6.1, fill: '#ef4444' },
  { name: 'META', evEbitda: 13.5, roe: 32.1, growth: 16.4, fill: '#0ea5e9' }
];

const TREND_DATA = {
  '3Y': [
    { year: '2022', AAPL: 394, MSFT: 198, GOOGL: 282, JPM: 128, BAC: 94 },
    { year: '2023', AAPL: 383, MSFT: 211, GOOGL: 307, JPM: 158, BAC: 98 },
    { year: '2024', AAPL: 390, MSFT: 245, GOOGL: 330, JPM: 165, BAC: 102 }
  ],
  '5Y': [
    { year: '2020', AAPL: 274, MSFT: 143, GOOGL: 182, JPM: 119, BAC: 85 },
    { year: '2021', AAPL: 365, MSFT: 168, GOOGL: 257, JPM: 121, BAC: 89 },
    { year: '2022', AAPL: 394, MSFT: 198, GOOGL: 282, JPM: 128, BAC: 94 },
    { year: '2023', AAPL: 383, MSFT: 211, GOOGL: 307, JPM: 158, BAC: 98 },
    { year: '2024', AAPL: 390, MSFT: 245, GOOGL: 330, JPM: 165, BAC: 102 }
  ],
  '10Y': [
    { year: '2015', AAPL: 233, MSFT: 93, GOOGL: 74, JPM: 93, BAC: 82 },
    { year: '2017', AAPL: 229, MSFT: 90, GOOGL: 110, JPM: 99, BAC: 87 },
    { year: '2019', AAPL: 260, MSFT: 125, GOOGL: 161, JPM: 115, BAC: 91 },
    { year: '2021', AAPL: 365, MSFT: 168, GOOGL: 257, JPM: 121, BAC: 89 },
    { year: '2023', AAPL: 383, MSFT: 211, GOOGL: 307, JPM: 158, BAC: 98 },
    { year: '2024', AAPL: 390, MSFT: 245, GOOGL: 330, JPM: 165, BAC: 102 }
  ]
};

const MOCK_RADAR = [
  { subject: 'Financial Distress', score: 85, fullMark: 100 },
  { subject: 'Valuation Attract.', score: 72, fullMark: 100 },
  { subject: 'Market Position', score: 90, fullMark: 100 },
  { subject: 'Strategic Fit', score: 88, fullMark: 100 },
  { subject: 'Op. Efficiency', score: 78, fullMark: 100 }
];

const MOCK_TARGETS = [
  { rank: 1, ticker: 'GS', score: 92 },
  { rank: 2, ticker: 'SNAP', score: 88 },
  { rank: 3, ticker: 'AMD', score: 85 },
  { rank: 4, ticker: 'BAC', score: 80 },
  { rank: 5, ticker: 'COIN', score: 78 }
];

const MOCK_WATCHLIST = [
  { ticker: 'GS', price: '$412.00', score: 92, growth: '+15%' },
  { ticker: 'SNAP', price: '$11.50', score: 88, growth: '+10%' },
  { ticker: 'AMD', price: '$178.20', score: 85, growth: '+25%' },
  { ticker: 'BAC', price: '$34.10', score: 80, growth: '+5%' },
  { ticker: 'COIN', price: '$250.00', score: 78, growth: '+40%' }
];

const MOCK_FILINGS = [
  { company: 'AAPL', type: '10-K', date: '2025-10-31', status: 'Parsed' },
  { company: 'MSFT', type: '10-Q', date: '2025-07-28', status: 'Parsed' },
  { company: 'GOOGL', type: '8-K', date: '2025-05-12', status: 'Parsed' },
  { company: 'JPM', type: '10-K', date: '2025-02-25', status: 'Parsed' },
  { company: 'BAC', type: '10-Q', date: '2025-01-18', status: 'Parsed' },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState('5Y');

  return (
    <div className="animate-fade-in space-y-6 pb-12">
      <div className="flex justify-between items-end mb-4 border-b border-slate-800 pb-4">
        <div>
           <h2 className="text-3xl font-black tracking-tight text-white mb-1">Global Market Overview</h2>
           <p className="text-slate-400 text-sm">Aggregate Sector Intelligence and Market Health Analysis.</p>
        </div>
      </div>

      {/* TOP METRICS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="premium-card flex flex-col justify-center items-start border-b-4 border-b-blue-500 hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(59,130,246,0.5)] transition-all cursor-default">
          <div className="flex items-center gap-3 mb-2">
             <div className="p-2 bg-blue-500/10 rounded-lg"><Database size={20} className="text-blue-400"/></div>
             <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Companies Tracked</span>
          </div>
          <span className="text-4xl font-black text-white mt-2">4,285</span>
        </div>

        <div className="premium-card flex flex-col justify-center items-start border-b-4 border-b-emerald-500 hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(16,185,129,0.5)] transition-all cursor-default">
          <div className="flex items-center gap-3 mb-2">
             <div className="p-2 bg-emerald-500/10 rounded-lg"><FileText size={20} className="text-emerald-400"/></div>
             <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Filings Processed</span>
          </div>
          <span className="text-4xl font-black text-white mt-2">18,342</span>
        </div>
        
        <div className="premium-card flex flex-col justify-center items-start border-b-4 border-b-amber-500 hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(245,158,11,0.5)] transition-all cursor-default">
          <div className="flex items-center gap-3 mb-2">
             <div className="p-2 bg-amber-500/10 rounded-lg"><Target size={20} className="text-amber-400"/></div>
             <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Top Acq Sector</span>
          </div>
          <div className="flex items-end gap-3 mt-2">
             <span className="text-3xl font-black text-white">Technology</span>
             <span className="text-emerald-400 text-xs font-medium mb-1 font-mono">+12% YoY</span>
          </div>
        </div>

        <div className="premium-card flex flex-col justify-center items-start border-b-4 border-b-purple-500 hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(168,85,247,0.5)] transition-all cursor-default">
          <div className="flex items-center gap-3 mb-2">
             <div className="p-2 bg-purple-500/10 rounded-lg"><Activity size={20} className="text-purple-400 animate-pulse"/></div>
             <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Market Health Index</span>
          </div>
          <div className="flex items-end gap-3 mt-2">
             <span className="text-3xl font-black text-white">Stable</span>
             <span className="text-emerald-400 text-xs font-medium mb-1 font-mono">8.4% Return</span>
          </div>
        </div>
      </div>

      {/* ROW 2: Heatmap & Scatter */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="premium-card h-[420px] lg:col-span-6 flex flex-col">
          <h3 className="text-slate-300 font-bold mb-1 tracking-wide border-b border-slate-700/50 pb-2">Sector Heatmap</h3>
          <p className="text-xs text-slate-500 mb-4">X = Avg ROE, Y = Rev Growth, Bubble = Market Cap</p>
          <div className="flex-1 w-full relative">
            {MOCK_HEATMAP.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" dataKey="roe" name="Avg ROE" stroke="#64748b" tickFormatter={v => `${v}%`} />
                  <YAxis type="number" dataKey="growth" name="Rev Growth" stroke="#64748b" tickFormatter={v => `${v}%`} />
                  <ZAxis type="number" dataKey="cap" range={[200, 3000]} name="Market Cap" />
                  <RechartsTooltip cursor={{strokeDasharray: '3 3'}} content={({active, payload}) => {
                    if(active && payload && payload.length) {
                       const d = payload[0].payload;
                       return (
                         <div className="bg-slate-900 border border-slate-700 p-3 rounded shadow-xl text-sm">
                           <div className="font-bold text-white text-lg mb-1">{d.name}</div>
                           <div className="text-slate-400">Avg ROE: <span className="text-emerald-400 font-bold">{d.roe}%</span></div>
                           <div className="text-slate-400">Rev Growth: <span className="text-blue-400 font-bold">{d.growth}%</span></div>
                           <div className="text-slate-400 mt-1">Market Cap: <span className="text-white">${d.cap}B</span></div>
                         </div>
                       )
                    }
                    return null;
                  }}/>
                  <Scatter data={MOCK_HEATMAP}>
                    {MOCK_HEATMAP.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} fillOpacity={0.7} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartState message="No heatmap data" subtitle="Sector performance data is currently unavailable." height="100%" />
            )}
          </div>
        </div>

        <div className="premium-card h-[420px] lg:col-span-6 flex flex-col">
          <h3 className="text-slate-300 font-bold mb-1 tracking-wide border-b border-slate-700/50 pb-2">Peer Valuation vs Profitability</h3>
          <p className="text-xs text-slate-500 mb-4">X = EV/EBITDA, Y = Return on Equity (ROE)</p>
          <div className="flex-1 w-full relative">
            {MOCK_PEER.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" dataKey="evEbitda" name="EV/EBITDA" stroke="#64748b" tickFormatter={v => `${v}x`} />
                  <YAxis type="number" dataKey="roe" name="ROE" stroke="#64748b" tickFormatter={v => `${v}%`} />
                  <ZAxis type="number" dataKey="growth" range={[200, 200]} name="Growth" />
                  <RechartsTooltip cursor={{strokeDasharray: '3 3'}} content={({active, payload}) => {
                    if(active && payload && payload.length) {
                       const d = payload[0].payload;
                       return (
                         <div className="bg-slate-900 border border-slate-700 p-3 rounded shadow-xl text-sm">
                           <div className="font-bold text-white text-lg mb-1">{d.name}</div>
                           <div className="text-slate-400">EV/EBITDA: <span className="text-blue-400 font-bold">{d.evEbitda}x</span></div>
                           <div className="text-slate-400">ROE: <span className="text-emerald-400 font-bold">{d.roe}%</span></div>
                           <div className="text-slate-400 mt-1">Rev Growth: <span className="text-white">+{d.growth}%</span></div>
                         </div>
                       )
                    }
                    return null;
                  }}/>
                  <Scatter data={MOCK_PEER}>
                    {MOCK_PEER.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} fillOpacity={0.8} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartState message="No peer comparison data" subtitle="Peer financial metrics are not available for this analysis." height="100%" />
            )}
          </div>
        </div>
      </div>

      {/* ROW 3: Radar & Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="premium-card lg:col-span-4 flex flex-col h-[400px]">
          <h3 className="text-slate-300 font-bold mb-1 tracking-wide border-b border-slate-700/50 pb-2">Acquisition Readiness</h3>
          <p className="text-xs text-slate-500 mb-2">Automated rating index based on SEC structural analytics</p>
          <div className="flex-1 w-full relative">
             {MOCK_RADAR.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <RadarChart cx="50%" cy="50%" outerRadius="65%" data={MOCK_RADAR}>
                   <PolarGrid stroke="#334155" />
                   <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                   <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                   <Radar name="Market Avg" dataKey="score" stroke="#10b981" fill="#10b981" fillOpacity={0.4} strokeWidth={2} />
                 </RadarChart>
               </ResponsiveContainer>
             ) : (
               <EmptyChartState message="No radar data" subtitle="Acquisition readiness metrics are currently unavailable." height="100%" />
             )}
          </div>
        </div>

        <div className="premium-card lg:col-span-8 h-[400px] flex flex-col">
           <div className="flex justify-between items-center mb-1">
             <h3 className="text-slate-300 font-bold tracking-wide border-b border-slate-700/50 pb-2 w-full flex justify-between">
                {`Revenue Growth Trend (${period.replace('Y', ' Years')})`}
                <div className="flex gap-2">
                   {['3Y', '5Y', '10Y'].map(t => (
                      <button key={t} onClick={() => setPeriod(t)} className={`text-xs px-2 py-1 rounded font-mono font-bold transition-all ${period === t ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-slate-800 text-slate-500 hover:text-slate-300'}`}>
                         {t}
                      </button>
                   ))}
                </div>
             </h3>
           </div>
           
           <div className="flex-1 w-full relative mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={TREND_DATA[period]} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="year" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}B`} />
                  <RechartsTooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155'}} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                  <Line type="monotone" dataKey="AAPL" name="AAPL" stroke="#3b82f6" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="MSFT" name="MSFT" stroke="#10b981" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="GOOGL" name="GOOGL" stroke="#f59e0b" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="JPM" name="JPM" stroke="#8b5cf6" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="BAC" name="BAC" stroke="#ef4444" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
           </div>
        </div>
      </div>

      {/* ROW 4: Targets, Watchlist, Filings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
         {/* Top Acquisition Targets */}
         <div className="premium-card lg:col-span-4 flex flex-col h-[350px]">
           <h3 className="text-white font-bold mb-4 tracking-wide border-b border-slate-700/50 pb-2 flex items-center gap-2">
              <Award size={18} className="text-amber-400" /> Top Acquisition Targets
           </h3>
           <div className="flex-1 overflow-auto custom-scrollbar">
             <table className="w-full text-left">
               <thead>
                 <tr className="border-b border-slate-800 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                   <th className="py-2 px-2 text-center w-12">Rnk</th>
                   <th className="py-2 px-2 text-left">Ticker</th>
                   <th className="py-2 px-2 text-center">Score</th>
                 </tr>
               </thead>
               <tbody>
                 {MOCK_TARGETS.map((t, idx) => (
                   <tr key={idx} onClick={() => navigate(`/company/${t.ticker}`)} className="border-b border-slate-700/30 hover:bg-slate-800 transition-colors cursor-pointer group">
                     <td className="py-4 px-2 font-bold text-slate-500 text-center">#{t.rank}</td>
                     <td className="py-4 px-2 font-bold text-white group-hover:text-blue-400 text-left">{t.ticker}</td>
                     <td className="py-4 px-2 text-center">
                       <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-1 rounded text-sm font-bold shadow-sm">
                          {t.score}
                       </span>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         </div>

         {/* Watchlist */}
         <div className="premium-card lg:col-span-4 flex flex-col h-[350px]">
           <h3 className="text-white font-bold mb-4 tracking-wide border-b border-slate-700/50 pb-2 flex items-center gap-2">
              <Bookmark size={18} className="text-purple-400" /> Internal Watchlist
           </h3>
           <div className="flex-1 overflow-auto custom-scrollbar">
             <table className="w-full text-left">
               <thead>
                 <tr className="border-b border-slate-800 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                   <th className="py-2 px-2 text-left">Ticker</th>
                   <th className="py-2 px-2 text-right">Price</th>
                   <th className="py-2 px-2 text-right">Rev Grwth</th>
                 </tr>
               </thead>
               <tbody>
                 {MOCK_WATCHLIST.map((t, idx) => (
                   <tr key={idx} onClick={() => navigate(`/company/${t.ticker}`)} className="border-b border-slate-700/30 hover:bg-slate-800 transition-colors cursor-pointer group">
                     <td className="py-4 px-2 text-left">
                        <div className="font-bold text-white group-hover:text-blue-400">{t.ticker}</div>
                        <div className="text-slate-500 text-[10px] font-mono leading-none mt-1">Acq: {t.score}</div>
                     </td>
                     <td className="py-4 px-2 text-slate-300 font-mono text-sm text-right">{t.price}</td>
                     <td className="py-4 px-2 text-right">
                       <span className="text-emerald-400 font-bold text-sm bg-emerald-500/5 px-2 py-0.5 rounded">{t.growth}</span>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         </div>

         {/* Latest Filings */}
         <div className="premium-card lg:col-span-4 flex flex-col h-[350px]">
           <h3 className="text-white font-bold mb-4 tracking-wide border-b border-slate-700/50 pb-2 flex justify-between items-center">
              <span className="flex items-center gap-2"><ShieldAlert size={18} className="text-blue-400" /> Latest Filings</span>
              <button onClick={() => navigate('/filings')} className="text-xs text-blue-400 font-normal hover:text-blue-300">View All</button>
           </h3>
           <div className="flex-1 overflow-auto custom-scrollbar">
             <table className="w-full text-left">
               <thead>
                 <tr className="border-b border-slate-800 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                   <th className="py-2 px-2 text-left">Company</th>
                   <th className="py-2 px-2 text-center">Date</th>
                   <th className="py-2 px-2 text-center">Src</th>
                 </tr>
               </thead>
               <tbody>
                 {MOCK_FILINGS.map((row, idx) => (
                   <tr key={idx} className="border-b border-slate-700/30 transition-colors">
                     <td className="py-4 px-2 cursor-pointer group hover:bg-slate-800 rounded text-left" onClick={() => navigate(`/company/${row.company}`)}>
                        <div className="font-bold text-white group-hover:text-blue-400">{row.company}</div>
                        <div className="font-mono text-[10px] font-bold text-slate-400 mt-1">{row.type}</div>
                     </td>
                     <td className="py-4 px-2 text-slate-400 text-xs whitespace-nowrap text-center">{row.date}</td>
                     <td className="py-4 px-2 text-center">
                        <a href={`https://www.sec.gov/edgar/searchedgar/companysearch`} target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300 flex items-center justify-center gap-1 text-xs font-semibold bg-indigo-500/10 px-2 py-1 rounded transition-colors">
                           SEC <ExternalLink size={12}/>
                        </a>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
