import React, { useState } from 'react';
import { FileDown, FileText, DownloadCloud, Printer, CheckCircle } from 'lucide-react';

const ReportCenter = () => {
  const [ticker, setTicker] = useState('JPM');
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
     setDownloading(true);
     setTimeout(() => setDownloading(false), 2000);
  };

  return (
    <div className="animate-fade-in space-y-6 max-h-screen">
      <div className="mb-6 border-b border-slate-800 pb-4 flex justify-between items-end">
         <div>
            <h2 className="text-3xl font-black tracking-tight text-white mb-1">Report Generation Center</h2>
            <p className="text-slate-400 text-sm">Preview & Export automated SEC/M&A Data models.</p>
         </div>
         <div className="flex gap-4">
            <button disabled={downloading} onClick={handleDownload} className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50">
              {downloading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <FileDown size={18}/>}
              {downloading ? 'Generating PDF...' : 'Export to PDF'}
            </button>
            <button className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 border border-slate-600 px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all">
              <DownloadCloud size={18}/> Export CSV Data
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         <div className="lg:col-span-1 premium-card">
            <h3 className="text-white font-bold border-b border-slate-700/50 pb-3 mb-4">Export Configurations</h3>
            
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Target Ticker</label>
            <select value={ticker} onChange={e => setTicker(e.target.value)} className="w-full bg-slate-900 border border-slate-700 text-sm text-white rounded p-3 focus-emerald outline-none mb-6">
               <option value="JPM">JPM - JPMorgan Chase</option>
               <option value="BAC">BAC - Bank of America</option>
               <option value="C">C - Citigroup</option>
            </select>

            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Include Sections</label>
            <div className="space-y-3 mb-6">
               <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="w-5 h-5 rounded bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400"><CheckCircle size={14}/></div>
                  <span className="text-slate-300 text-sm group-hover:text-white transition">Executive Summary</span>
               </label>
               <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="w-5 h-5 rounded bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400"><CheckCircle size={14}/></div>
                  <span className="text-slate-300 text-sm group-hover:text-white transition">3-Statement Financials</span>
               </label>
               <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="w-5 h-5 rounded bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400"><CheckCircle size={14}/></div>
                  <span className="text-slate-300 text-sm group-hover:text-white transition">Peer Benchmarking</span>
               </label>
               <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="w-5 h-5 rounded bg-slate-800 border border-slate-600"></div>
                  <span className="text-slate-400 text-sm group-hover:text-white transition">Raw SEC Extracted Tables</span>
               </label>
            </div>
            
            <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-xl">
               <span className="font-bold text-blue-400 text-xs uppercase tracking-widest leading-none mb-1 block">Live Status</span>
               <span className="text-white text-sm">Last Synced: 2 Mins Ago</span>
            </div>
         </div>

         <div className="lg:col-span-3 bg-white text-slate-900 rounded-xl overflow-y-auto max-h-[800px] shadow-[0_0_50px_rgba(0,0,0,0.5)] p-12 max-w-4xl mx-auto flex flex-col font-serif">
            {/* The Document Preview */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
               <div>
                  <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900">M&A Entry Memo</h1>
                  <p className="text-slate-500 font-sans text-sm mt-1 uppercase tracking-widest font-semibold">{ticker} - Banking Sector Analysis (Confidential)</p>
               </div>
               <div className="text-right">
                  <div className="text-slate-900 font-bold block">Generated</div>
                  <span className="text-slate-500 font-mono text-sm block">12-AUG-2026</span>
                  <div className="mt-4 flex gap-2">
                     <Printer size={20} className="text-slate-400 hover:text-slate-900 cursor-pointer transition"/>
                  </div>
               </div>
            </div>

            <div className="space-y-6">
               <h2 className="text-2xl font-bold border-b border-slate-200 pb-2">1. Executive Summary & Thesis</h2>
               <p className="text-justify leading-relaxed text-sm">
                  Based on automated ingestion of historical 10-K SEC filings and peer benchmarking within the Banking/Investment sector, <strong>{ticker}</strong> presents a highly attractive target profile. 
                  The entity currently holds an Acquisition Suitability Score of <strong>85.4/100</strong>, driven by exceptional Solvency (Tier 1 Capital outperformance) and resilient NIM margins exceeding sector averages by +35bps.
               </p>
               <p className="text-justify leading-relaxed text-sm">
                  We estimate direct cost synergies mapped against its somewhat lagging Efficiency Ratio (61% vs Top Quartile peer avg of 55%), leading to a projected EPS accretion of ~12% by Y2 post-integration. Valuation remains slightly elevated (82nd Percentile), meaning structuring mechanisms should heavily rely on stock-swapping rather than pure cash components to mitigate downside market risk.
               </p>

               <div className="grid grid-cols-2 gap-8 my-8 font-sans">
                  <div className="bg-slate-50 border border-slate-200 p-6 rounded text-center shadow-sm">
                     <span className="block text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Target Enterprise Value</span>
                     <span className="block text-3xl font-black text-slate-800">$540.2B</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-6 rounded text-center shadow-sm">
                     <span className="block text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Acquisition Score</span>
                     <span className="block text-3xl font-black text-emerald-600">85.4 / 100</span>
                  </div>
               </div>
               
               <h2 className="text-2xl font-bold border-b border-slate-200 pb-2">2. Financial Trajectory & Margin Consistency</h2>
               <p className="text-justify leading-relaxed text-sm mb-4">
                  Trend analytics mapped over the preceding 5-year cycle demonstrates aggressive Net Income compounding juxtaposed strongly against predictable FCF. 
                  While operational leverage appears strained structurally compared to peers like GS/MS, pure balance-sheet liquidity prevents hostile takeover defenses from deploying poison pill strategies effectively without severely diluting legacy shareholders.
               </p>
               
               <div className="bg-slate-100 p-4 rounded text-center text-slate-400 font-sans animate-pulse h-32 flex items-center justify-center border-2 border-dashed border-slate-300">
                  [ Generated Heatmap Graphic Will Render Here Upon PDF Print ]
               </div>
            </div>
            
            <div className="mt-auto pt-16 font-sans text-xs text-center text-slate-400 border-t border-slate-200">
               CONFIDENTIAL • FinSight Engine Auto-Generated • Use purely for comparative algorithmic assessment. Not investment advice.
            </div>
         </div>
      </div>
    </div>
  );
};

export default ReportCenter;
