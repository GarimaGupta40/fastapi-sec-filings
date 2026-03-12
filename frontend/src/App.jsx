import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Companies from './pages/Companies';
import CompanyProfile from './pages/CompanyProfile';
import MarketOverview from './pages/MarketOverview';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/companies" replace />} />
          <Route path="companies" element={<Companies />} />
          <Route path="company/:ticker" element={<CompanyProfile />} />
          <Route path="market" element={<MarketOverview />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="reports" element={<Reports />} />
          <Route path="*" element={<Navigate to="/companies" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
