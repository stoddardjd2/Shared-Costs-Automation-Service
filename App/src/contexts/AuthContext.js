import React, { useState, useEffect, createContext, useContext } from "react";
import { verifyToken } from "../queries/auth";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isValidToken, setIsValidToken] = useState(null);
  const [userData, setUserData] = useState(null);
  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem("token");
      console.log("CHECKING TOKEN");

      if (token && token !== "undefined") {
        try {
          const userData = await verifyToken(token);
          if (userData) {
            console.log("token verified!");
            setIsValidToken(true);

            function transformUser(user) {
              // Extract initials from name, fallback to "NN"
              const initials = user.name
                ? user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                : "NN";

              // Example plan - you might want to define logic to set plan dynamically
              const plan = "Free";

              // Example color - pick color based on role or other attribute
              const color =
                user.role === "admin"
                  ? "bg-gradient-to-br from-red-500 to-red-600"
                  : "bg-gradient-to-br from-blue-500 to-blue-600";

              return {
                name: user.name || "",
                email: user.email || "",
                plan,
                avatar: initials,
                color,
              };
            }
            const formattedUser = transformUser(userData);

            setUserData(formattedUser);
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
      value={{ isValidToken, loading, userData, setUserData }}
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
