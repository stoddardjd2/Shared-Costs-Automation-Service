import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
// import { DataProvider } from "./contexts/DataContext";
import Login from "./components/auth/Login";
import Dashboard from "./components/dashboard/Dashboard";
import NewCost from "./components/costs/NewCost";
import PaymentRequests from "./components/payments/PaymentRequests";
import Navigation from "./components/layout/Navigation";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AddCost from "./components/costs/AddCost";
import Navbar from "./components/dashboard/Navbar";
import Loginv2 from "./components/auth/Loginv2";
import Signup from "./components/auth/Signup";
import ResetPasswordPage from "./components/auth/ResetPasswordPage";
import { DataProvider } from "./contexts/DataContext";
const App = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Loginv2 />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/reset-password/:token"
            element={<ResetPasswordPage />}
          />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Navbar />

                <div className="max-w-7xl mx-auto py-8">
                  <Dashboard />
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DataProvider>
                  <Navbar />

                  <div className="max-w-7xl mx-auto py-0">
                    <Dashboard />
                  </div>
                </DataProvider>
              </ProtectedRoute>
            }
          />
          {/* <Route
              path="/costs/new"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <AddCost />
                  </div>
                </ProtectedRoute>
              }
            /> */}
          {/* <Route
              path="/costs/edit/:id"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <NewCost />
                  </div>
                </ProtectedRoute>
              }
            /> */}
          {/* <Route
              path="/costs/requests/:id?"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <PaymentRequests />
                  </div>
                </ProtectedRoute>
              }
            /> */}

          {/* Fallback route - must be last */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </div>
  );
};

export default App;
