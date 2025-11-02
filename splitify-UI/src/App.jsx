// import Test from "./components/Test.jsx";

// App.jsx
import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate, Outlet, useNavigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";

// 🔹 Lazily load everything that isn't needed for the first paint.
//    Especially anything that might import Stripe.
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
// const LandingPage = lazy(() => import("./components/global/landing-pages/Claude/LandingPage"));
// const LandingPage2 = lazy(() => import("./components/global/landing-pages/Claude/LandingPage2"));

const PaymentPage = lazy(() => import("./payment-components/PaymentPage"));
const PaymentPortal = lazy(() =>
  import("./components/global/PaymentPortal.jsx")
);

// Other pages
const SmsOptInPage = lazy(() =>
  import("./components/global/opt-in-pages/SmsOptInPage.jsx")
);
const PrivacyPolicy = lazy(() =>
  import("./components/global/about/PrivacyPolicy.jsx")
);
const TermsAndConditions = lazy(() =>
  import("./components/global/about/TermsAndConditions.jsx")
);

// If you have protected route wrapper, keep it non-lazy if it's tiny.
// Otherwise you can lazy it too:
import ProtectedRoute from "./components/auth/ProtectedRoute";

const Fallback = () => null; // or a tiny spinner

const App = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<Fallback />}>
        <Routes>
          {/* Public routes */}
          {/* <Route path="/test" element={<Test />} /> */}

          <Route path="/" element={<LandingPageV2 />} />

          <Route path="/landing/*" element={<LandingPageV2 />}></Route>
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

          {/* Stripe pages (lazy chunk; won’t load on /landing) */}
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
            <Route path="termsAndConditions" element={<TermsAndConditions />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </div>
  );
};

export default App;
