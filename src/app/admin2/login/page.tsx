

'use client'; // Make it a client component for useState and useRouter

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import { useAuth } from "@/context/AuthContext";
import '@/styles/admin-login.css';

const SignIn: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState(''); // Use email state for email input
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isAuthenticated, loadingAuthCheck } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (!loadingAuthCheck && isAuthenticated) {
      router.push('/admin/dashboard');
    }
  }, [isAuthenticated, loadingAuthCheck, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    try {
      await login(email, password);
  } catch (err: unknown) {
      console.error('Login error:', err);
      if (isAxiosError(err)) {
        // You can access more specific error information from AxiosError
        console.error('Axios error details:', err.response?.data || err.message);
        setError(err.response?.data?.message || 'Login failed. Please check your credentials.'); // Display server error message if available
      } else {
        setError('An error occurred during login.');
      }
    }
  };

  // Show loading spinner while checking authentication
  if (loadingAuthCheck) {
    return (
      <div className="admin-login-container">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Don't render login form if already authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        {/* Left panel with illustration */}
        <div className="admin-login-illustration">
          <div className="content-wrapper">
            <Link className="admin-login-logo" href="/admin/login">
              <Image
                src={"/images/logo.png"}
                alt="Logo"
                width={220}
                height={60}
                style={{ objectFit: 'contain' }}
              />
            </Link>

            <p className="admin-login-welcome-text">
              Welcome to the Admin Panel. Please sign in to continue.
            </p>

            <div className="admin-login-svg">
              {/* SVG Image - Keep as is */}
              <svg
                width="350"
                height="350"
                viewBox="0 0 350 350"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M33.5825 294.844L30.5069 282.723C25.0538 280.414 19.4747 278.414 13.7961 276.732L13.4079 282.365L11.8335 276.159C4.79107 274.148 0 273.263 0 273.263C0 273.263 6.46998 297.853 20.0448 316.653L35.8606 319.429L23.5737 321.2C25.2813 323.253 27.1164 325.196 29.0681 327.019C48.8132 345.333 70.8061 353.736 78.1898 345.787C85.5736 337.838 75.5526 316.547 55.8074 298.235C49.6862 292.557 41.9968 288.001 34.2994 284.415L33.5825 294.844Z"
                  fill="#F2F2F2" />
                {/* Rest of your SVG paths... */}
              </svg>
            </div>
          </div>
        </div>

        {/* Right panel with form */}
        <div className="admin-login-form-panel">
          <div className="admin-login-header">
            <span className="admin-login-badge">Admin Access</span>
            <h2 className="admin-login-title">
              Sign in to Admin Panel
            </h2>
          </div>

          {error && <div className="admin-login-error">{error}</div>}

          <form onSubmit={handleSubmit} className="admin-login-form"> {/* Form with onSubmit handler */}
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="email">
                Email
              </label>
              <div className="admin-input-wrapper">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="admin-form-input"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)} // Updated to setEmail and email state
                  required />
                <span className="admin-input-icon">
                  <svg
                    className="fill-current"
                    width="22"
                    height="22"
                    viewBox="0 0 22 22"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g opacity="0.5">
                      <path
                        d="M19.2516 3.30005H2.75156C1.58281 3.30005 0.585938 4.26255 0.585938 5.46567V16.6032C0.585938 17.7719 1.54844 18.7688 2.75156 18.7688H19.2516C20.4203 18.7688 21.4172 17.8063 21.4172 16.6032V5.4313C21.4172 4.26255 20.4203 3.30005 19.2516 3.30005ZM19.2516 4.84692C19.2859 4.84692 19.3203 4.84692 19.3547 4.84692L11.0016 10.2094L2.64844 4.84692C2.68281 4.84692 2.71719 4.84692 2.75156 4.84692H19.2516ZM19.2516 17.1532H2.75156C2.40781 17.1532 2.13281 16.8782 2.13281 16.5344V6.35942L10.1766 11.5157C10.4172 11.6875 10.6922 11.7563 10.9672 11.7563C11.2422 11.7563 11.5172 11.6875 11.7578 11.5157L19.8016 6.35942V16.5688C19.8703 16.9125 19.5953 17.1532 19.2516 17.1532Z"
                        fill="" />
                    </g>
                  </svg>
                </span>
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="password">
                Password
              </label>
              <div className="admin-input-wrapper">
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="admin-form-input"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required />
                <span className="admin-input-icon">
                  <svg
                    className="fill-current"
                    width="22"
                    height="22"
                    viewBox="0 0 22 22"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g opacity="0.5">
                      <path
                        d="M16.1547 6.80626V5.91251C16.1547 3.16251 14.0922 0.825009 11.4797 0.618759C10.0359 0.481259 8.59219 0.996884 7.52656 1.95938C6.46094 2.92188 5.84219 4.29688 5.84219 5.70626V6.80626C3.84844 7.18438 2.33594 8.93751 2.33594 11.0688V17.2906C2.33594 19.5594 4.19219 21.3813 6.42656 21.3813H15.5016C17.7703 21.3813 19.6266 19.525 19.6266 17.2563V11C19.6609 8.93751 18.1484 7.21876 16.1547 6.80626ZM8.55781 3.09376C9.31406 2.40626 10.3109 2.06251 11.3422 2.16563C13.1641 2.33751 14.6078 3.98751 14.6078 5.91251V6.70313H7.38906V5.67188C7.38906 4.70938 7.80156 3.78126 8.55781 3.09376ZM18.1141 17.2906C18.1141 18.7 16.9453 19.8688 15.5359 19.8688H6.46094C5.05156 19.8688 3.91719 18.7344 3.91719 17.325V11.0688C3.91719 9.52189 5.15469 8.28438 6.70156 8.28438H15.2953C16.8422 8.28438 18.1141 9.52188 18.1141 11V17.2906Z"
                        fill="" />
                      <path
                        d="M10.9977 11.8594C10.5852 11.8594 10.207 12.2031 10.207 12.65V16.2594C10.207 16.6719 10.5508 17.05 10.9977 17.05C11.4102 17.05 11.7883 16.7063 11.7883 16.2594V12.6156C11.7883 12.2031 11.4102 11.8594 10.9977 11.8594Z"
                        fill="" />
                    </g>
                  </svg>
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="admin-submit-btn"
            >
              Sign In
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default SignIn;