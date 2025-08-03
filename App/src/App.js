import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
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
import PaymentPage from "./payment-components/PaymentPage";
import GlobalNavbar from "./components/global/GlobalNavbar";
import LandingPage from "./components/global/landing-pages/Claude/LandingPage";
import LandingPage2 from "./components/global/landing-pages/Claude/LandingPage2";
import LandingPage3 from "./components/global/landing-pages/GPT/LandingPage3.jsx";
import LandingPage4 from "./components/global/landing-pages/GPT/LandingPage4.jsx";
import GlobalFooter from "./components/global/GlobalFooter.jsx";
import LandingPage5 from "./components/global/landing-pages/Claude/LandingPage5";
import LandingPage6 from "./components/global/landing-pages/GPT/LandingPage6.jsx";
import { useNavigate } from "react-router-dom";
const App = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Loginv2 />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* Protected routes */}
        {/* <Route path="/" element={<div>{navigate("/landing")}</div>} /> */}
        <Route
          path="/dashboard"
          element={
            <AuthProvider>
              <ProtectedRoute>
                <DataProvider>
                  <Navbar />

                  <div className="max-w-7xl mx-auto py-0">
                    <Dashboard />
                  </div>
                </DataProvider>
              </ProtectedRoute>
            </AuthProvider>
          }
        />

        <Route
          path="/payment"
          element={
            <div>
              <GlobalNavbar />
              <PaymentPage />
            </div>
          }
        />

        {/* Landing page variations */}
        <Route
          path="/landing"
          element={
            <>
              <GlobalNavbar
                options={{
                  features: true,
                  security: true,
                  pricing: true,
                  createFreeAccount: true,
                }}
              />
              <Outlet />
              <GlobalFooter />
            </>
          }
        >
          <Route index element={<LandingPage />} />
          <Route path="2" element={<LandingPage2 />} />
          <Route path="3" element={<LandingPage3 />} />
          <Route path="4" element={<LandingPage4 />} />
          <Route path="5" element={<LandingPage5 />} />
          <Route path="6" element={<LandingPage6 />} />
          {/* Fallback route - must be last */}
        </Route>
        {/* <Route path="/" element={<Navigate to="/dashboard" replace />} /> */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
};

export default App;
