import React, { useState } from 'react';

const CompanySearch = ({ onSearch, loading }) => {
  const [ticker, setTicker] = useState('AAPL');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!ticker) return;
    onSearch(ticker.toUpperCase());
  };

  return (
    <div className="glass-panel p-8 mb-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
      
      <h1 className="text-4xl font-extrabold mb-2 glow-text tracking-tight">SEC EDGAR</h1>
      <p className="text-slate-400 mb-6 max-w-lg mx-auto">
        Deep SEC XBRL scanning, peer analysis, and automated acquisition target discovery.
      </p>

      <form onSubmit={handleSubmit} className="flex gap-4 w-full max-w-xl mx-auto items-center group">
        <div className="relative flex-grow">
          <input 
            type="text" 
            placeholder="Search Ticker (e.g. MSFT, AAPL, JPM)" 
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-600 rounded-xl px-5 py-4 text-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-inner uppercase"
            disabled={loading}
          />
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 group-hover:text-blue-400 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <button 
          type="submit"
          className={`bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-8 rounded-xl transition-all flex items-center shadow-lg hover:shadow-blue-500/30 active:scale-95 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Scanning SEC...</span>
            </span>
          ) : (
             "Analyze Target"
          )}
        </button>
      </form>
    </div>
  );
};

export default CompanySearch;
