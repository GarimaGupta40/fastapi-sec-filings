import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, ChevronUp, ChevronsUpDown, Filter } from 'lucide-react';

const mockCompanies = [
  { ticker: 'AAPL', name: 'Apple Inc.', sector: 'Technology', revValue: 383.3, revenue: '$383.3B', revGrowth: 8.2, acqScore: 82 },
  { ticker: 'MSFT', name: 'Microsoft Corp.', sector: 'Technology', revValue: 211.9, revenue: '$211.9B', revGrowth: 11.5, acqScore: 85 },
  { ticker: 'AMZN', name: 'Amazon.com, Inc.', sector: 'Retail', revValue: 514.0, revenue: '$514.0B', revGrowth: 11.0, acqScore: 80 },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology', revValue: 282.8, revenue: '$282.8B', revGrowth: 9.8, acqScore: 88 },
  { ticker: 'META', name: 'Meta Platforms, Inc.', sector: 'Technology', revValue: 116.6, revenue: '$116.6B', revGrowth: -1.1, acqScore: 79 },
  { ticker: 'TSLA', name: 'Tesla Inc.', sector: 'Technology', revValue: 96.8, revenue: '$96.8B', revGrowth: 18.8, acqScore: 72 },
  { ticker: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Banking', revValue: 128.6, revenue: '$128.6B', revGrowth: 8.5, acqScore: 85 },
  { ticker: 'GS', name: 'Goldman Sachs Group', sector: 'Banking', revValue: 47.3, revenue: '$47.3B', revGrowth: 4.5, acqScore: 65 },
  { ticker: 'BAC', name: 'Bank of America Corp', sector: 'Banking', revValue: 94.9, revenue: '$94.9B', revGrowth: 6.1, acqScore: 82 },
  { ticker: 'NVDA', name: 'NVIDIA Corp.', sector: 'Technology', revValue: 60.9, revenue: '$60.9B', revGrowth: 125.8, acqScore: 91 }
];

const SectorBadge = ({ sector }) => {
  const styles = {
    Technology: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    Banking: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    Retail: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
  };
  
  const selectedClass = styles[sector] || 'bg-slate-500/10 text-slate-400 border-slate-500/30';

  return (
    <span className={`px-2.5 py-1 rounded border text-xs font-bold uppercase tracking-wider ${selectedClass}`}>
      {sector}
    </span>
  );
};

const ScoreBar = ({ score }) => {
  let color = 'bg-rose-500';
  if (score >= 90) color = 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]';
  else if (score >= 75) color = 'bg-emerald-400';
  else if (score >= 60) color = 'bg-amber-400';

  return (
    <div className="flex items-center gap-3 w-40">
      <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${score}%` }}></div>
      </div>
      <span className="font-mono text-xs font-bold text-white min-w-[32px]">{score}%</span>
    </div>
  );
};

const Companies = () => {
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState('All');
  const [revenueFilter, setRevenueFilter] = useState('All');
  
  const [sortConfig, setSortConfig] = useState({ key: 'acqScore', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ChevronsUpDown size={14} className="text-slate-500" />;
    return sortConfig.direction === 'asc' ? <ChevronUp size={14} className="text-emerald-400" /> : <ChevronDown size={14} className="text-emerald-400" />;
  };

  const filteredAndSortedData = useMemo(() => {
    let filtered = mockCompanies.filter(company => {
      // Search Math
      const term = searchTerm.toLowerCase();
      const matchesSearch = company.name.toLowerCase().includes(term) || company.ticker.toLowerCase().includes(term) || company.sector.toLowerCase().includes(term);
      
      // Sector Match
      const matchesSector = sectorFilter === 'All' || company.sector === sectorFilter;
      
      // Revenue Match
      let matchesRev = true;
      if (revenueFilter === '>500B') matchesRev = company.revValue > 500;
      else if (revenueFilter === '>200B') matchesRev = company.revValue > 200;
      else if (revenueFilter === '>100B') matchesRev = company.revValue > 100;
      else if (revenueFilter === '>50B') matchesRev = company.revValue > 50;

      return matchesSearch && matchesSector && matchesRev;
    });

    filtered.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [searchTerm, sectorFilter, revenueFilter, sortConfig]);

  const currentData = filteredAndSortedData;

  return (
    <div className="animate-fade-in space-y-6 max-w-7xl mx-auto pb-12">
      <div className="mb-6 border-b border-slate-800 pb-4">
         <h2 className="text-3xl font-black tracking-tight text-white mb-1">Company Directory</h2>
         <p className="text-slate-400 text-sm">Explore and filter top acquisition targets using standardized financial indicators.</p>
      </div>
      
      {/* FILTER BAR */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xl flex flex-wrap gap-4 items-center mb-6">
        <div className="relative flex-1 min-w-[250px]">
          <Search size={18} className="absolute left-3 top-2.5 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search company or ticker..." 
            value={searchTerm}
            onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
            className="w-full bg-slate-800 border-slate-700 text-sm text-white focus:ring-1 focus:ring-emerald-500 border rounded py-2 pl-10 pr-4 outline-none transition-colors"
          />
        </div>
        
        <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-500" />
            <select value={sectorFilter} onChange={(e) => {setSectorFilter(e.target.value); setCurrentPage(1);}} className="bg-slate-800 text-slate-300 text-sm border border-slate-700 rounded py-2 px-3 outline-none cursor-pointer focus:border-emerald-500">
               <option value="All">All Sectors</option>
               <option value="Technology">Technology</option>
               <option value="Banking">Banking</option>
               <option value="Retail">Retail</option>
            </select>
            
            <select value={revenueFilter} onChange={(e) => {setRevenueFilter(e.target.value); setCurrentPage(1);}} className="bg-slate-800 text-slate-300 text-sm border border-slate-700 rounded py-2 px-3 outline-none cursor-pointer focus:border-emerald-500">
               <option value="All">All Revenue</option>
               <option value=">500B">Rev &gt; $500B</option>
               <option value=">200B">Rev &gt; $200B</option>
               <option value=">100B">Rev &gt; $100B</option>
               <option value=">50B">Rev &gt; $50B</option>
            </select>
        </div>
      </div>

      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-slate-700/50 bg-slate-900/50">
                <th className="py-4 px-6 font-semibold text-slate-300 uppercase text-xs tracking-wider text-left">
                  Company
                </th>
                <th className="py-4 px-6 font-semibold text-slate-300 uppercase text-xs tracking-wider text-center">
                  Sector
                </th>
                <th className="py-4 px-6 font-semibold text-slate-300 uppercase text-xs tracking-wider cursor-pointer hover:text-white transition group text-right" onClick={() => handleSort('revValue')}>
                  <div className="flex items-center justify-end gap-1">Revenue {getSortIcon('revValue')}</div>
                </th>
                <th className="py-4 px-6 font-semibold text-slate-300 uppercase text-xs tracking-wider cursor-pointer hover:text-white transition group text-right" onClick={() => handleSort('revGrowth')}>
                  <div className="flex items-center justify-end gap-1">Growth {getSortIcon('revGrowth')}</div>
                </th>
                <th className="py-4 px-6 font-semibold text-slate-300 uppercase text-xs tracking-wider cursor-pointer hover:text-white transition group text-center" onClick={() => handleSort('acqScore')}>
                  <div className="flex items-center justify-center gap-1">Acquisition Score {getSortIcon('acqScore')}</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {currentData.length > 0 ? (
                 currentData.map(row => (
                   <tr 
                     key={row.ticker} 
                     onClick={() => navigate(`/company/${row.ticker}`)}
                     className="border-b border-slate-700/30 hover:bg-slate-800/80 cursor-pointer transition-colors duration-150 group"
                   >
                     <td className="py-5 px-6 text-left">
                       <span className="font-bold text-white group-hover:text-blue-400">{row.name} – {row.ticker}</span>
                     </td>
                     <td className="py-5 px-6 text-center">
                        <SectorBadge sector={row.sector} />
                     </td>
                     <td className="py-5 px-6 font-mono text-white text-sm font-bold text-right">{row.revenue}</td>
                     <td className={`py-5 px-6 font-mono text-sm font-bold text-right ${row.revGrowth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {row.revGrowth > 0 ? '+' : ''}{row.revGrowth}%
                     </td>
                     <td className="py-5 px-6 text-center">
                        <div className="flex justify-center">
                           <ScoreBar score={row.acqScore} />
                        </div>
                     </td>
                   </tr>
                 ))
              ) : (
                 <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-500 font-medium">No target companies match the selected criteria.</td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
        
      </div>
    </div>
  );
};

export default Companies;
