import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import EmptyChartState from './EmptyChartState';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const AcquisitionScore = ({ data }) => {
  if (!data?.acquisition_score) return null;

  const acq = data.acquisition_score;
  const metrics = [
    acq.financial_distress,
    acq.valuation_attractiveness,
    acq.market_position,
    acq.operational_efficiency
  ];

  const chartData = {
    labels: [
      'Financial Resilience', 
      'Valuation Attractiveness', 
      'Market Position', 
      'Operational Efficiency'
    ],
    datasets: [
      {
        label: 'Score (100 Max)',
        data: metrics,
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: 'rgba(99, 102, 241, 1)',
        pointBackgroundColor: 'rgba(99, 102, 241, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        pointLabels: { color: '#cbd5e1', font: { size: 11, family: 'Inter' } },
        ticks: { display: false, min: 0, max: 100 }
      }
    },
    plugins: {
      legend: { display: false }
    }
  };

  return (
    <div className="glass-panel p-6 flex flex-col items-center justify-center">
      <h2 className="text-xl font-bold mb-2 text-slate-300 tracking-wide w-full text-left">Acquisition Attractiveness</h2>
      <div className="w-full max-w-[300px] h-[300px]">
        {metrics.some(val => val !== undefined && val !== null) ? (
          <Radar data={chartData} options={options} />
        ) : (
          <EmptyChartState message="No score data" subtitle="Acquisition attractiveness metrics are not available for this company." height="300px" />
        )}
      </div>
    </div>
  );
};

export default AcquisitionScore;
