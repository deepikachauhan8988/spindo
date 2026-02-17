// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

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

// Refresh token API endpoint
const REFRESH_TOKEN_URL = 'https://mahadevaaya.com/spindo/spindobackend/api/token/refresh/';

// Create the provider component
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState({ access: null, refresh: null });
  const [isLoading, setIsLoading] = useState(true);

  // Function to refresh access token
  const refreshAccessToken = async () => {
    if (!tokens.refresh) {
      console.error('No refresh token available.');
      logout();
      return null;
    }

    try {
      const response = await axios.post(REFRESH_TOKEN_URL, {
        refresh: tokens.refresh
      });

      if (response.data.access) {
        const newTokens = {
          ...tokens,
          access: response.data.access
        };
        setTokens(newTokens);
        // Save the new token to localStorage
        localStorage.setItem('tokens', JSON.stringify(newTokens));
        return newTokens.access;
      }
    } catch (error) {
      console.error('Failed to refresh token:', error);
      logout();
      return null;
    }
  };

  // IMPORTANT: This effect runs on app start to check if user was logged in
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const savedTokens = localStorage.getItem('tokens');
        const savedUser = localStorage.getItem('user');

        if (savedTokens && savedUser) {
          const parsedTokens = JSON.parse(savedTokens);
          const parsedUser = JSON.parse(savedUser);

          if (parsedTokens.refresh) {
            // If tokens exist, restore the auth state
            setTokens(parsedTokens);
            setUser(parsedUser);
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error("Failed to load auth state:", error);
        // If data is bad, clear it
        localStorage.removeItem('tokens');
        localStorage.removeItem('user');
      } finally {
        // App is ready to render
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function - saves state AND localStorage
  const login = (userData) => {
    const { access, refresh, role, unique_id, mobile_number } = userData;
    
    const userInfo = {
      role,
      uniqueId: unique_id,
      mobileNumber: mobile_number
    };
    
    const newTokens = { access, refresh };

    // Update React state
    setTokens(newTokens);
    setUser(userInfo);
    setIsAuthenticated(true);
    
    // IMPORTANT: Save to localStorage so user stays logged in after refresh
    localStorage.setItem('tokens', JSON.stringify(newTokens));
    localStorage.setItem('user', JSON.stringify(userInfo));
  };

  // Logout function - clears state AND localStorage
  const logout = () => {
    // Reset React state
    setTokens({ access: null, refresh: null });
    setUser(null);
    setIsAuthenticated(false);
    
    // IMPORTANT: Clear localStorage so user is fully logged out
    localStorage.removeItem('tokens');
    localStorage.removeItem('user');
  };

  const value = {
    isAuthenticated,
    user,
    tokens,
    isLoading,
    login,
    logout,
    refreshAccessToken
  };

  // Prevent rendering children until auth state is checked
  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;