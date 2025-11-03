import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Plus } from "lucide-react";
import RecurringCostsSection from "./RecurringCostsSection";
import OverdueAlerts from "./OverDueAlerts";
import LoadingWrapper from "../../utils/LoadingWrapper";
import Navbar from "./Navbar";
import { getUserData } from "../../queries/user";
import { getRequests } from "../../queries/requests";
import { useData } from "../../contexts/DataContext";
import AddCost from "../costs/AddCost";
import ManageRecurringCostModal from "./ManageRecurringCostModal";
import PaymentMethodPrompt from "./PaymentMethodPrompt";
import {
  pageview,
  setUserId,
} from "../../googleAnalytics/googleAnalyticsHelpers";
import WelcomeScreen from "./WelcomeScreen";
import InstallPWAButton from "../PWA/InstallPWAButton";
const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation(); // 👈 read current URL
  const {
    participants,
    costs,
    bankTransactions,
    plaidAccessToken,
    isLoadingTransactions,
    connectPlaid,
    setCosts,
    userData,
    paymentMethods,
  } = useData();

  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  const [view, setView] = useState("dashboard"); // kept to minimize changes (not used for routing now)
  const [selectedCost, setSelectedCost] = useState(null);
  const [showFirstTimePrompt, setShowFirstTimePrompt] = useState(false);
  // Google analytics:
  useEffect(() => {
    if (userData) {
      pageview(null, "Landing_Page");
      setUserId(userData._id);
    }
  });

  useEffect(() => {
    console.log("dashboard loiaded");

    // if user selected plan from landing page, popup to continue that process
    const params = new URLSearchParams(location.search);

    if (params?.get("plan")) {
      console.log("location.search", location.search);
      navigate(`/dashboard/premium${location.search}`);

      // show first time welcome screen and navigate user to make first request
    } else if (!costs || costs.length == 0) {
      navigate("/dashboard/welcome");
      setShowFirstTimePrompt(true);
    }
  }, []);

  const handleCloseModal = () => {
    setView("dashboard");
    setSelectedCost(null);
    navigate("/dashboard"); // 👈 go back to dashboard path
  };

  useEffect(() => {
    const t = setTimeout(() => {
      setIsLoadingDashboard(false);
    }, 200);
    return () => clearTimeout(t);
  }, []);

  if (!costs || (costs.length == 0 && showFirstTimePrompt)) {
    // setShowFirstTimePrompt(true);
    return <WelcomeScreen setShowFirstTimePrompt={setShowFirstTimePrompt} />;
  }

  // 👇 Now controlled by the URL path
  function getView() {
    const path = location.pathname;
    switch (true) {
      // case /^\/dashboard\/welcome(\/.*)?$/.test(path):
      //   return (
      //     <div className="mt-6 ">
      //       <WelcomeScreen />
      //     </div>
      //   );

      case /^\/dashboard\/add(\/.*)?$/.test(path):
        return (
          <div className="mt-6 ">
            <AddCost setView={setView} />
          </div>
        );
      case /^\/dashboard\/request\/details$/.test(path):
        return (
          <ManageRecurringCostModal
            cost={selectedCost}
            setSelectedCost={setSelectedCost}
            onClose={handleCloseModal}
          />
        );

      case /^\/dashboard$/.test(path):
      default:
        return (
          <div className="mx-auto px-4 sm:px-6 py-0 pb-24">
            <InstallPWAButton />
            {/* Header */}
            <div className="flex items-center justify-between gap-4 mb-6 mt-8">
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">Manage your requests</p>
              </div>
              <button
                onClick={() => {
                  const root = document.getElementById("root");
                  if (root) {
                    root.scrollTo({ top: 0, left: 0, behavior: "instant" });
                  }
                  navigate("/dashboard/add"); // 👈 route controls view
                  setView("addRequest"); // keep local state update (minimal change)
                }}
                className="hidden sm:flex bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors items-center gap-2 flex-shrink-0"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">New Request</span>
                <span className="sm:hidden">New</span>
              </button>
            </div>

            {/* Main Dashboard Sections */}
            <div className="space-y-6">
              {/* {paymentMethods?.cashapp && paymentMethods?.venmo ? (
                ""
              ) : (
                <PaymentMethodPrompt />
              )} */}

              {costs.length !== 0 && <OverdueAlerts />}
              <RecurringCostsSection
                setView={(v) => {
                  setView(v);
                  if (v === "requestDetails")
                    navigate("/dashboard/request/details"); // 👈 open details
                }}
                setSelectedCost={setSelectedCost}
              />
            </div>

            {/* New request (mobile) */}
            <button
              onClick={() => {
                const root = document.getElementById("root");
                if (root) {
                  root.scrollTo({ top: 0, left: 0, behavior: "instant" });
                }
                setView("addRequest"); // minimal change
                navigate("/dashboard/add"); // 👈
              }}
              className="fixed flex bottom-5 right-5 sm:hidden shadow-xl bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors items-center gap-2 flex-shrink-0"
            >
              <Plus className="w-5 h-5" />
              <span className="sm:hidden">New Request</span>
            </button>
          </div>
        );
    }
  }

  return (
    <LoadingWrapper loading={isLoadingDashboard}>
      <div className="relative ">{getView()}</div>
    </LoadingWrapper>
  );
};

export default Dashboard;
