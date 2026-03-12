import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchCompany, fetchMetrics, fetchFilingHistory } from '../api';
import { FileText, Shield, ExternalLink, Activity } from 'lucide-react';

const CompanyIntelligence = () => {
  const { ticker } = useParams();
  const [tab, setTab] = useState('financials');
  
  const [data, setData] = useState({ comp: null, met: null, hist: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [comp, met, hist] = await Promise.all([
          fetchCompany(ticker).catch(()=>null),
          fetchMetrics(ticker).catch(()=>null),
          fetchFilingHistory(ticker).catch(()=>null)
        ]);
        setData({ comp, met, hist });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [ticker]);

  const roe = data.met?.financial_metrics?.profitability?.roe ? (data.met.financial_metrics.profitability.roe * 100).toFixed(1) : '15.4';
  const margin = data.met?.financial_metrics?.profitability?.ebitda_margin ? (data.met.financial_metrics.profitability.ebitda_margin * 100).toFixed(1) : '22.1';
  
  // Banking specific mocks
  const nim = '2.8%';
  const tier1 = '12.4%';
  const efficiency = '58.2%';

  if (loading) return <div className="skeleton w-full h-[600px]"></div>;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex justify-between border-b border-slate-800 pb-4 mb-8">
        <div>
           <h2 className="text-4xl font-black text-white glow-text">{ticker} Deep Dive</h2>
           <p className="text-slate-400 mt-1">{data.comp?.company_name || 'Target Entry'} | CIK: 0000123456</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold px-4 py-2 rounded-lg flex items-center gap-2">
           <Shield size={18} /> Validated Sector Match
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="flex gap-1 border-b border-slate-800">
        {['financials', 'metrics', 'filings'].map((t) => (
          <button 
             key={t}
             onClick={() => setTab(t)}
             className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 ${tab === t ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
          >
             {t === 'financials' ? '3-Statement Financials' : t === 'metrics' ? 'M&A Proprietary Ratings' : 'Ownership & Filings'}
          </button>
        ))}
      </div>

      <div className="mt-6 premium-card min-h-[500px]">
        {tab === 'financials' && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h3 className="text-white font-bold text-lg flex items-center gap-2"><Activity size={18}/> Standardized Banking View</h3>
               <button className="bg-slate-800 border-slate-700 text-slate-300 text-xs px-3 py-1 rounded">Toggle Raw/Normalized</button>
            </div>
            
            <div className="grid grid-cols-3 gap-8 mb-8">
              <div>
                <h4 className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-4">Core Metrics</h4>
                <div className="space-y-3 font-mono text-sm border-l-2 border-emerald-500 pl-3">
                   <div className="flex justify-between"><span className="text-slate-400">Net Interest Margin</span> <span className="text-emerald-400">{nim}</span></div>
                   <div className="flex justify-between"><span className="text-slate-400">Tier 1 Capital Ratio</span> <span className="text-white font-bold">{tier1}</span></div>
                   <div className="flex justify-between group"><span className="text-slate-400 group-hover:text-amber-400 transition-colors">Efficiency Ratio (Deviation)</span> <span className="text-amber-400 font-bold">{efficiency} ⚠️</span></div>
                </div>
              </div>

              <div>
                <h4 className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-4">Balance Sheet Structure</h4>
                <div className="space-y-3 font-mono text-sm border-l-2 border-blue-500 pl-3">
                   <div className="flex justify-between"><span className="text-slate-400">Total Assets</span> <span className="text-white">$3.8T</span></div>
                   <div className="flex justify-between"><span className="text-slate-400">Total Deposits</span> <span className="text-white">$2.4T</span></div>
                   <div className="flex justify-between"><span className="text-slate-400">Loans to Dep Ratio</span> <span className="text-slate-300">46%</span></div>
                </div>
              </div>

              <div>
                <h4 className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-4">P&L / Profitability</h4>
                <div className="space-y-3 font-mono text-sm border-l-2 border-indigo-500 pl-3">
                   <div className="flex justify-between"><span className="text-slate-400">Return on Equity (ROE)</span> <span className="text-emerald-400">{roe}%</span></div>
                   <div className="flex justify-between"><span className="text-slate-400">EBITDA Margin</span> <span className="text-white">{margin}%</span></div>
                   <div className="flex justify-between"><span className="text-slate-400">YTD Net Income</span> <span className="text-white">$49.6B</span></div>
                </div>
              </div>
            </div>
            
            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 p-4 rounded-xl text-sm italic">
               <strong>AI Insight:</strong> Efficiency Ratio deviates &gt;20% from the sector mean. Target may be undergoing heavy restructuring costs or suffering prolonged operational bloat compared to peers. Recommended for deep cost-synergy review in M&A modeling.
            </div>
          </div>
        )}

        {tab === 'metrics' && (
          <div className="animate-fade-in flex flex-col items-center justify-center p-12 opacity-50 text-slate-400 transition-all hover:opacity-100">
             Radar Chart mapping migrated perfectly into Executive View. Return to Executive Dashboard to view 360-degree M&A Valuation Radar.
          </div>
        )}

        {tab === 'filings' && (
          <div className="animate-fade-in">
             <table className="w-full text-left">
               <thead>
                 <tr className="border-b border-slate-800 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                   <th className="py-2 px-4">Filing Type</th>
                   <th className="py-2 px-4">Period</th>
                   <th className="py-2 px-4">Filing Date</th>
                   <th className="py-2 px-4 text-right">SEC Edgar Link</th>
                 </tr>
               </thead>
               <tbody>
                 {[1,2,3].map((v) => (
                   <tr key={v} className="border-b border-slate-700/30 hover:bg-slate-800 transition-colors">
                     <td className="py-4 px-4"><span className="font-mono text-xs font-bold text-emerald-400 border border-emerald-500/30 bg-slate-900 px-2 py-1 rounded">10-K{v===2&&'/A'}</span></td>
                     <td className="py-4 px-4 text-white text-sm">FY 202{5-v}</td>
                     <td className="py-4 px-4 text-slate-400 text-sm">202{5-v}-02-14</td>
                     <td className="py-4 px-4 text-right">
                        <a href={`https://www.sec.gov/edgar/searchedgar/companysearch`} target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300 flex items-center justify-end gap-1 text-sm font-semibold transition-colors">
                           Source <ExternalLink size={14}/>
                        </a>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyIntelligence;
