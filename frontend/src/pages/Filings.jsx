import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ChevronDown, ChevronUp, ChevronsUpDown, MoreVertical, ExternalLink, Database, Download, FileText, CheckCircle, BarChart2, Building2 } from 'lucide-react';

const TODAY = new Date();
const getDateAgo = (days) => {
  const d = new Date(TODAY);
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
};

const MOCK_FILINGS = [
  { id: 1, company: 'AAPL', type: '10-K', date: getDateAgo(10), status: 'Processed' },
  { id: 2, company: 'MSFT', type: '10-Q', date: getDateAgo(25), status: 'Processed' },
  { id: 3, company: 'JPM', type: '8-K', date: getDateAgo(5), status: 'Pending' },
  { id: 4, company: 'AMZN', type: 'DEF-14A', date: getDateAgo(40), status: 'Parsing' },
  { id: 5, company: 'GOOGL', type: '10-K', date: getDateAgo(100), status: 'Processed' },
  { id: 6, company: 'BAC', type: 'S-1', date: getDateAgo(150), status: 'Processed' },
  { id: 7, company: 'GS', type: '10-Q', date: getDateAgo(80), status: 'Processed' },
  { id: 8, company: 'META', type: '8-K', date: getDateAgo(200), status: 'Error' },
  { id: 9, company: 'AAPL', type: '10-Q', date: getDateAgo(110), status: 'Processed' },
  { id: 10, company: 'MSFT', type: '10-K', date: getDateAgo(300), status: 'Processed' },
  { id: 11, company: 'JPM', type: '10-K', date: getDateAgo(400), status: 'Processed' },
  { id: 12, company: 'AMZN', type: '10-Q', date: getDateAgo(130), status: 'Processed' },
  { id: 13, company: 'GOOGL', type: '10-Q', date: getDateAgo(190), status: 'Processed' },
  { id: 14, company: 'BAC', type: '10-K', date: getDateAgo(350), status: 'Processed' },
  { id: 15, company: 'GS', type: '10-K', date: getDateAgo(370), status: 'Processed' },
  { id: 16, company: 'META', type: '10-K', date: getDateAgo(380), status: 'Processed' },
];

const StatusBadge = ({ status }) => {
  let color = 'bg-slate-500/10 text-slate-400 border-slate-500/30';
  if (status === 'Processed') color = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  else if (status === 'Pending') color = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  else if (status === 'Parsing') color = 'bg-blue-500/10 text-blue-400 border-blue-500/30';
  else if (status === 'Error') color = 'bg-rose-500/10 text-rose-400 border-rose-500/30';

  return <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${color}`}>{status}</span>;
};

const TypeBadge = ({ type }) => {
  let color = 'bg-slate-500/10 text-slate-400 border-slate-500/30';
  if (type === '10-K') color = 'bg-blue-500/10 text-blue-400 border-blue-500/30';
  else if (type === '10-Q') color = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  else if (type === '8-K') color = 'bg-orange-500/10 text-orange-400 border-orange-500/30';
  else if (type === 'DEF-14A') color = 'bg-purple-500/10 text-purple-400 border-purple-500/30';
  else if (type === 'S-1') color = 'bg-pink-500/10 text-pink-400 border-pink-500/30';

  return <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold tracking-wider border shadow-sm ${color}`}>{type}</span>;
};

const ActionMenu = ({ company }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="relative inline-block text-left" onMouseLeave={() => setOpen(false)}>
      <button onClick={() => setOpen(!open)} className="p-1.5 hover:bg-slate-700 rounded-md text-slate-400 hover:text-white transition cursor-pointer">
        <MoreVertical size={18} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-56 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden py-1">
          <button onClick={() => window.open('https://www.sec.gov', '_blank')} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition">
            <ExternalLink size={16} className="text-indigo-400"/> View SEC Filing
          </button>
          <button onClick={() => navigate(`/company/${company}`)} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition">
            <Database size={16} className="text-emerald-400"/> View Extracted Data
          </button>
          <button className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition">
            <Download size={16} className="text-blue-400"/> Download Filing PDF
          </button>
        </div>
      )}
    </div>
  );
};

const Filings = () => {
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [companyFilter, setCompanyFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

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

  const currentData = useMemo(() => {
    let filtered = MOCK_FILINGS.filter(f => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = f.company.toLowerCase().includes(term) || f.type.toLowerCase().includes(term);
      const matchesType = typeFilter === 'All' || f.type === typeFilter;
      const matchesCompany = companyFilter === 'All' || f.company === companyFilter;
      
      let matchesDate = true;
      const fDate = new Date(f.date);
      if (dateFilter === '30d') matchesDate = fDate >= new Date(TODAY.getTime() - 30 * 24 * 60 * 60 * 1000);
      else if (dateFilter === '3m') matchesDate = fDate >= new Date(TODAY.getTime() - 90 * 24 * 60 * 60 * 1000);
      else if (dateFilter === '1y') matchesDate = fDate >= new Date(TODAY.getTime() - 365 * 24 * 60 * 60 * 1000);

      return matchesSearch && matchesType && matchesCompany && matchesDate;
    });

    filtered.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      if (sortConfig.key === 'date') {
         aVal = new Date(aVal).getTime();
         bVal = new Date(bVal).getTime();
      }
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [searchTerm, typeFilter, companyFilter, dateFilter, sortConfig]);

  return (
    <div className="animate-fade-in space-y-6 max-w-7xl mx-auto pb-12">
      <div className="mb-6 border-b border-slate-800 pb-4">
         <h2 className="text-3xl font-black tracking-tight text-white mb-1">SEC Filings Explorer</h2>
         <p className="text-slate-400 text-sm">Advanced research interface for parsing and analyzing historical corporate documents.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xl flex flex-wrap gap-4 items-center mb-6">
        <div className="relative flex-1 min-w-[250px]">
          <Search size={18} className="absolute left-3 top-2.5 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search company ticker or filing..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border-slate-700 text-sm text-white focus:ring-1 focus:ring-emerald-500 border rounded py-2 pl-10 pr-4 outline-none transition-colors"
          />
        </div>
        
        <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-500" />
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="bg-slate-800 text-slate-300 text-sm border border-slate-700 rounded py-2 px-3 outline-none cursor-pointer focus:border-emerald-500">
               <option value="All">All Types</option>
               <option value="10-K">10-K</option>
               <option value="10-Q">10-Q</option>
               <option value="8-K">8-K</option>
               <option value="DEF-14A">DEF-14A</option>
               <option value="S-1">S-1</option>
            </select>
            
            <select value={companyFilter} onChange={(e) => setCompanyFilter(e.target.value)} className="bg-slate-800 text-slate-300 text-sm border border-slate-700 rounded py-2 px-3 outline-none cursor-pointer focus:border-emerald-500 max-w-[150px]">
               <option value="All">All Companies</option>
               <option value="AAPL">AAPL</option>
               <option value="MSFT">MSFT</option>
               <option value="GOOGL">GOOGL</option>
               <option value="JPM">JPM</option>
               <option value="BAC">BAC</option>
               <option value="GS">GS</option>
               <option value="META">META</option>
            </select>
            
            <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="bg-slate-800 text-slate-300 text-sm border border-slate-700 rounded py-2 px-3 outline-none cursor-pointer focus:border-emerald-500">
               <option value="All">All Time</option>
               <option value="30d">Last 30 days</option>
               <option value="3m">Last 3 months</option>
               <option value="1y">Last year</option>
            </select>
        </div>
      </div>

      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-700/50 bg-slate-900/50 text-slate-300 uppercase text-xs tracking-wider">
                <th className="py-4 px-6 font-semibold cursor-pointer hover:text-white transition group w-1/4" onClick={() => handleSort('company')}>
                  <div className="flex items-center gap-1">Company {getSortIcon('company')}</div>
                </th>
                <th className="py-4 px-6 font-semibold cursor-pointer hover:text-white transition group w-1/4" onClick={() => handleSort('type')}>
                  <div className="flex items-center gap-1">Filing Type {getSortIcon('type')}</div>
                </th>
                <th className="py-4 px-6 font-semibold cursor-pointer hover:text-white transition group w-1/4" onClick={() => handleSort('date')}>
                  <div className="flex items-center gap-1">Date {getSortIcon('date')}</div>
                </th>
                <th className="py-4 px-6 font-semibold w-1/6 text-center">Status</th>
                <th className="py-4 px-6 font-semibold w-1/12 text-center">View</th>
              </tr>
            </thead>
            <tbody>
              {currentData.length > 0 ? (
                 currentData.map(row => (
                   <tr key={row.id} className="border-b border-slate-700/30 hover:bg-slate-800/80 transition-colors duration-150 group">
                     <td className="py-5 px-6 font-bold text-white group-hover:text-blue-400 cursor-pointer" onClick={() => navigate(`/company/${row.company}`)}>
                       {row.company}
                     </td>
                     <td className="py-5 px-6">
                        <TypeBadge type={row.type} />
                     </td>
                     <td className="py-5 px-6 font-mono text-slate-300 text-sm">{row.date}</td>
                     <td className="py-5 px-6 text-center">
                        <StatusBadge status={row.status} />
                     </td>
                     <td className="py-5 px-6 text-center">
                        <ActionMenu company={row.company} filingId={row.id} />
                     </td>
                   </tr>
                 ))
              ) : (
                 <tr>
                    <td colSpan="5" className="py-16 text-center text-slate-500 font-medium">No filings match the selected criteria.</td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Filings;
