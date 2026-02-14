// src/componets/pages/Login.js
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { Container } from 'react-bootstrap';
import "../../assets/css/login.css";

const Login = () => {
  const [role, setRole] = useState('user'); // Default role is 'user'
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [adminId, setAdminId] = useState('');
  const [superAdminId, setSuperAdminId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // --- NEW: State for password visibility ---
  const [showPassword, setShowPassword] = useState(false);

  // Get the login function from AuthContext
//   const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // --- NEW: Function to toggle password visibility ---
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(''); // Clear previous errors
    setIsLoading(true);

    try {
      let requestBody = {};
      let endpoint = "https://mahadevaaya.com/ngoproject/ngoproject_backend/api/login/";

      // Prepare request body based on role
      if (role === 'user') {
        requestBody = {
          email_or_phone: emailOrPhone,
          password: password,
        };
      } else if (role === 'staff-admin') {
        requestBody = {
          email_or_phone: adminId,
          password: password,
        };
      } else if (role === 'super-admin') {
        requestBody = {
          email_or_phone: superAdminId,
          password: password,
        };
      } else if (role === 'vendor') {
        requestBody = {
          email_or_phone: email,
          password: password,
        };
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        // --- ROLE VALIDATION: Check if selected role matches credential role ---
        // For user role, the API returns "user"
        const isRoleMatch = data.role === role || 
                           (role === 'staff-admin' && data.role === 'admin') ||
                           (role === 'super-admin' && data.role === 'super_admin') ||
                           (role === 'vendor' && data.role === 'vendor');

        if (!isRoleMatch) {
          throw new Error( 
            `Invalid UserName or Password for the selected role: ${role}. Please check your credentials and try again.`
          );
        }

        // --- ROLE-BASED REDIRECTION LOGIC ---
        let redirectTo;
        if (data.role === 'admin' || role === 'staff-admin') {
          redirectTo = "/DashBoard"; // Admin dashboard
        } else if (data.role === 'super_admin' || role === 'super-admin') {
          redirectTo = "/SuperAdminDashboard"; // Super Admin dashboard
        } else if (data.role === 'vendor') {
          redirectTo = "/VendorDashboard"; // Vendor dashboard
        } else if (data.role === 'user') {
          // For user role
          redirectTo = "/UserProfile";
        } else {
          // Default to user dashboard
          redirectTo = "/UserDashBoard";
        }

        // Redirect the user to their role-specific dashboard
        navigate(redirectTo, { replace: true });
      } else {
        // If the server returns an error, display the error message
        throw new Error(data.message || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to get the appropriate title based on selected role
  const getLoginTitle = () => {
    switch(role) {
      case 'staff-admin':
        return 'Staff Admin Login';
      case 'super-admin':
        return 'Super Admin Login';
      case 'vendor':
        return 'Vendor Login';
      case 'user':
        return 'User Login';
      default:
        return 'User Login';
    }
  };

  return (
    <Container className='login-box-two'>
    <Container className='login-con'>
    <div className="login-container">
      <div className="login-background"></div>
      <div className="login-box">
        <div className="login-header">
          <h1>{getLoginTitle()}</h1>
        </div>
        
        {/* Display error message if it exists */}
        {error && <div className="error-message">{error}</div>}
        
        {/* Role Selection Tabs */}
        <div className="role-tabs">
          <button 
            className={`role-tab ${role === 'user' ? 'active' : ''}`}
            onClick={() => setRole('user')}
          >
            <i className="fas fa-user"></i>
            <span>LOGIN AS A USER</span>
          </button>
          <button 
            className={`role-tab ${role === 'vendor' ? 'active' : ''}`}
            onClick={() => setRole('vendor')}
          >
            <i className="fas fa-store"></i>
            <span>LOGIN AS A VENDOR</span>
          </button>
          <button 
            className={`role-tab ${role === 'staff-admin' ? 'active' : ''}`}
            onClick={() => setRole('staff-admin')}
          >
            <i className="fas fa-user-shield"></i>
            <span>Staff Admin</span>
          </button>
          <button 
            className={`role-tab ${role === 'super-admin' ? 'active' : ''}`}
            onClick={() => setRole('super-admin')}
          >
            <i className="fas fa-user-cog"></i>
            <span>Super Admin</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          {/* User Login Fields */}
          {role === 'user' && (
            <>
              <div className="form-group">
                <label htmlFor="emailOrPhone">Email or Phone</label>
                <input
                  type="text"
                  id="emailOrPhone"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                {/* --- MODIFIED: Password input with toggle --- */}
                <div className="password-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={togglePasswordVisibility}
                    disabled={isLoading}
                  >
                    <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                  </button>
                </div>
              </div>
            </>
          )}
          
          {/* Staff Admin Login Fields */}
          {role === 'staff-admin' && (
            <>
              <div className="form-group">
                <label htmlFor="adminId">Admin ID</label>
                <input
                  type="text"
                  id="adminId"
                  value={adminId} 
                  onChange={(e) => setAdminId(e.target.value)}
                  required placeholder='admin@gmail.com' 
                  disabled={isLoading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                {/* --- MODIFIED: Password input with toggle --- */}
                <div className="password-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={togglePasswordVisibility}
                    disabled={isLoading}
                  >
                    <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Super Admin Login Fields */}
          {role === 'super-admin' && (
            <>
              <div className="form-group">
                <label htmlFor="superAdminId">Super Admin ID</label>
                <input
                  type="text"
                  id="superAdminId"
                  value={superAdminId} 
                  onChange={(e) => setSuperAdminId(e.target.value)}
                  required placeholder='superadmin@gmail.com' 
                  disabled={isLoading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                {/* --- MODIFIED: Password input with toggle --- */}
                <div className="password-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={togglePasswordVisibility}
                    disabled={isLoading}
                  >
                    <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                  </button>
                </div>
              </div>
            </>
          )}
          
          {/* Vendor Login Fields */}
          {role === 'vendor' && (
            <>
              <div className="form-group">
                <label htmlFor="email">Email ID</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                {/* --- MODIFIED: Password input with toggle --- */}
                <div className="password-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={togglePasswordVisibility}
                    disabled={isLoading}
                  >
                    <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                  </button>
                </div>
              </div>
            </>
          )}
          
          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <span>Logging in...</span>
              </div>
            ) : (
              'Log In'
            )}
          </button>
        </form>
      </div>
    </div>
  </Container>
  </Container>
  );
};

export default Login;