// src/context/AuthContext.js
import React, { createContext, useContext, useState } from 'react';

// Create the context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Create the provider component
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState({ access: null, refresh: null });

  // Login function
  const login = (userData) => {
    const { access, refresh, role, unique_id, mobile_number } = userData;
    
    // Update state only (no localStorage)
    setTokens({ access, refresh });
    setUser({
      role,
      uniqueId: unique_id,
      mobileNumber: mobile_number
    });
    setIsAuthenticated(true);
  };

  // Logout function
  const logout = () => {
    // Reset state only (no localStorage)
    setTokens({ access: null, refresh: null });
    setUser(null);
    setIsAuthenticated(false);
  };

  // Value provided to context consumers
  const value = {
    isAuthenticated,
    user,
    tokens,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;