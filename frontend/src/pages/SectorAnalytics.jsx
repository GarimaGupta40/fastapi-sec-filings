import React, { useState, useEffect } from 'react';
import { fetchTargets } from '../api';
import { PieChart, Target } from 'lucide-react';

const SectorAnalytics = () => {
  const [sector, setSector] = useState('technology');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSector = async () => {
      setLoading(true);
      try {
        const res = await fetchTargets(sector);
        setData(res);
      } catch (e) {
        console.error("Sector fetch error", e);
      }
      setLoading(false);
    };
    fetchSector();
  }, [sector]);

  return (
    <div className="animate-fade-in fade-in max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <PieChart size={32} className="text-amber-400" />
        <h2 className="text-3xl font-black text-white tracking-tight">Sector Analytics & Targets</h2>
      </div>

      <div className="flex justify-between items-center mb-8 glass-panel p-6">
        <div>
          <h3 className="text-xl font-bold text-slate-300">Target Acquisition Screener</h3>
          <p className="text-sm text-slate-400 mt-1">Cross-referencing metrics against industry peers</p>
        </div>
        <div className="relative">
           <select
             value={sector}
             onChange={(e) => setSector(e.target.value)}
             className="bg-slate-900 border border-slate-600 rounded-xl px-6 py-3 text-lg font-semibold shadow-lg text-white appearance-none outline-none focus:ring-2 focus:ring-amber-500 hover:bg-slate-800 transition-colors w-64"
           >
             <option value="technology">Technology</option>
             <option value="banks">Banking</option>
             <option value="retail">Retail</option>
           </select>
           <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
             ▼
           </div>
        </div>
      </div>

      <div className="glass-panel overflow-hidden shadow-2xl relative">
        <table className="w-full text-left border-collapse z-10">
          <thead>
            <tr className="bg-slate-800/80 border-b border-slate-700/50">
              <th className="py-4 px-6 font-semibold text-slate-300 uppercase text-xs tracking-wider">Rank</th>
              <th className="py-4 px-6 font-semibold text-slate-300 uppercase text-xs tracking-wider">Company</th>
              <th className="py-4 px-6 font-semibold text-slate-300 uppercase text-xs tracking-wider">Sector</th>
              <th className="py-4 px-6 font-semibold text-slate-300 uppercase text-xs tracking-wider">Acquisition Score</th>
              <th className="py-4 px-6 font-semibold text-slate-300 uppercase text-xs tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
               [1,2,3,4,5].map(idx => (
                 <tr key={idx} className="border-b border-slate-700/30 animate-pulse">
                   <td className="py-5 px-6"><div className="w-8 h-4 bg-slate-700 rounded"></div></td>
                   <td className="py-5 px-6"><div className="w-24 h-4 bg-slate-700 rounded"></div></td>
                   <td className="py-5 px-6"><div className="w-20 h-4 bg-slate-700 rounded"></div></td>
                   <td className="py-5 px-6"><div className="w-16 h-6 bg-slate-700/70 rounded-full"></div></td>
                   <td className="py-5 px-6 text-right"><div className="w-10 h-6 bg-slate-700 ml-auto rounded"></div></td>
                 </tr>
               ))
            ) : data && data.top_targets && data.top_targets.length > 0 ? (
               data.top_targets.map((t, idx) => (
                 <tr key={t.ticker} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors group">
                   <td className="py-5 px-6 text-2xl font-black text-slate-500 opacity-50 group-hover:opacity-100 group-hover:text-amber-400 transition-all">#{idx + 1}</td>
                   <td className="py-5 px-6 font-bold text-white text-lg tracking-wide">{t.ticker}</td>
                   <td className="py-5 px-6 text-slate-400">{data.sector}</td>
                   <td className="py-5 px-6">
                      <div className="flex items-center gap-3">
                         <div className="flex-1 bg-slate-800 rounded-full h-3 max-w-[150px] border border-slate-700">
                            <div className={`h-full rounded-full ${t.score > 70 ? 'bg-emerald-500' : t.score > 40 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${t.score}%` }}></div>
                         </div>
                         <span className="text-sm font-bold w-10 text-slate-200">{t.score}</span>
                      </div>
                   </td>
                   <td className="py-5 px-6 text-right">
                      <a href={`/company/${t.ticker}`} className="bg-slate-800 hover:bg-amber-600 border border-slate-600 hover:border-transparent rounded-lg px-4 py-2 text-sm font-semibold text-slate-200 transition-colors inline-block text-center shadow">
                         Analyze
                      </a>
                   </td>
                 </tr>
               ))
            ) : (
               <tr>
                 <td colSpan="5" className="py-12 px-6 text-center text-slate-400">
                    <Target size={48} className="mx-auto text-slate-600 mb-4" />
                    <p className="font-semibold mb-2">No Targets Available</p>
                    <p className="text-sm text-slate-500">Ensure `{sector}` filings have been ingested via SEC EDGAR scanner.</p>
                 </td>
               </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SectorAnalytics;
