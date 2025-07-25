import React, { useState, useEffect, createContext, useContext } from "react";
import { verifyToken } from "../queries/auth";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isValidToken, setIsValidToken] = useState(null);
  // const [userData, setUserData] = useState(null);
  // const [requests, setRequests] = useState(null);

  useEffect(() => {
    // check token and get user data and requests for user
    const checkToken = async () => {
      const token = localStorage.getItem("token");

      if (token && token !== "undefined") {
        try {
          const userData = await verifyToken(token);
          if (userData) {
            setIsValidToken(true);
            // setUserData(userData);
          } else {
            console.log("token expired!");
            setIsValidToken(false);
          }
        } catch (err) {
          console.error("Error verifying token:", err);
          setIsValidToken(false);
        }
      } else {
        setIsValidToken(false);
      }

      setLoading(false);
    };

    checkToken();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isValidToken,
        loading,
        // , userData, setUserData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
