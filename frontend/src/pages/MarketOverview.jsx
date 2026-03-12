import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, TrendingUp, DollarSign, Award, AlertTriangle, Zap, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, Cell } from 'recharts';
import EmptyChartState from '../components/EmptyChartState';

const SCREENER_DATA = [
  { ticker: 'AAPL', name: 'Apple Inc.', sector: 'Technology', evEbitda: 22.4, roe: 145.0, revGrowth: 8.2, acqScore: 82 },
  { ticker: 'MSFT', name: 'Microsoft Corp.', sector: 'Technology', evEbitda: 24.1, roe: 39.5, revGrowth: 11.5, acqScore: 85 },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology', evEbitda: 14.5, roe: 23.6, revGrowth: 9.8, acqScore: 88 },
  { ticker: 'AMZN', name: 'Amazon.com', sector: 'Retail', evEbitda: 18.5, roe: 12.4, revGrowth: 11.0, acqScore: 84 },
  { ticker: 'META', name: 'Meta Platforms', sector: 'Technology', evEbitda: 12.4, roe: 18.5, revGrowth: -1.1, acqScore: 78 },
  { ticker: 'TSLA', name: 'Tesla Inc.', sector: 'Technology', evEbitda: 42.1, roe: 16.5, revGrowth: 18.8, acqScore: 72 },
  { ticker: 'JPM', name: 'JPMorgan Chase', sector: 'Banking', evEbitda: 10.2, roe: 15.4, revGrowth: 8.5, acqScore: 80 },
  { ticker: 'BAC', name: 'Bank of America', sector: 'Banking', evEbitda: 9.1, roe: 11.2, revGrowth: 6.1, acqScore: 78 },
  { ticker: 'GS', name: 'Goldman Sachs', sector: 'Banking', evEbitda: 11.4, roe: 14.8, revGrowth: 4.5, acqScore: 74 },
  { ticker: 'NVDA', name: 'NVIDIA Corp.', sector: 'Technology', evEbitda: 45.2, roe: 65.4, revGrowth: 125.8, acqScore: 91 },
];

const HISTOGRAM_DATA = [
  { range: '0-5x', count: 145 },
  { range: '5-10x', count: 830 },
  { range: '10-15x', count: 1250 },
  { range: '15-20x', count: 680 },
  { range: '20x+', count: 320 },
];

const SECTOR_VALUATION = [
  { sector: 'Technology', avgEv: 24.5, avgRoe: 32.4, avgRev: 14.2 },
  { sector: 'Healthcare', avgEv: 15.2, avgRoe: 18.5, avgRev: 6.8 },
  { sector: 'Retail', avgEv: 12.8, avgRoe: 22.1, avgRev: 8.5 },
  { sector: 'Energy', avgEv: 8.4, avgRoe: 26.5, avgRev: 2.1 },
  { sector: 'Banking', avgEv: 9.5, avgRoe: 14.2, avgRev: 5.4 },
];

const LEADERS_DATA = [
  { category: 'Highest Revenue', company: 'Walmart Inc. (WMT)', value: '$611.3B' },
  { category: 'Highest ROE', company: 'Apple Inc. (AAPL)', value: '145.0%' },
  { category: 'Highest Revenue Growth', company: 'NVIDIA Corp. (NVDA)', value: '+125.8%' },
];

const OUTLIERS_DATA = [
  { anomaly: 'High ROE / Low Valuation', company: 'Exxon Mobil (XOM)', detail: 'ROE 22.1% at 6.8x EV/EBITDA' },
  { anomaly: 'High Growth / Low Market Cap', company: 'Super Micro (SMCI)', detail: 'Rev +110% at <$40B Cap' },
  { anomaly: 'High Debt Risk Indicator', company: 'Spirit Airlines (SAVE)', detail: 'Altman Z-Score < 1.1' },
];

const SectorBadge = ({ sector }) => {
  const styles = {
    Technology: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    Banking: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    Retail: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    Healthcare: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    Energy: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
  };
  
  const selectedClass = styles[sector] || 'bg-slate-500/10 text-slate-400 border-slate-500/30';

  return (
    <span className={`px-2.5 py-1 rounded border text-[10px] font-bold uppercase tracking-wider ${selectedClass}`}>
      {sector}
    </span>
  );
};

const ScoreBadge = ({ score }) => {
  let color = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
  if (score >= 90) color = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]';
  else if (score >= 75) color = 'bg-emerald-400/10 text-emerald-400 border-emerald-400/30';
  else if (score >= 60) color = 'bg-amber-400/10 text-amber-400 border-amber-400/30';
  
  return <span className={`px-2 py-1 rounded text-xs font-bold font-mono border ${color}`}>{score}</span>;
}

const MarketOverview = () => {
  const navigate = useNavigate();

  const [sectorFilter, setSectorFilter] = useState('All');
  const [evFilter, setEvFilter] = useState('All');
  const [roeFilter, setRoeFilter] = useState('All');
  const [growthFilter, setGrowthFilter] = useState('All');

  const filteredData = useMemo(() => {
    return SCREENER_DATA.filter(c => {
      const matchSector = sectorFilter === 'All' || c.sector === sectorFilter;
      
      let matchEv = true;
      if (evFilter === '<10') matchEv = c.evEbitda < 10;
      else if (evFilter === '10-20') matchEv = c.evEbitda >= 10 && c.evEbitda <= 20;
      else if (evFilter === '>20') matchEv = c.evEbitda > 20;

      let matchRoe = true;
      if (roeFilter === '>20%') matchRoe = c.roe > 20;
      else if (roeFilter === '>10%') matchRoe = c.roe > 10;
      else if (roeFilter === '<10%') matchRoe = c.roe <= 10;

      let matchGrowth = true;
      if (growthFilter === '>20%') matchGrowth = c.revGrowth > 20;
      else if (growthFilter === '>0%') matchGrowth = c.revGrowth > 0;
      else if (growthFilter === '<0%') matchGrowth = c.revGrowth < 0;

      return matchSector && matchEv && matchRoe && matchGrowth;
    });
  }, [sectorFilter, evFilter, roeFilter, growthFilter]);


  return (
    <div className="animate-fade-in space-y-6 max-w-7xl mx-auto pb-12">
      <div className="mb-6 border-b border-slate-800 pb-4">
         <h2 className="text-3xl font-black tracking-tight text-white mb-1">Market Intelligence</h2>
         <p className="text-slate-400 text-sm">Advanced macroeconomic screening, valuation distributions, and outlier detection.</p>
      </div>

      {/* TOP ROW: DISTRIBUTION & SECTOR TABLES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-2">
        
        {/* Market Valuation Distribution */}
        <div className="premium-card flex flex-col h-[380px]">
          <h3 className="text-white font-bold mb-1 tracking-wide border-b border-slate-700/50 pb-2 flex items-center gap-2">
             <BarChart2Icon size={18} className="text-blue-400" /> Market Valuation Distribution
          </h3>
          <p className="text-xs text-slate-500 mb-4">Frequency of companies by EV/EBITDA multiple</p>
          <div className="flex-1 w-full relative">
            {HISTOGRAM_DATA.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={HISTOGRAM_DATA} margin={{ top: 10, right: 30, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="range" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <RechartsTooltip cursor={{fill: '#1e293b'}} contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff'}} itemStyle={{color: '#fff'}} formatter={(val) => [val, 'Companies']}/>
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                     {HISTOGRAM_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 2 ? '#3b82f6' : '#1e293b'} stroke="#3b82f6" strokeWidth={1} />
                     ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartState message="No distribution data" subtitle="Market valuation frequency data is currently unavailable." height="100%" />
            )}
          </div>
        </div>

        {/* Sector Valuation Comparison */}
        <div className="premium-card flex flex-col h-[380px]">
          <h3 className="text-white font-bold mb-4 tracking-wide border-b border-slate-700/50 pb-2 flex items-center gap-2">
             <Target size={18} className="text-emerald-400" /> Sector Valuation Comparison
          </h3>
          <div className="flex-1 overflow-auto custom-scrollbar">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="border-b border-slate-700/50 bg-slate-900/50">
                   <th className="py-3 px-4 font-semibold text-slate-400 text-xs uppercase tracking-wider text-left">Sector</th>
                   <th className="py-3 px-4 font-semibold text-slate-400 text-xs uppercase tracking-wider text-right">Avg EV/EBITDA</th>
                   <th className="py-3 px-4 font-semibold text-slate-400 text-xs uppercase tracking-wider text-right">Avg ROE</th>
                   <th className="py-3 px-4 font-semibold text-slate-400 text-xs uppercase tracking-wider text-right">Avg Growth</th>
                 </tr>
               </thead>
               <tbody>
                 {SECTOR_VALUATION.map((row, idx) => (
                   <tr key={idx} className="border-b border-slate-700/30 hover:bg-slate-800/50 transition-colors">
                     <td className="py-4 px-4 font-bold text-white text-left"><SectorBadge sector={row.sector} /></td>
                     <td className="py-4 px-4 font-mono text-sm text-blue-400 text-right">{row.avgEv}x</td>
                     <td className="py-4 px-4 font-mono text-sm text-emerald-400 text-right">{row.avgRoe}%</td>
                     <td className="py-4 px-4 font-mono text-sm text-amber-400 text-right">+{row.avgRev}%</td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        </div>
      </div>

      {/* MIDDLE ROW: OUTLIERS & LEADERS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Market Leaders */}
        <div className="premium-card flex flex-col h-auto">
          <h3 className="text-white font-bold mb-4 tracking-wide border-b border-slate-700/50 pb-2 flex items-center gap-2">
             <Award size={18} className="text-amber-400" /> Market Leaders
          </h3>
          <table className="w-full text-left">
             <tbody>
                {LEADERS_DATA.map((row, idx) => (
                   <tr key={idx} className="border-b last:border-0 border-slate-700/30">
                      <td className="py-3 text-slate-400 text-sm font-semibold text-left">{row.category}</td>
                      <td className="py-3 font-bold text-white text-right">{row.company}</td>
                      <td className="py-3 font-mono text-emerald-400 text-right font-bold">{row.value}</td>
                   </tr>
                ))}
             </tbody>
          </table>
        </div>

        {/* Market Outliers */}
        <div className="premium-card flex flex-col h-auto">
          <h3 className="text-white font-bold mb-4 tracking-wide border-b border-slate-700/50 pb-2 flex items-center gap-2">
             <AlertTriangle size={18} className="text-rose-400" /> Market Outliers & Anomalies
          </h3>
          <table className="w-full text-left">
              <tbody>
                 {OUTLIERS_DATA.map((row, idx) => (
                    <tr key={idx} className="border-b last:border-0 border-slate-700/30">
                       <td className="py-3 text-left">
                          <div className="text-white font-bold text-sm mb-0.5">{row.anomaly}</div>
                          <div className="text-slate-500 font-mono text-[10px] uppercase tracking-wider">{row.detail}</div>
                       </td>
                       <td className="py-3 font-bold text-blue-400 text-right cursor-pointer hover:text-blue-300 transition" onClick={() => {
                           const ticker = row.company.match(/\((.*?)\)/)?.[1];
                           if (ticker) navigate(`/company/${ticker}`);
                       }}>
                          {row.company}
                       </td>
                    </tr>
                 ))}
              </tbody>
          </table>
        </div>
      </div>

      {/* MARKET SCREENER SECTION */}
      <div className="mt-8">
         <h3 className="text-2xl font-black text-white mb-4 flex items-center gap-2">
            <Filter size={24} className="text-emerald-500" /> Screener & Isolator
         </h3>
         
         <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xl flex flex-wrap gap-4 items-center mb-6">
            <div className="flex items-center gap-3">
               <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Sector</span>
                <select value={sectorFilter} onChange={(e) => setSectorFilter(e.target.value)} className="bg-slate-800 text-slate-300 text-sm border border-slate-700 rounded py-2 px-3 outline-none cursor-pointer focus:border-emerald-500">
                   <option value="All">All Sectors</option>
                   <option value="Technology">Technology</option>
                   <option value="Banking">Banking</option>
                   <option value="Retail">Retail</option>
                </select>
            </div>

            <div className="flex items-center gap-3">
               <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">EV/EBITDA</span>
               <select value={evFilter} onChange={(e) => setEvFilter(e.target.value)} className="bg-slate-800 text-slate-300 text-sm border border-slate-700 rounded py-2 px-3 outline-none cursor-pointer focus:border-emerald-500">
                  <option value="All">Any Multiple</option>
                  <option value="<10">Under 10x</option>
                  <option value="10-20">10x - 20x</option>
                  <option value=">20">Over 20x</option>
               </select>
            </div>

            <div className="flex items-center gap-3">
               <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">ROE</span>
               <select value={roeFilter} onChange={(e) => setRoeFilter(e.target.value)} className="bg-slate-800 text-slate-300 text-sm border border-slate-700 rounded py-2 px-3 outline-none cursor-pointer focus:border-emerald-500">
                  <option value="All">Any Return</option>
                  <option value=">20%">Above 20%</option>
                  <option value=">10%">Above 10%</option>
                  <option value="<10%">Below 10%</option>
               </select>
            </div>

            <div className="flex items-center gap-3">
               <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Rev Growth</span>
               <select value={growthFilter} onChange={(e) => setGrowthFilter(e.target.value)} className="bg-slate-800 text-slate-300 text-sm border border-slate-700 rounded py-2 px-3 outline-none cursor-pointer focus:border-emerald-500">
                  <option value="All">Any Growth</option>
                  <option value=">20%">High Growth (&gt;20%)</option>
                  <option value=">0%">Positive (&gt;0%)</option>
                  <option value="<0%">Declining (&lt;0%)</option>
               </select>
            </div>
         </div>

         {/* Screener Results Table */}
         <div className="premium-card overflow-hidden">
           <div className="overflow-x-auto min-h-[300px]">
             <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-slate-700/50 bg-slate-900/50">
                    <th className="py-4 px-6 font-semibold text-slate-400 text-xs uppercase tracking-wider text-left">Company</th>
                    <th className="py-4 px-6 font-semibold text-slate-400 text-xs uppercase tracking-wider text-center">Sector</th>
                    <th className="py-4 px-6 font-semibold text-slate-400 text-xs uppercase tracking-wider text-right">EV/EBITDA</th>
                    <th className="py-4 px-6 font-semibold text-slate-400 text-xs uppercase tracking-wider text-right">ROE</th>
                    <th className="py-4 px-6 font-semibold text-slate-400 text-xs uppercase tracking-wider text-right">Rev Growth</th>
                    <th className="py-4 px-6 font-semibold text-slate-400 text-xs uppercase tracking-wider text-center">Acq Score</th>
                  </tr>
                </thead>
               <tbody>
                 {filteredData.length > 0 ? (
                    filteredData.map(row => (
                       <tr key={row.ticker} onClick={() => navigate(`/company/${row.ticker}`)} className="border-b border-slate-700/30 hover:bg-slate-800/80 cursor-pointer transition-colors group">
                        <td className="py-4 px-6 text-left">
                           <div className="font-bold text-white group-hover:text-blue-400">{row.name}</div>
                           <div className="text-[10px] font-mono text-slate-500">{row.ticker}</div>
                        </td>
                        <td className="py-4 px-6 text-center"><SectorBadge sector={row.sector} /></td>
                        <td className="py-4 px-6 font-mono text-sm text-white text-right">{row.evEbitda}x</td>
                        <td className="py-4 px-6 font-mono text-sm text-emerald-400 text-right font-bold">{row.roe}%</td>
                        <td className="py-4 px-6 font-mono text-sm text-right font-bold">
                           <span className={row.revGrowth >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                              {row.revGrowth > 0 ? '+' : ''}{row.revGrowth}%
                           </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                           <ScoreBadge score={row.acqScore} />
                        </td>
                      </tr>
                    ))
                 ) : (
                    <tr>
                       <td colSpan="6" className="py-16 text-center text-slate-500 font-medium">No companies match the current screening parameters.</td>
                    </tr>
                 )}
               </tbody>
             </table>
           </div>
         </div>
      </div>
    </div>
  );
};

// Polyfill for BarChart2Icon using Lucide React BarChart2 standard mapping
import { BarChart2 as BarChart2Icon } from 'lucide-react';

export default MarketOverview;
