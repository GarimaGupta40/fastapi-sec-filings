import React, { useState, useEffect } from 'react';
import { Sliders, RefreshCw, Calculator, TrendingUp } from 'lucide-react';

const StrategyModeling = () => {
  const [weights, setWeights] = useState({
    financial_distress: 30,
    valuation_attractiveness: 25,
    market_position: 20,
    operational_efficiency: 25
  });

  const [companyScores] = useState({
    JPM: { f: 85, v: 80, m: 95, o: 90 },
    BAC: { f: 80, v: 82, m: 85, o: 88 },
    C:   { f: 72, v: 90, m: 70, o: 65 }
  });

  const [results, setResults] = useState([]);

  useEffect(() => {
    // Normalize weights if they don't add to 100
    const total = Object.values(weights).reduce((a,b) => a+b, 0);
    const multiplier = 100 / (total || 1);

    const calculated = Object.keys(companyScores).map(ticker => {
       const scores = companyScores[ticker];
       const finalScore = (
         (scores.f * (weights.financial_distress * multiplier) / 100) +
         (scores.v * (weights.valuation_attractiveness * multiplier) / 100) +
         (scores.m * (weights.market_position * multiplier) / 100) +
         (scores.o * (weights.operational_efficiency * multiplier) / 100)
       ).toFixed(1);
       return { ticker, score: parseFloat(finalScore) };
    });

    setResults(calculated.sort((a,b) => b.score - a.score));
  }, [weights, companyScores]);

  const handleDrag = (e, key) => {
    setWeights({ ...weights, [key]: parseInt(e.target.value) });
  };

  const getPercentage = (key) => {
    const total = Object.values(weights).reduce((a,b) => a+b, 0);
    return ((weights[key] / (total || 1)) * 100).toFixed(1);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="mb-6 border-b border-slate-800 pb-4">
         <h2 className="text-3xl font-black tracking-tight text-white mb-1">Strategy & Modeling</h2>
         <p className="text-slate-400 text-sm">Interactive Weighted Scoring Model (WSM) Simulation.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         
         {/* Weight Controls */}
         <div className="premium-card lg:col-span-1">
           <div className="flex items-center justify-between border-b border-slate-700/50 pb-4 mb-4">
             <h3 className="text-white font-bold flex items-center gap-2"><Sliders size={18}/> Optimization Weights</h3>
             <button 
                className="text-emerald-400 hover:text-emerald-300 transition" 
                onClick={() => setWeights({ financial_distress: 30, valuation_attractiveness: 25, market_position: 20, operational_efficiency: 25 })}
             >
                <RefreshCw size={14}/>
             </button>
           </div>
           
           <div className="space-y-6">
             <div>
                <div className="flex justify-between items-center mb-2">
                   <label className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Solvency / Capital</label>
                   <span className="text-emerald-400 font-mono text-sm">{getPercentage('financial_distress')}%</span>
                </div>
                <input type="range" min="0" max="100" value={weights.financial_distress} onChange={(e) => handleDrag(e, 'financial_distress')} className="w-full accent-emerald-500" />
             </div>
             
             <div>
                <div className="flex justify-between items-center mb-2">
                   <label className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Valuation (P/E, EV)</label>
                   <span className="text-blue-400 font-mono text-sm">{getPercentage('valuation_attractiveness')}%</span>
                </div>
                <input type="range" min="0" max="100" value={weights.valuation_attractiveness} onChange={(e) => handleDrag(e, 'valuation_attractiveness')} className="w-full accent-blue-500" />
             </div>
             
             <div>
                <div className="flex justify-between items-center mb-2">
                   <label className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Market Share Growth</label>
                   <span className="text-purple-400 font-mono text-sm">{getPercentage('market_position')}%</span>
                </div>
                <input type="range" min="0" max="100" value={weights.market_position} onChange={(e) => handleDrag(e, 'market_position')} className="w-full accent-purple-500" />
             </div>
             
             <div>
                <div className="flex justify-between items-center mb-2">
                   <label className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Efficiency Ratio / Margin</label>
                   <span className="text-amber-400 font-mono text-sm">{getPercentage('operational_efficiency')}%</span>
                </div>
                <input type="range" min="0" max="100" value={weights.operational_efficiency} onChange={(e) => handleDrag(e, 'operational_efficiency')} className="w-full accent-amber-500" />
             </div>
           </div>
         </div>

         {/* Computed Results */}
         <div className="premium-card lg:col-span-2 relative overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-3xl rounded-full translate-x-12 -translate-y-12"></div>
            
            <div className="flex items-center justify-between border-b border-slate-700/50 pb-4 mb-4 z-10">
              <h3 className="text-white font-bold flex items-center gap-2"><Calculator size={18}/> WSM Model Outcome</h3>
              <div className="text-xs text-slate-500 font-mono bg-slate-900 border border-slate-700 px-3 py-1 rounded">Algorithm: Σ (Score * w)</div>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-4 z-10">
               {results.map((res, i) => (
                  <div key={res.ticker} className={`border ${i === 0 ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-slate-700/50 bg-slate-800/80'} p-4 rounded-xl flex items-center justify-between transform transition-transform hover:-translate-y-1 hover:shadow-2xl`}>
                     <div className="flex items-center gap-4">
                        <div className={`text-4xl font-black ${i === 0 ? 'text-emerald-400 glow-text' : 'text-slate-600'}`}>#{i+1}</div>
                        <div>
                           <div className="text-2xl font-black text-white">{res.ticker} <span className="text-sm font-normal text-slate-400">{res.ticker === 'JPM' ? 'JPMorgan Chase' : res.ticker === 'BAC' ? 'Bank of America' : 'Citigroup'}</span></div>
                           {i === 0 && <span className="text-xs font-bold bg-emerald-500 text-slate-900 px-2 py-0.5 rounded shadow">Prime M&A Candidate</span>}
                        </div>
                     </div>
                     <div className="text-right">
                        <div className="text-4xl font-black font-mono tracking-tighter text-white">{res.score}</div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Simulated Score</div>
                     </div>
                  </div>
               ))}
            </div>
            
            <div className="mt-4 p-4 bg-slate-900 border border-slate-700 rounded-lg flex gap-4 text-sm z-10">
               <TrendingUp className="text-blue-500 shrink-0 mt-0.5" size={16}/>
               <p className="text-slate-400 leading-relaxed italic">
                  <strong>Insight:</strong> Adjusting the Operational Efficiency weight above 35% historically forces legacy banks like Citigroup (C) to drop significantly due to inflated cost ratios vs JPM/BAC.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default StrategyModeling;
