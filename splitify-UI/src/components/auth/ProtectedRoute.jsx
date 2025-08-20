import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isValidToken, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading && !isValidToken) {
      navigate('/login');
    }
  }, [isValidToken, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return isValidToken ? children : null;
};

export default ProtectedRoute;
