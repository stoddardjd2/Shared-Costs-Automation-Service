import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate, Outlet, useNavigate } from "react-router-dom";
import { Component } from "react";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";

// Lazies
// const Test = lazy(() => import("./components/Test.jsx"));

const Loginv2 = lazy(() => import("./components/auth/Loginv2"));
const Signup = lazy(() => import("./components/auth/Signup"));
const ResetPasswordPage = lazy(() =>
  import("./components/auth/ResetPasswordPage")
);

const Dashboard = lazy(() => import("./components/dashboard/Dashboard"));
const Navbar = lazy(() => import("./components/dashboard/Navbar"));

const GlobalNavbar = lazy(() => import("./components/global/GlobalNavbar"));
const GlobalFooter = lazy(() => import("./components/global/GlobalFooter.jsx"));

const LandingPageOfficial = lazy(() =>
  import("./components/global/landing-pages/figma/LandingPage")
);

const LandingPageV2 = lazy(() =>
  import("./components/global/landing-pages/landingV2/LandingPageV2")
);

const PaymentPage = lazy(() => import("./payment-components/PaymentPage"));
const PaymentPortal = lazy(() =>
  import("./components/global/PaymentPortal.jsx")
);

const SmsOptInPage = lazy(() =>
  import("./components/global/opt-in-pages/SmsOptInPage.jsx")
);
const PrivacyPolicy = lazy(() =>
  import("./components/global/about/PrivacyPolicy.jsx")
);
const TermsAndConditions = lazy(() =>
  import("./components/global/about/TermsAndConditions.jsx")
);

// Minimal fallback to avoid blank screen during chunk fetch
const Fallback = () => (
  <div className="min-h-screen grid place-items-center">
    <div className="animate-spin h-6 w-6 rounded-full border-2 border-gray-300 border-t-transparent" />
  </div>
);

const App = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<Fallback />}>
        <ChunkErrorBoundary>
          <Routes>
            {/* Public routes */}
            {/* <Route path="/test" element={<Test />} /> */}

            <Route path="/" element={<LandingPageV2 />} />
            <Route path="/landing/*" element={<LandingPageV2 />} />
            <Route path="/landing/2" element={<LandingPageOfficial />} />

            <Route path="/login" element={<Loginv2 />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/reset-password/:token"
              element={<ResetPasswordPage />}
            />

            {/* Protected routes */}
            <Route
              path="/dashboard/*"
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

            {/* Stripe/payment-related */}
            <Route
              path="/payment"
              element={
                <>
                  <GlobalNavbar />
                  <PaymentPage />
                </>
              }
            />
            <Route
              path="/PaymentPortal"
              element={
                <>
                  <GlobalNavbar />
                  <PaymentPortal />
                </>
              }
            />

            {/* Misc pages */}
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
                      signup: true,
                    }}
                  />
                  <Outlet />
                  <GlobalFooter />
                </>
              }
            >
              <Route path="privacyPolicy" element={<PrivacyPolicy />} />
              <Route
                path="termsAndConditions"
                element={<TermsAndConditions />}
              />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </ChunkErrorBoundary>
      </Suspense>
    </div>
  );
};

export default App;

class ChunkErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(err) {
    const msg = String(err?.message || "");
    const once = sessionStorage.getItem("chunk-reloaded");
    const isChunkLoadError =
      msg.includes("Loading chunk") ||
      msg.includes("Failed to fetch dynamically imported module") ||
      msg.includes("ChunkLoadError");

    if (!once && isChunkLoadError) {
      sessionStorage.setItem("chunk-reloaded", "1");
      location.reload();
    }
  }

  render() {
    // If we get here *and* reload didn't happen (e.g., other errors), render nothing.
    return this.state.hasError ? null : this.props.children;
  }
}
