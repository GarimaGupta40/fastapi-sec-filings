import React, { useState, useMemo, useRef } from 'react';
import { Download, Printer, ZoomIn, ZoomOut, FileText, FileDown, Clock, Check, Building, BarChart2, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

const COMPANIES = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'JPM', 'BAC', 'GS', 'NVDA'];

const MOCK_DATA = {
  AAPL: { name: 'Apple Inc.', sector: 'Technology', desc: 'Designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.', rev: 383.2, growth: 8.2, score: 82, chart: [{year: '2021', rev: 365.8}, {year: '2022', rev: 394.3}, {year: '2023', rev: 383.2}], roe: 145.0, ev: 22.4, debtEquity: 1.2, health: 'Strong' },
  MSFT: { name: 'Microsoft Corp.', sector: 'Technology', desc: 'Develops, licenses, and supports software, services, devices, and solutions worldwide.', rev: 211.9, growth: 11.5, score: 85, chart: [{year: '2021', rev: 168.1}, {year: '2022', rev: 198.3}, {year: '2023', rev: 211.9}], roe: 39.5, ev: 24.1, debtEquity: 0.4, health: 'Strong' },
  GOOGL: { name: 'Alphabet Inc.', sector: 'Technology', desc: 'Offers various products and platforms in the United States, Europe, the Middle East, Africa, the Asia-Pacific, Canada, and Latin America.', rev: 282.8, growth: 9.8, score: 88, chart: [{year: '2021', rev: 257.6}, {year: '2022', rev: 282.8}, {year: '2023', rev: 307.4}], roe: 23.6, ev: 14.5, debtEquity: 0.1, health: 'Strong' },
  AMZN: { name: 'Amazon.com', sector: 'Retail', desc: 'Engages in the retail sale of consumer products and subscriptions in North America and internationally.', rev: 513.9, growth: 11.0, score: 84, chart: [{year: '2021', rev: 469.8}, {year: '2022', rev: 513.9}, {year: '2023', rev: 574.8}], roe: 12.4, ev: 18.5, debtEquity: 0.9, health: 'Stable' },
  META: { name: 'Meta Platforms', sector: 'Technology', desc: 'Develops products that enable people to connect and share with friends and family worldwide.', rev: 116.6, growth: -1.1, score: 78, chart: [{year: '2021', rev: 117.9}, {year: '2022', rev: 116.6}, {year: '2023', rev: 134.9}], roe: 18.5, ev: 12.4, debtEquity: 0.2, health: 'Stable' },
  TSLA: { name: 'Tesla Inc.', sector: 'Technology', desc: 'Designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems.', rev: 96.8, growth: 18.8, score: 72, chart: [{year: '2021', rev: 53.8}, {year: '2022', rev: 81.5}, {year: '2023', rev: 96.8}], roe: 16.5, ev: 42.1, debtEquity: 0.1, health: 'Stable' },
  JPM: { name: 'JPMorgan Chase', sector: 'Banking', desc: 'Operates as a financial services company worldwide.', rev: 128.6, growth: 8.5, score: 80, chart: [{year: '2021', rev: 121.6}, {year: '2022', rev: 128.6}, {year: '2023', rev: 158.1}], roe: 15.4, ev: 10.2, debtEquity: 1.1, health: 'Strong' },
  BAC: { name: 'Bank of America', sector: 'Banking', desc: 'Provides banking and financial products and services for individual consumers, small and middle-market businesses worldwide.', rev: 94.9, growth: 6.1, score: 78, chart: [{year: '2021', rev: 89.1}, {year: '2022', rev: 94.9}, {year: '2023', rev: 98.6}], roe: 11.2, ev: 9.1, debtEquity: 1.3, health: 'Stable' },
  GS: { name: 'Goldman Sachs', sector: 'Banking', desc: 'Provides a range of financial services for corporations, financial institutions, governments, and individuals worldwide.', rev: 47.3, growth: 4.5, score: 74, chart: [{year: '2021', rev: 59.3}, {year: '2022', rev: 47.3}, {year: '2023', rev: 46.2}], roe: 14.8, ev: 11.4, debtEquity: 1.8, health: 'Warning' },
  NVDA: { name: 'NVIDIA Corp.', sector: 'Technology', desc: 'Provides graphics, and compute and networking solutions in the United States, Taiwan, China, and internationally.', rev: 60.9, growth: 125.8, score: 91, chart: [{year: '2021', rev: 16.7}, {year: '2022', rev: 26.9}, {year: '2023', rev: 60.9}], roe: 65.4, ev: 45.2, debtEquity: 0.3, health: 'Strong' },
};

const CheckboxOption = ({ label, checked, onChange }) => (
   <button type="button" onClick={(e) => { e.preventDefault(); onChange(); }} className="flex items-center gap-3 w-full p-2 hover:bg-slate-800 rounded transition group">
      <div className={`w-5 h-5 rounded border ${checked ? 'bg-emerald-500 border-emerald-500 text-slate-900' : 'bg-transparent border-slate-600'} flex items-center justify-center transition-colors`}>
         {checked && <Check size={14} strokeWidth={3} />}
      </div>
      <span className={`text-sm ${checked ? 'text-white font-medium' : 'text-slate-400'}`}>{label}</span>
   </button>
);

const PEER_COMPARABLES = [
   { metric: "EV / EBITDA", target: "Current", mean: "Sector Avg", top: "Top Quartile" },
   { metric: "Valuation", target: "15.4x", mean: "12.8x", top: "18.5x" },
   { metric: "Revenue Gr.", target: "+8.5%", mean: "+5.4%", top: "+11.2%" },
   { metric: "ROE Return", target: "24.5%", mean: "15.2%", top: "32.4%" },
   { metric: "EBIT Margin", target: "18.2%", mean: "14.1%", top: "21.5%" },
];

const Reports = () => {
  const [ticker, setTicker] = useState('');
  const [format, setFormat] = useState('PDF');
  const [zoom, setZoom] = useState(1);
  const [isGenerated, setIsGenerated] = useState(false);
  const printRef = useRef(null);

  const [sections, setSections] = useState({
     overview: true,
     health: true,
     growth: true,
     raw: false,
     peer: true
  });

  const toggleSection = (key) => setSections(prev => ({ ...prev, [key]: !prev[key] }));

  const company = MOCK_DATA[ticker] || MOCK_DATA['AAPL'];

  const handleGenerateReport = () => {
      if (ticker) setIsGenerated(true);
  };

  const handleTickerChange = (e) => {
      setTicker(e.target.value);
      setIsGenerated(false);
  };

  const handlePrint = () => {
    if (!isGenerated) return;
    window.print();
  };

  const exportReport = async () => {
    if (!isGenerated) return;
    
    if (format === 'PDF') {
        try {
            const element = printRef.current;
            const prevTransform = element.style.transform;
            element.style.transform = 'none';

            // Allow layout repaint
            await new Promise(r => setTimeout(r, 100));

            const dataUrl = await toPng(element, { 
                quality: 1.0, 
                backgroundColor: '#ffffff',
                pixelRatio: 2 
            });

            element.style.transform = prevTransform;

            const pdf = new jsPDF({
                unit: 'in',
                format: 'letter',
                orientation: 'portrait'
            });

            const imgProps = pdf.getImageProperties(dataUrl);
            const pdfWidth = 8.5;
            const pdfHeight = 11;
            const margin = 0.5;
            const contentWidth = pdfWidth - (margin * 2);
            let contentHeight = (imgProps.height * contentWidth) / imgProps.width;

            // Optional pagination mapping if it overflows 1 page heavily
            let heightLeft = contentHeight;
            let position = margin;
            
            pdf.addImage(dataUrl, 'PNG', margin, position, contentWidth, contentHeight);
            
            while (heightLeft > pdfHeight - margin * 2) {
               position = position - pdfHeight + margin * 2;
               pdf.addPage();
               pdf.addImage(dataUrl, 'PNG', margin, position, contentWidth, contentHeight);
               heightLeft -= pdfHeight - margin * 2;
            }

            pdf.save(`${ticker}_Insight_Report.pdf`);
        } catch (e) {
            console.error("PDF Export failed: ", e);
            alert("Export engine failed. Reason: " + e.message);
        }
    } else {
        fakeDownload(`${ticker}_Company_Insight_Report.${format === 'Excel' ? 'xlsx' : 'pptx'}`);
    }
  };

  const exportCSV = () => {
      if (!isGenerated || !ticker) return;
      const c = MOCK_DATA[ticker];
      
      const csvContent = "Company,Sector,Revenue,Revenue Growth,ROE,EV/EBITDA,Debt-to-Equity,Acquisition Score\n"
          + `"${c.name}","${c.sector}",${c.rev},${c.growth},${c.roe},${c.ev},${c.debtEquity},${c.score}`;

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.setAttribute("href", url);
      a.setAttribute("download", `${ticker}_financial_metrics.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  };

  const fakeDownload = (filename) => {
    const a = document.createElement('a');
    const blob = new Blob(['Dummy Content'], { type: 'text/plain' });
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="animate-fade-in space-y-6 max-w-7xl mx-auto pb-12">
      <style>{`
        @media print {
          @page {
            size: letter;
            margin: 0.5in;
          }
          
          /* Reset Styles for Print */
          html, body {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            overflow: visible !important;
          }

          /* Hide UI Elements completely */
          aside, nav, [class*="xl:w-80"], [class*="h-14"], .preview-toolbar, 
          button:not(#print-area *), .bg-slate-900, .bg-slate-950, .custom-scrollbar {
            display: none !important;
          }

          /* Force layout to be single column and full width */
          #root, .flex-1, .ml-64, .ml-20, .p-8 {
            margin: 0 !important;
            padding: 0 !important;
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            background: white !important;
          }

          /* Isolate and style the print area */
          #print-mount {
            display: block !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          #print-area {
            display: block !important;
            position: relative !important; /* Crucial for multi-page pagination */
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            transform: none !important; /* Force scale(1) */
            background: white !important;
            color: black !important;
            border: none !important;
            visibility: visible !important;
          }

          /* Ensure all sections are visible and handle page breaks */
          section {
            display: block !important;
            page-break-inside: avoid !important;
            margin-bottom: 2rem !important;
            visibility: visible !important;
          }
          
          header {
            page-break-after: avoid !important;
          }

          /* Fix Recharts visibility and rendering for print */
          .recharts-wrapper, .recharts-surface {
            visibility: visible !important;
            display: block !important;
            overflow: visible !important;
          }
          
          /* Prevent dark-mode colors from bleeding in */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          h1, h2, h3, h4, p, span, div, table, tr, td {
            color: black !important;
            background-color: transparent !important;
          }
          
          .bg-slate-100 { background-color: #f1f5f9 !important; }
          .bg-slate-50 { background-color: #f8fafc !important; }
          .text-emerald-600 { color: #059669 !important; }
          .text-blue-600 { color: #2563eb !important; }
          .text-slate-900 { color: #0f172a !important; }
        }
      `}</style>
      
      <div className="mb-6 border-b border-slate-800 pb-4">
         <h2 className="text-3xl font-black tracking-tight text-white mb-1">Report Builder</h2>
         <p className="text-slate-400 text-sm">Design, preview, and generate professional financial intelligence documents.</p>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        
        {/* LEFT PANEL: CONTROLS & HISTORY */}
        <div className="w-full xl:w-80 flex flex-col gap-6 shrink-0">
          
          {/* Settings Panel */}
          <div className="premium-card flex flex-col">
            <h3 className="text-white font-bold mb-4 tracking-wide border-b border-slate-700/50 pb-2 flex items-center gap-2">
               <FileText size={18} className="text-blue-400" /> Export Settings
            </h3>
            
            <div className="space-y-4 flex-1">
               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Select Company</label>
                  <select value={ticker} onChange={handleTickerChange} className="w-full bg-slate-900 text-white text-sm border border-slate-700 rounded py-2 px-3 outline-none focus:border-emerald-500 transition">
                     <option value="">-- Select a Target --</option>
                     {COMPANIES.map(opt => <option key={opt} value={opt}>{opt} - {MOCK_DATA[opt].name}</option>)}
                  </select>
               </div>

               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Report Format</label>
                  <select value={format} onChange={e => setFormat(e.target.value)} className="w-full bg-slate-900 text-white text-sm border border-slate-700 rounded py-2 px-3 outline-none focus:border-emerald-500 transition">
                     <option value="PDF">PDF Document (.pdf)</option>
                     <option value="Excel">Excel Spreadsheet (.xlsx)</option>
                     <option value="PowerPoint">PowerPoint Slide (.pptx)</option>
                  </select>
               </div>

               <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 border-b border-slate-700/50 pb-2">Include Sections</label>
                  <div className="space-y-1">
                     <CheckboxOption label="Company Overview" checked={sections.overview} onChange={() => toggleSection('overview')} />
                     <CheckboxOption label="Financial Health" checked={sections.health} onChange={() => toggleSection('health')} />
                     <CheckboxOption label="Growth Trend" checked={sections.growth} onChange={() => toggleSection('growth')} />
                     <CheckboxOption label="Peer Comparison" checked={sections.peer} onChange={() => toggleSection('peer')} />
                     <CheckboxOption label="Raw Financial Data" checked={sections.raw} onChange={() => toggleSection('raw')} />
                  </div>
               </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-700/50 flex flex-col gap-3">
               <button type="button" onClick={handleGenerateReport} disabled={!ticker} className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2.5 px-4 rounded transition flex justify-center items-center gap-2 w-full shadow-lg shadow-emerald-900/20">
                  <Activity size={18} /> Generate Report
               </button>
               <button type="button" onClick={exportReport} disabled={!isGenerated} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2.5 px-4 rounded transition flex justify-center items-center gap-2 w-full">
                  <FileDown size={18} /> Export {format}
               </button>
               <button type="button" onClick={exportCSV} disabled={!isGenerated} className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:bg-slate-900 disabled:text-slate-600 disabled:cursor-not-allowed text-slate-300 font-bold py-2.5 px-4 rounded transition flex justify-center items-center gap-2 w-full border border-slate-700">
                  <Download size={18} /> Export CSV
               </button>
            </div>
          </div>


        </div>

        {/* RIGHT PANEL: LIVE PREVIEW AREA */}
        <div className="flex-1 flex flex-col border border-slate-800 rounded-xl bg-slate-900/50 shadow-2xl overflow-hidden relative min-h-[800px]">
           
           {/* Preview Toolbar */}
           <div className="h-14 border-b border-slate-800 bg-slate-900 flex items-center justify-between px-4 shrink-0 shadow-sm z-10 relative">
              <div className="flex items-center gap-2">
                 <div className={`flex items-center gap-2 px-3 py-1 bg-slate-800/50 border border-slate-700 rounded ${isGenerated ? 'text-slate-300' : 'text-slate-500'} text-sm`}>
                    <div className={`w-2 h-2 rounded-full ${isGenerated ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`}></div>
                    Live Preview Engine
                 </div>
              </div>
              <div className="flex items-center gap-2">
                 <button type="button" onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} disabled={!isGenerated} className="disabled:opacity-50 p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"><ZoomOut size={18}/></button>
                 <span className="text-xs font-mono text-slate-500 w-12 text-center">{Math.round(zoom * 100)}%</span>
                 <button type="button" onClick={() => setZoom(z => Math.min(1.5, z + 0.1))} disabled={!isGenerated} className="disabled:opacity-50 p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"><ZoomIn size={18}/></button>
                 <div className="w-px h-5 bg-slate-700 mx-1"></div>
                 <button type="button" onClick={handlePrint} disabled={!isGenerated} className="flex items-center disabled:opacity-50 disabled:cursor-not-allowed gap-2 text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 px-3 py-1.5 rounded transition">
                    <Printer size={16}/> Print
                 </button>
              </div>
           </div>

           {!isGenerated ? (
             <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-950/80">
                 <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mb-6 shadow-xl">
                    <FileText size={40} className="text-slate-500" />
                 </div>
                 <h3 className="text-2xl font-black text-white mb-2 tracking-wide">No Report Generated</h3>
                 <p className="text-slate-400 mb-8 font-medium max-w-sm">Select a company and configure report sections to generate a financial insight report.</p>
                 <button 
                    disabled={true} 
                    className="bg-slate-800 text-slate-400 font-bold py-3 px-6 rounded-lg transition-colors flex items-center gap-2 opacity-50 cursor-not-allowed"
                 >
                    Select Company to Generate Report
                 </button>
             </div>
           ) : (
             <div className="flex-1 overflow-auto bg-slate-950/80 custom-scrollbar p-8 flex justify-center">
                <div id="print-mount">
                  <div id="print-area" ref={printRef} className="print-content origin-top transition-transform duration-300 bg-white text-slate-900 w-[816px] shadow-2xl pt-12 pb-12 px-12 relative" style={{ transform: `scale(${zoom})` }}>
                     
                     {/* Decorative Header Bar */}
                   <div className="absolute top-0 left-0 w-full h-2 bg-emerald-600"></div>

                   <header className="flex justify-between items-end border-b-2 border-slate-200 pb-6 mb-8">
                      <div>
                         <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-2">SEC EDGAR</h1>
                         <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Automated Financial Assessment</p>
                       </div>
                       <div className="text-right">
                          <p className="text-sm font-bold text-slate-800">{new Date().toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'})}</p>
                          <p className="text-xs text-slate-500 font-mono mt-1">Generated by SEC EDGAR</p>
                       </div>
                   </header>

                   {/* EXECUTIVE SUMMARY */}
                   <section className="mb-10">
                      <div className="flex items-center justify-between mb-4">
                         <h2 className="text-3xl font-black text-slate-900">{company.name} <span className="text-slate-400 font-medium text-2xl ml-2">({ticker})</span></h2>
                         <div className="px-4 py-2 bg-slate-100 rounded-lg border border-slate-200 flex flex-col items-center">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Acquisition Score</span>
                            <span className="text-3xl font-black text-emerald-600 leading-none">{company.score}</span>
                         </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 mb-6">
                         <div className="border border-slate-200 rounded p-3 bg-slate-50">
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sector</div>
                            <div className="font-bold text-slate-800 text-sm mt-1">{company.sector}</div>
                         </div>
                         <div className="border border-slate-200 rounded p-3 bg-slate-50">
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Revenue</div>
                            <div className="font-bold text-blue-600 text-sm mt-1">${company.rev}B</div>
                         </div>
                         <div className="border border-slate-200 rounded p-3 bg-slate-50">
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Revenue Growth</div>
                            <div className="font-bold text-emerald-600 text-sm mt-1">+{company.growth}%</div>
                         </div>
                         <div className="border border-slate-200 rounded p-3 bg-slate-50">
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Return on Equity</div>
                            <div className="font-bold text-slate-800 text-sm mt-1">{company.roe}%</div>
                         </div>
                      </div>
                   </section>

                   {sections.overview && (
                   <section className="mb-10">
                      <h3 className="text-lg font-black text-slate-900 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
                         <Building size={18} className="text-slate-400" /> Company Synopsis
                      </h3>
                      <p className="text-sm text-slate-700 leading-relaxed font-medium">
                         {company.desc}
                      </p>
                   </section>
                   )}

                   {sections.health && (
                   <section className="mb-10">
                      <h3 className="text-lg font-black text-slate-900 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
                         <Activity size={18} className="text-slate-400" /> Financial Health Matrix
                      </h3>
                      <div className="grid grid-cols-2 gap-8">
                         <div>
                            <table className="w-full text-sm text-left">
                               <tbody>
                                  <tr className="border-b border-slate-100">
                                      <td className="py-2 text-slate-500 font-medium text-left">EV/EBITDA Multiple</td>
                                     <td className="py-2 font-bold text-slate-900 text-right">{company.ev}x</td>
                                  </tr>
                                  <tr className="border-b border-slate-100">
                                      <td className="py-2 text-slate-500 font-medium text-left">ROE</td>
                                     <td className="py-2 font-bold text-slate-900 text-right">{company.roe}%</td>
                                  </tr>
                                  <tr className="border-b border-slate-100">
                                      <td className="py-2 text-slate-500 font-medium text-left">Health Classification</td>
                                     <td className="py-2 font-bold text-emerald-600 text-right uppercase text-xs">{company.health}</td>
                                  </tr>
                               </tbody>
                            </table>
                         </div>
                         <div className="flex flex-col justify-center bg-slate-50 p-4 border border-slate-200 rounded text-sm text-slate-600">
                            <p>The company maintains a <strong>{company.health.toLowerCase()}</strong> financial structural rating. Current multiple evaluations place EV/EBITDA at <strong>{company.ev}x</strong>, reflecting robust market premium capture. Core equity returns (ROE) remain strongly positioned at <strong>{company.roe}%</strong> against baseline industry averages.</p>
                         </div>
                      </div>
                   </section>
                   )}

                   {sections.growth && (
                   <section className="mb-10">
                      <h3 className="text-lg font-black text-slate-900 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
                         <BarChart2 size={18} className="text-slate-400" /> Revenue Trajectory
                      </h3>
                      <div className="flex justify-center pt-4">
                         <BarChart width={700} height={250} data={company.chart} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                           <XAxis dataKey="year" stroke="#475569" tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} />
                           <YAxis stroke="#475569" tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
                           <Bar dataKey="rev" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                         </BarChart>
                      </div>
                   </section>
                   )}

                   {sections.peer && (
                   <section className="mb-10">
                      <h3 className="text-lg font-black text-slate-900 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
                         <Activity size={18} className="text-slate-400" /> Peer Comparison Analytics
                      </h3>
                      <table className="w-full text-left text-sm">
                         <thead>
                            <tr className="bg-slate-100 border-y border-slate-200">
                               <th className="py-3 px-4 font-bold text-slate-600 text-left">Metric Indicator</th>
                               <th className="py-3 px-4 font-bold text-slate-900 text-right">Target ({ticker})</th>
                               <th className="py-3 px-4 font-bold text-slate-500 text-right">Sector Mean</th>
                               <th className="py-3 px-4 font-bold text-slate-500 text-right">Top Quartile</th>
                            </tr>
                         </thead>
                         <tbody>
                            {PEER_COMPARABLES.map((row, i) => (
                               <tr key={i} className="border-b border-slate-100">
                                  <td className="py-3 px-4 font-medium text-slate-600 text-left">{row.metric}</td>
                                  <td className="py-3 px-4 font-bold text-emerald-600 text-right">{row.target}</td>
                                  <td className="py-3 px-4 font-medium text-slate-500 text-right">{row.mean}</td>
                                  <td className="py-3 px-4 font-medium text-slate-400 text-right">{row.top}</td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                   </section>
                   )}

                   {sections.raw && (
                   <section className="mb-10 text-left">
                      <h3 className="text-lg font-black text-slate-900 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
                         <FileText size={18} className="text-slate-400" /> Raw Extraction Data Log
                      </h3>
                      <div className="bg-slate-900 text-slate-300 font-mono text-xs p-4 rounded leading-relaxed overflow-x-auto whitespace-pre">
{`{
  "companyId": "${ticker}",
  "extractionDate": "${new Date().toISOString()}",
  "taxonomy": "us-gaap",
  "dataset": [
    { "metric": "Revenues", "value": ${company.rev * 1000000000}, "unit": "USD", "period": "FY2023" },
    { "metric": "NetIncomeLoss", "value": ${Math.round(company.rev * 0.25 * 1000000000)}, "unit": "USD", "period": "FY2023" },
    { "metric": "ROE", "value": ${company.roe}, "unit": "PERCENT", "period": "FY2023" }
  ]
}`}
                      </div>
                   </section>
                   )}

                </div>
                </div>
             </div>
           )}

        </div>
      </div>
    </div>
  );
};

export default Reports;
