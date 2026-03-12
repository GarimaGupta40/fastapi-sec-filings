import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Cell } from 'recharts';
import { TrendingUp, BarChart2, Zap, Award, Activity } from 'lucide-react';
import EmptyChartState from '../components/EmptyChartState';

const COMPANY_DATA = {
  AAPL: { ticker: 'AAPL', name: 'Apple Inc.', revenue: 383.2, revGrowth: 8.2, roe: 145.0, evEbitda: 22.4, debtEquity: 1.2, acqScore: 82, radar: { Profitability: 95, Growth: 70, Valuation: 60, 'Market Position': 98, Efficiency: 90 } },
  MSFT: { ticker: 'MSFT', name: 'Microsoft Corp.', revenue: 211.9, revGrowth: 11.5, roe: 39.5, evEbitda: 24.1, debtEquity: 0.4, acqScore: 85, radar: { Profitability: 90, Growth: 85, Valuation: 55, 'Market Position': 95, Efficiency: 88 } },
  GOOGL: { ticker: 'GOOGL', name: 'Alphabet Inc.', revenue: 282.8, revGrowth: 9.8, roe: 23.6, evEbitda: 14.5, debtEquity: 0.1, acqScore: 88, radar: { Profitability: 85, Growth: 80, Valuation: 75, 'Market Position': 92, Efficiency: 85 } },
  AMZN: { ticker: 'AMZN', name: 'Amazon.com', revenue: 513.9, revGrowth: 11.0, roe: 12.4, evEbitda: 18.5, debtEquity: 0.9, acqScore: 84, radar: { Profitability: 60, Growth: 88, Valuation: 65, 'Market Position': 96, Efficiency: 75 } },
  META: { ticker: 'META', name: 'Meta Platforms', revenue: 116.6, revGrowth: -1.1, roe: 18.5, evEbitda: 12.4, debtEquity: 0.2, acqScore: 78, radar: { Profitability: 80, Growth: 50, Valuation: 80, 'Market Position': 85, Efficiency: 82 } },
  TSLA: { ticker: 'TSLA', name: 'Tesla Inc.', revenue: 96.8, revGrowth: 18.8, roe: 16.5, evEbitda: 42.1, debtEquity: 0.1, acqScore: 72, radar: { Profitability: 70, Growth: 95, Valuation: 30, 'Market Position': 88, Efficiency: 82 } },
  JPM: { ticker: 'JPM', name: 'JPMorgan Chase', revenue: 128.6, revGrowth: 8.5, roe: 15.4, evEbitda: 10.2, debtEquity: 1.1, acqScore: 80, radar: { Profitability: 75, Growth: 60, Valuation: 85, 'Market Position': 90, Efficiency: 78 } },
  BAC: { ticker: 'BAC', name: 'Bank of America', revenue: 94.9, revGrowth: 6.1, roe: 11.2, evEbitda: 9.1, debtEquity: 1.3, acqScore: 78, radar: { Profitability: 65, Growth: 55, Valuation: 90, 'Market Position': 85, Efficiency: 70 } },
  GS: { ticker: 'GS', name: 'Goldman Sachs', revenue: 47.3, revGrowth: 4.5, roe: 14.8, evEbitda: 11.4, debtEquity: 1.8, acqScore: 74, radar: { Profitability: 70, Growth: 50, Valuation: 82, 'Market Position': 80, Efficiency: 65 } },
  NVDA: { ticker: 'NVDA', name: 'NVIDIA Corp.', revenue: 60.9, revGrowth: 125.8, roe: 65.4, evEbitda: 45.2, debtEquity: 0.3, acqScore: 91, radar: { Profitability: 98, Growth: 100, Valuation: 20, 'Market Position': 94, Efficiency: 96 } },
};

const COMPARE_OPTIONS = Object.keys(COMPANY_DATA);

const ScoreBadge = ({ score }) => {
  let color = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
  if (score >= 90) color = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
  else if (score >= 75) color = 'bg-emerald-400/10 text-emerald-400 border-emerald-400/30';
  else if (score >= 60) color = 'bg-amber-400/10 text-amber-400 border-amber-400/30';
  
  return <span className={`px-2 py-1 rounded text-xs font-bold font-mono border ${color}`}>{score}</span>;
}

const Analytics = () => {
  const [c1, setC1] = useState('AAPL');
  const [c2, setC2] = useState('MSFT');
  const [c3, setC3] = useState('');

  const [activeCompare, setActiveCompare] = useState(['AAPL', 'MSFT']);

  const handleCompare = () => {
    const list = [c1, c2, c3].filter(Boolean);
    if (list.length > 0) setActiveCompare(list);
  };

  const currentCompanies = activeCompare.map(c => COMPANY_DATA[c]).filter(Boolean);

  const bestMetrics = useMemo(() => {
    if (!currentCompanies.length) return null;
    let maxRev = currentCompanies[0], maxRoe = currentCompanies[0], maxGrowth = currentCompanies[0], maxScore = currentCompanies[0];
    
    currentCompanies.forEach(c => {
      if (c.revenue > maxRev.revenue) maxRev = c;
      if (c.roe > maxRoe.roe) maxRoe = c;
      if (c.revGrowth > maxGrowth.revGrowth) maxGrowth = c;
      if (c.acqScore > maxScore.acqScore) maxScore = c;
    });

    return { maxRev, maxRoe, maxGrowth, maxScore };
  }, [currentCompanies]);

  const radarData = useMemo(() => {
    const axes = ['Profitability', 'Growth', 'Valuation', 'Market Position', 'Efficiency'];
    return axes.map(axis => {
      const dp = { subject: axis };
      currentCompanies.forEach((c, i) => {
        dp[`c${i}`] = c.radar[axis];
      });
      return dp;
    });
  }, [currentCompanies]);

  const colors = ['#3b82f6', '#10b981', '#f59e0b'];

  return (
    <div className="animate-fade-in space-y-6 max-w-7xl mx-auto pb-12">
      <div className="mb-6 border-b border-slate-800 pb-4">
         <h2 className="text-3xl font-black tracking-tight text-white mb-1">Compare Companies</h2>
         <p className="text-slate-400 text-sm">Analyze financial metrics across multiple companies side-by-side.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-xl flex flex-wrap gap-6 items-end mb-6">
        <div className="flex-1">
           <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Select Company 1</label>
           <select value={c1} onChange={e => setC1(e.target.value)} className="w-full bg-slate-800 text-white text-sm border border-slate-700 rounded py-2.5 px-3 outline-none focus:border-emerald-500 transition">
              <option value="">-- Select --</option>
              {COMPARE_OPTIONS.map(opt => <option key={`c1-${opt}`} value={opt}>{opt} - {COMPANY_DATA[opt].name}</option>)}
           </select>
        </div>
        <div className="flex-1">
           <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Select Company 2</label>
           <select value={c2} onChange={e => setC2(e.target.value)} className="w-full bg-slate-800 text-white text-sm border border-slate-700 rounded py-2.5 px-3 outline-none focus:border-emerald-500 transition">
              <option value="">-- Select --</option>
              {COMPARE_OPTIONS.map(opt => <option key={`c2-${opt}`} value={opt}>{opt} - {COMPANY_DATA[opt].name}</option>)}
           </select>
        </div>
        <div className="flex-1">
           <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Select Company 3 (Optional)</label>
           <select value={c3} onChange={e => setC3(e.target.value)} className="w-full bg-slate-800 text-white text-sm border border-slate-700 rounded py-2.5 px-3 outline-none focus:border-emerald-500 transition">
              <option value="">-- None --</option>
              {COMPARE_OPTIONS.map(opt => <option key={`c3-${opt}`} value={opt}>{opt} - {COMPANY_DATA[opt].name}</option>)}
           </select>
        </div>
        <div>
           <button onClick={handleCompare} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-6 rounded transition flex items-center gap-2">
              <Activity size={16} /> Compare
           </button>
        </div>
      </div>

      {currentCompanies.length > 0 && (
        <>
          {/* COMPARISON TABLE */}
          <div className="premium-card overflow-hidden mb-8">
            <h3 className="text-white font-bold mb-4 tracking-wide border-b border-slate-700/50 pb-3 flex items-center gap-2 px-2">
               <BarChart2 size={18} className="text-blue-400" /> Comparison Layout
            </h3>
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse min-w-[600px]">
                 <thead>
                   <tr className="border-b border-slate-700/50 bg-slate-900/50">
                     <th className="py-4 px-6 font-semibold text-slate-400 text-xs uppercase tracking-wider w-1/4 text-left">Metric</th>
                     {currentCompanies.map((c, i) => (
                        <th key={`th-${c.ticker}-${i}`} className="py-4 px-6 font-bold text-white tracking-wider text-right" style={{color: colors[i]}}>
                           {c.ticker} <span className="text-slate-500 text-xs font-normal ml-1 inline-block">{c.name}</span>
                        </th>
                     ))}
                   </tr>
                 </thead>
                 <tbody>
                   <tr className="border-b border-slate-700/30 hover:bg-slate-800/50 transition-colors">
                     <td className="py-4 px-6 font-medium text-slate-300 text-left">Revenue (Billions)</td>
                     {currentCompanies.map((c, i) => <td key={`rev-${i}`} className="py-4 px-6 font-mono text-white text-right">${c.revenue}B</td>)}
                   </tr>
                   <tr className="border-b border-slate-700/30 hover:bg-slate-800/50 transition-colors">
                     <td className="py-4 px-6 font-medium text-slate-300 text-left">Revenue Growth</td>
                     {currentCompanies.map((c, i) => (
                        <td key={`rg-${i}`} className={`py-4 px-6 font-mono font-bold text-right ${c.revGrowth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                           {c.revGrowth > 0 ? '+' : ''}{c.revGrowth}%
                        </td>
                     ))}
                   </tr>
                   <tr className="border-b border-slate-700/30 hover:bg-slate-800/50 transition-colors">
                     <td className="py-4 px-6 font-medium text-slate-300 text-left">Return on Equity (ROE)</td>
                     {currentCompanies.map((c, i) => <td key={`roe-${i}`} className="py-4 px-6 font-mono text-white text-right">{c.roe}%</td>)}
                   </tr>
                   <tr className="border-b border-slate-700/30 hover:bg-slate-800/50 transition-colors">
                     <td className="py-4 px-6 font-medium text-slate-300 text-left">EV / EBITDA</td>
                     {currentCompanies.map((c, i) => <td key={`ev-${i}`} className="py-4 px-6 font-mono text-white text-right">{c.evEbitda}x</td>)}
                   </tr>
                   <tr className="border-b border-slate-700/30 hover:bg-slate-800/50 transition-colors">
                     <td className="py-4 px-6 font-medium text-slate-300 text-left">Debt-to-Equity</td>
                     {currentCompanies.map((c, i) => <td key={`debt-${i}`} className="py-4 px-6 font-mono text-white text-right">{c.debtEquity}</td>)}
                   </tr>
                   <tr className="border-b border-slate-700/30 hover:bg-slate-800/50 transition-colors">
                     <td className="py-4 px-6 font-medium text-slate-300 text-left">Acquisition Score</td>
                     {currentCompanies.map((c, i) => <td key={`score-${i}`} className="py-4 px-6 text-center"><ScoreBadge score={c.acqScore} /></td>)}
                   </tr>
                 </tbody>
               </table>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* BAR CHART */}
               <div className="premium-card flex flex-col h-[400px]">
                  <h3 className="text-white font-bold mb-1 tracking-wide border-b border-slate-700/50 pb-2 flex items-center gap-2">
                     <TrendingUp size={18} className="text-emerald-400" /> Revenue Comparison
                  </h3>
                  <div className="flex-1 w-full relative mt-4">
                     {currentCompanies.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={currentCompanies} margin={{top: 20, right: 30, left: -20, bottom: 5}}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                              <XAxis dataKey="ticker" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                              <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                              <RechartsTooltip cursor={{fill: '#1e293b'}} contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff'}} itemStyle={{color: '#fff'}} formatter={(val) => [`$${val}B`, 'Revenue']} />
                              <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                                 {currentCompanies.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={colors[index]} />
                                 ))}
                              </Bar>
                           </BarChart>
                        </ResponsiveContainer>
                     ) : (
                        <EmptyChartState message="No comparison data" subtitle="Please select companies to compare metrics." height="100%" />
                     )}
                  </div>
               </div>

               {/* RADAR CHART */}
               <div className="premium-card flex flex-col h-[400px]">
                  <h3 className="text-white font-bold mb-1 tracking-wide border-b border-slate-700/50 pb-2 flex items-center gap-2">
                     <Activity size={18} className="text-purple-400" /> Financial Radar
                  </h3>
                  <div className="flex-1 w-full relative mt-2 -ml-2 text-xs">
                     {currentCompanies.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                           <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                              <PolarGrid stroke="#334155" />
                              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                              <RechartsTooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff'}} itemStyle={{color: '#fff'}} />
                              <Legend wrapperStyle={{fontSize: '12px', paddingTop: '10px'}} />
                              {currentCompanies.map((c, i) => (
                                 <Radar key={`radar-${c.ticker}`} name={c.ticker} dataKey={`c${i}`} stroke={colors[i]} fill={colors[i]} fillOpacity={0.4} />
                              ))}
                           </RadarChart>
                        </ResponsiveContainer>
                     ) : (
                        <EmptyChartState message="No radar data" subtitle="Select companies to visualize score breakdown." height="100%" />
                     )}
                  </div>
               </div>
            </div>

            {/* INSIGHTS PANEL */}
            <div className="premium-card flex flex-col h-[400px]">
               <h3 className="text-white font-bold mb-4 tracking-wide border-b border-slate-700/50 pb-2 flex items-center gap-2">
                  <Zap size={18} className="text-amber-400" /> Comparison Insights
               </h3>
               {bestMetrics && (
                   <div className="space-y-4 flex-1 overflow-auto custom-scrollbar pr-2">
                     
                     <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                        <div className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Highest Revenue</div>
                        <div className="flex justify-between items-center">
                           <span className="text-white font-bold">{bestMetrics.maxRev.name}</span>
                           <span className="text-blue-400 font-mono font-bold">${bestMetrics.maxRev.revenue}B</span>
                        </div>
                     </div>

                     <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                        <div className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Highest ROE</div>
                        <div className="flex justify-between items-center">
                           <span className="text-white font-bold">{bestMetrics.maxRoe.name}</span>
                           <span className="text-emerald-400 font-mono font-bold">{bestMetrics.maxRoe.roe}%</span>
                        </div>
                     </div>

                     <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                        <div className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Highest Rev Growth</div>
                        <div className="flex justify-between items-center">
                           <span className="text-white font-bold">{bestMetrics.maxGrowth.name}</span>
                           <span className="text-emerald-400 font-mono font-bold">+{bestMetrics.maxGrowth.revGrowth}%</span>
                        </div>
                     </div>

                     <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                        <div className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Best Acquisition Score</div>
                        <div className="flex justify-between items-center">
                           <span className="text-white font-bold">{bestMetrics.maxScore.name}</span>
                           <ScoreBadge score={bestMetrics.maxScore.acqScore} />
                        </div>
                     </div>

                   </div>
               )}
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default Analytics;
