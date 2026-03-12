import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const PeerComparison = ({ data }) => {
  if (!data?.peer_comparison || "error" in data.peer_comparison) return (
    <div className="glass-panel p-6 flex items-center justify-center text-slate-400">
      Select a Technology or Banking stock (like AAPL or JPM) to view dynamic peers.
    </div>
  );

  const pc = data.peer_comparison;
  const labels = pc.peer_summary.map(p => p.ticker);
  
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Revenue Growth (%)',
        data: pc.peer_summary.map(p => p.revenue_growth * 100),
        backgroundColor: 'rgba(59, 130, 246, 0.6)', 
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        borderRadius: 4
      },
      {
        label: 'ROE (%)',
        data: pc.peer_summary.map(p => p.roe * 100),
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
        borderRadius: 4
      },
      {
        label: 'EBITDA Margin (%)',
        data: pc.peer_summary.map(p => p.ebitda_margin * 100 || 0),
        backgroundColor: 'rgba(245, 158, 11, 0.6)',
        borderColor: 'rgba(245, 158, 11, 1)',
        borderWidth: 1,
        borderRadius: 4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: '#e2e8f0'} },
    },
    scales: {
      y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(51, 65, 85, 0.4)' } },
      x: { ticks: { color: '#94a3b8' }, grid: { display: false } }
    }
  };

  return (
    <div className="glass-panel p-6 h-[400px] flex flex-col">
       <h2 className="text-xl font-bold mb-4 text-slate-300 tracking-wide">Peer Comparison <span className="text-sm font-normal text-blue-400">({labels.join(', ')})</span></h2>
       <div className="flex-grow w-full">
         <Bar data={chartData} options={options} />
       </div>
    </div>
  );
};

export default PeerComparison;
