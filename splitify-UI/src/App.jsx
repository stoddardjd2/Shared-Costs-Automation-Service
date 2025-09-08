import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
// import { DataProvider } from "./contexts/DataContext";
import Login from "./components/auth/Login";
import Dashboard from "./components/dashboard/Dashboard";
// import NewCost from "./components/costs/NewCost.jsx";
import PaymentRequests from "./components/payments/PaymentRequests";
import Navigation from "./components/layout/Navigation";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AddCost from "./components/costs/AddCost.jsx";
import Navbar from "./components/dashboard/Navbar";
import Loginv2 from "./components/auth/Loginv2";
import Signup from "./components/auth/Signup";
import ResetPasswordPage from "./components/auth/ResetPasswordPage";
import { DataProvider } from "./contexts/DataContext";
import PaymentPage from "./payment-components/PaymentPage";
import GlobalNavbar from "./components/global/GlobalNavbar";
import LandingPage from "./components/global/landing-pages/Claude/LandingPage";
import LandingPageOfficial from "./components/global/landing-pages/figma/LandingPage";
import LandingPage2 from "./components/global/landing-pages/Claude/LandingPage2";
import LandingPage3 from "./components/global/landing-pages/GPT/LandingPage3.jsx";
import LandingPage4 from "./components/global/landing-pages/GPT/LandingPage4.jsx";
import GlobalFooter from "./components/global/GlobalFooter.jsx";
import LandingPage5 from "./components/global/landing-pages/Claude/LandingPage5";
import LandingPage6 from "./components/global/landing-pages/GPT/LandingPage6.jsx";
import { useNavigate } from "react-router-dom";
import SmsOptInPage from "./components/global/opt-in-pages/SmsOptInPage.jsx";
import PrivacyPolicy from "./components/global/about/PrivacyPolicy.jsx";
import TermsAndConditions from "./components/global/about/TermsAndConditions.jsx";
import PaymentPortal from "./components/global/PaymentPortal.jsx";
import PlaidSandboxDemo from "./components/plaid/PlaidSandboxDemo.jsx";
import PlaidSandboxDemoUserFlow from "./components/plaid/PlaidSandboxDemoUserFlow.jsx";
import LandingPageCustom from "./components/global/landing-pages/LandingPageCustom.jsx";
import FixedBackgroundSection from "./components/global/landing-pages/figma/sections/section-4/FixedBackgroundSection.jsx";
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
                  <div className="max-w-7xl mx-auto py-0 pt-[50px]">
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
                  // features: true,
                  // security: true,
                  // pricing: true,
                  createFreeAccount: true,
                  // signup: true,
                  isFullScreenMobileMode: true,
                  login: true,
                }}
              />
              <Outlet />
              <GlobalFooter />
            </>
          }
        >
          <Route index element={<LandingPageOfficial />} />
          <Route path="1" element={<LandingPage />} />
          <Route path="2" element={<LandingPage2 />} />
          <Route path="3" element={<LandingPage3 />} />
          <Route path="4" element={<LandingPage4 />} />
          <Route path="5" element={<LandingPage5 />} />
          <Route path="6" element={<LandingPage6 />} />
          <Route path="7" element={<LandingPageCustom />} />
          <Route path="test" element={<FixedBackgroundSection />} />
          {/* Fallback route - must be last */}
        </Route>

        <Route
          path="/smsOptIn"
          element={
            <>
              <GlobalNavbar
                options={{
                  features: false,
                  security: false,
                  pricing: false,
                  createFreeAccount: true,
                  // login:true,
                  signup: true,
                }}
              />
              <SmsOptInPage />
            </>
          }
        />
        <Route
          path="/about"
          element={
            <>
              <GlobalNavbar
                options={{
                  features: false,
                  security: false,
                  pricing: false,
                  createFreeAccount: true,
                  // login:true,
                  signup: true,
                }}
              />
              <Outlet />
              <GlobalFooter />
            </>
          }
        >
          <Route path="privacyPolicy" element={<PrivacyPolicy />}></Route>
          <Route
            path="termsAndConditions"
            element={<TermsAndConditions />}
          ></Route>
        </Route>
        <Route
          path="/PaymentPortal"
          element={
            <>
              <GlobalNavbar
                options={{
                  features: false,
                  security: false,
                  pricing: false,
                  createFreeAccount: true,
                  // login:true,
                  signup: true,
                }}
              />
              <PaymentPortal />
            </>
          }
        ></Route>
        {/* <Route path="/" element={<Navigate to="/dashboard" replace />} /> */}
        <Route path="/plaidSandboxDemo" element={<PlaidSandboxDemo />} />
        <Route
          path="/PlaidSandboxDemoUserFlow"
          element={<PlaidSandboxDemoUserFlow />}
        />

        <Route path="*" element={<Navigate to="/landing" replace />} />
      </Routes>
    </div>
  );
};

export default App;
