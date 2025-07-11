import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';
import NewCost from './components/costs/NewCost';
import PaymentRequests from './components/payments/PaymentRequests';
import Navigation from './components/layout/Navigation';
import ProtectedRoute from './components/auth/ProtectedRoute';

const App = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AuthProvider>
        <DataProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Navigation />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  <Dashboard />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Navigation />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  <Dashboard />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/costs/new" element={
              <ProtectedRoute>
                <Navigation />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  <NewCost />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/costs/edit/:id" element={
              <ProtectedRoute>
                <Navigation />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  <NewCost />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/costs/requests/:id?" element={
              <ProtectedRoute>
                <Navigation />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  <PaymentRequests />
                </div>
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </DataProvider>
      </AuthProvider>
    </div>
  );
};

export default App;
