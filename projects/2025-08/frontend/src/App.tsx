import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import BecomeExpertPage from './pages/BecomeExpertPage';
import AuditServicesPage from './pages/AuditServicesPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/become-expert" element={<BecomeExpertPage />} />
          <Route path="/audit-services" element={<AuditServicesPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;