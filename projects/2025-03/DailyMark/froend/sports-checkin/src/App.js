import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './contexts/AppContext';
import LoginPage from './pages/LoginPage';
import CheckInPage from './pages/CheckInPage';
import MedalsPage from './pages/MedalsPage';
import Navigation from './components/Navigation';
import './App.css';

// 受保护的路由
const ProtectedRoute = ({ children }) => {
  const { isConnected } = useApp();
  
  if (!isConnected) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <>
      <Navigation />
      {children}
    </>
  );
};

function AppRoutes() {
  const { isConnected } = useApp();
  
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={
            isConnected ? <Navigate to="/checkin" /> : <LoginPage />
          } />
          <Route path="/checkin" element={
            <ProtectedRoute>
              <CheckInPage />
            </ProtectedRoute>
          } />
          <Route path="/medals" element={
            <ProtectedRoute>
              <MedalsPage />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}

export default App;
