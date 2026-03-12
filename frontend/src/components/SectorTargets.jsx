import React, { useState, useEffect } from 'react';
import { fetchTargets } from '../api';

const SectorTargets = () => {
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
    <div className="glass-panel p-6 flex flex-col pt-4">
      <div className="flex justify-between items-center mb-4 border-b border-slate-700/50 pb-3">
        <h2 className="text-xl font-bold text-slate-300 tracking-wide">Top Sector Targets</h2>
        <select
          value={sector}
          onChange={(e) => setSector(e.target.value)}
          className="bg-slate-800 text-white rounded-lg p-2 px-4 shadow focus:ring-2 focus:ring-blue-500 outline-none hover:bg-slate-700 cursor-pointer transition-colors border border-slate-600"
        >
          <option value="technology">Technology</option>
          <option value="banks">Banks</option>
          <option value="retail">Retail</option>
        </select>
      </div>

      {loading ? (
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-slate-700 rounded w-3/4"></div>
            <div className="h-4 bg-slate-700 rounded gap-2"></div>
            <div className="h-4 bg-slate-700 rounded w-5/6"></div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3 flex-grow">
          {data?.top_targets?.map((t, idx) => (
             <div key={t.ticker} className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-slate-800/80 to-slate-800/20 border-l-4 border-blue-500 shadow-sm hover:translate-x-1 transition-transform">
               <div className="flex items-center gap-3">
                 <span className="text-slate-500 font-mono text-sm">#{idx + 1}</span>
                 <span className="text-white font-bold tracking-wide">{t.ticker}</span>
               </div>
               <div className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm font-semibold">
                 {t.score} pts
               </div>
             </div>
          ))}
          {!data || data?.top_targets?.length === 0 ? (
            <p className="text-slate-400 text-sm mt-4 italic">No targets populated for this sector yet.</p>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SectorTargets;
