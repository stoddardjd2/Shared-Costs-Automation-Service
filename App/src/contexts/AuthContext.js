import React, { useState, useEffect, createContext, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = window.tempUser;
    if (savedUser) {
      setUser(savedUser);
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    const mockUser = { id: 1, name: 'Current User', email };
    setUser(mockUser);
    window.tempUser = mockUser;
    return true;
  };

  const logout = () => {
    setUser(null);
    window.tempUser = null;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
