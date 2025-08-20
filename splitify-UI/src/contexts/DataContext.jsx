import React, { useState, createContext, useContext, useEffect } from "react";
import { plaidAPI } from "../services/plaidService";
import { getUserData } from "../queries/user";
// You'll need to import this function that was called but not imported
import { getRequests } from "../queries/requests"; // Add this import
import { useNavigate } from "react-router-dom";
const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

// Loading component - you can customize this
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-screen w-full">
    <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
  </div>
);

// Error component - you can customize this
const ErrorComponent = ({ error, onRetry }) => {
  const navigate = useNavigate();

  if (error == "Error: Not authorized, user not found") {
    navigate("/login");
  }
  console.log("error", error)
  if (error == "Error: Not authorized, user not found") {
    navigate("/login");
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
      <button
        onClick={onRetry}
        style={{ marginTop: "10px", padding: "10px 20px" }}
      >
        Try Again
      </button>
    </div>
  );
};

export const DataProvider = ({ children }) => {
  const [participants, setParticipants] = useState([]);
  const [costs, setCosts] = useState([]);
  const [userData, setUserData] = useState(null);

  const [bankTransactions, setBankTransactions] = useState([]);
  const [plaidAccessToken, setPlaidAccessToken] = useState(null);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);

  const [isContextLoaded, setIsContextLoaded] = useState(false);
  const [loadingError, setLoadingError] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState(null);

  const loadInitialData = async () => {
    try {
      setIsContextLoaded(false);
      setLoadingError(null);

      // Load both user data and requests in parallel
      const [userDataResult, userRequestsResult] = await Promise.all([
        getUserData(),
        getRequests(),
      ]);

      // Set all the data
      setUserData(userDataResult);
      setParticipants(userDataResult?.contacts || []);
      setCosts(userRequestsResult || []);
      setPaymentMethods(userDataResult?.paymentMethods || {});
      // Mark as loaded
      setIsContextLoaded(true);
    } catch (error) {
      console.error("Error loading initial data:", error);
      setLoadingError(error);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const removeParticipant = (id) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
    setCosts((prev) =>
      prev.map((cost) => ({
        ...cost,
        participants: cost.participants.filter((p) => p.userId !== id),
      }))
    );
  };

  const addCost = (newCost) => {
    setCosts((prev) => [...prev, newCost]);
  };

  const updateCost = (updatedCost) => {
    setCosts((prevCosts) =>
      prevCosts.map((cost) =>
        cost._id === updatedCost._id ? updatedCost : cost
      )
    );
  };

  // const connectPlaid = async () => {
  //   try {
  //     setIsLoadingTransactions(true);

  //     const publicToken = await plaidAPI.createPublicToken();
  //     const accessToken = await plaidAPI.exchangePublicToken(publicToken);
  //     setPlaidAccessToken(accessToken);

  //     await plaidAPI.refreshTransactions(accessToken);
  //     const transactions = await plaidAPI.getTransactions(accessToken);

  //     const formattedTransactions = transactions.map((transaction) => ({
  //       id: transaction.transaction_id,
  //       description: transaction.name,
  //       amount: transaction.amount,
  //       date: transaction.date,
  //       matched: !transaction.pending,
  //       category: transaction.personal_finance_category?.primary || "Other",
  //     }));

  //     setBankTransactions(formattedTransactions);
  //   } catch (error) {
  //     console.error("Error connecting to Plaid:", error);
  //     alert("Error connecting to bank. Using demo data instead.");
  //     setBankTransactions([]);
  //   } finally {
  //     setIsLoadingTransactions(false);
  //   }
  // };

  const value = {
    participants,
    costs,
    bankTransactions,
    plaidAccessToken,
    isLoadingTransactions,
    removeParticipant,
    setCosts,
    updateCost,
    // connectPlaid,
    setParticipants,
    userData,
    setUserData,
    addCost,
    setPaymentMethods,
    paymentMethods,
  };

  // Show loading spinner while data is loading
  if (!isContextLoaded && !loadingError) {
    return <LoadingSpinner />;
  }

  // Show error component if there was an error loading
  if (loadingError) {
    return <ErrorComponent error={loadingError} onRetry={loadInitialData} />;
  }

  // Only render children when data is fully loaded
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
