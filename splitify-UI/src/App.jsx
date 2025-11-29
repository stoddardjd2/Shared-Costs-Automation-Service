// import Test from "./components/Test.jsx";

// App.jsx
import React, { Suspense, lazy, useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  Outlet,
  useNavigate,
  useParams,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";
const VideoPromptGenerator = lazy(() =>
  import("./components/admin/social-media-tools/VideoPromptGenerator.jsx")
);
const Unauthorized = lazy(() => import("./components/auth/Unauthorized.jsx"));
const AdminUsersOverview = lazy(() =>
  import("./components/admin/AdminUsersOverview.jsx")
);

const AdminProtectedRoute = lazy(() =>
  import("./components/auth/AdminProtectedRoute.jsx")
);

const TikTokUploader = lazy(() =>
  import("./components/admin/social-media-tools/TikTokUploader.jsx")
);

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

const LandingPageV1 = lazy(() =>
  import("./components/global/landing-pages/figma/LandingPage")
);

const LandingPageV2 = lazy(() =>
  import("./components/global/landing-pages/landingV2/LandingPageV2")
);

const LandingPageV3 = lazy(() =>
  import("./components/global/landing-pages/landingV3/LandingPageV3")
);
// const LandingPage = lazy(() => import("./components/global/landing-pages/Claude/LandingPage"));
// const LandingPage2 = lazy(() => import("./components/global/landing-pages/Claude/LandingPage2"));

const PaymentPage = lazy(() => import("./payment-components/PaymentPage"));
const PaymentPortal = lazy(() =>
  import("./components/global/PaymentPortal.jsx")
);

// Mark as paid link page for owner to mark as confirmed:
const MarkAsPaidConfirmPage = lazy(() =>
  import("./components/secure-links/MarkAsPaidConfirmPage.jsx")
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

// Blog
const BlogIndex = lazy(() => import("./components/blog/BlogIndex.jsx"));

// Render static blog HTML within the SPA without reload loops
const BlogStatic = () => {
  const { slug } = useParams();
  const src = `/blog/${slug}/index.html`;
  const navigate = useNavigate();

  useEffect(() => {
    window.location.href = `/blog/${slug}/index.html`;
    // navigate('/blog/${slug}/index.html')
  }, []);

  return (
    <>
      {/* <GlobalNavbar
        options={{
          features: false,
          security: false,
          pricing: false,
          createFreeAccount: true,
          login: true,
          signup: true,
        }}
      /> */}
      <div></div>
      {/* <iframe title={`blog-${slug}`} src={src} style={{ width: "100%", minHeight: "100vh", border: 0 }} /> */}
      {/* <GlobalFooter /> */}
    </>
  );
};

// If you have protected route wrapper, keep it non-lazy if it's tiny.
const ProtectedRoute = lazy(() => import("./components/auth/ProtectedRoute"));

const App = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public routes */}
        {/* <Route path="/test" element={<Test />} /> */}

        <Route path="/" element={<LandingPageV3 />} />

        <Route path="/landing/*" element={<LandingPageV3 />}></Route>
        <Route path="/landing/2" element={<LandingPageV2 />} />
        <Route path="/landing/3" element={<LandingPageV1 />} />

        {/* Blog routes */}
        <Route path="/blog/:slug/*" element={<BlogStatic />} />
        <Route
          path="/blog"
          element={
            <>
              <GlobalNavbar
                options={{
                  features: false,
                  security: false,
                  pricing: false,
                  createFreeAccount: true,
                  signup: true,
                  login: true,
                }}
              />
              <BlogIndex />
              <GlobalFooter />
            </>
          }
        />
        <Route path="/login" element={<Loginv2 />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

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
        {/* protected */}
        <Route
          path="/markAsPaid/*"
          element={
            <AuthProvider>
              <ProtectedRoute>
                <DataProvider>
                  <Navbar />
                  <MarkAsPaidConfirmPage />
                  <GlobalFooter />
                </DataProvider>
              </ProtectedRoute>
            </AuthProvider>
          }
        />

        {/* Stripe pages (lazy chunk; won’t load on /landing) */}
        {/* <Route
          path="/payment"
          element={
            <>
              <GlobalNavbar />
              <PaymentPage />
            </>
          }
        /> */}
        <Route
          path="/PaymentPortal"
          element={
            <>
              <GlobalNavbar />
              <PaymentPortal />
              <GlobalFooter />
              {/* Spacer so content above isn't hidden behind fixed tray */}
              <div className="h-[96px]" />
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

        {/* admin */}
        <Route
          path="/admin"
          element={
            <AuthProvider>
              <DataProvider>
                <AdminProtectedRoute />
              </DataProvider>
            </AuthProvider>
          }
        >
          <Route path="tiktok" element={<TikTokUploader />} />
          <Route
            path="videopromptgenerator"
            element={<VideoPromptGenerator />}
          />

          <Route path="users" element={<AdminUsersOverview />} />
        </Route>

        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
};

export default App;
