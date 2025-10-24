import { useState, useEffect } from "react";
import axios from "../api/axios";
import { useNavigate, useLocation } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Get the intended destination from location state, default to dashboard
  const from = location.state?.from?.pathname || "/dashboard";

  // Redirect if already authenticated
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate(from, { replace: true });
    }
  }, [navigate, from]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      // Store user data for quick access
      localStorage.setItem("userData", JSON.stringify(res.data.user));
      // alert("Login successful!");
      // Navigate to intended destination or dashboard, using replace to prevent back navigation
      navigate(from, { replace: true });
    } catch (err: any) {
      alert(err.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const containerStyle: React.CSSProperties = {
    minHeight: "100vh",
    height: "100vh",
    width: "100vw",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: 0,
    margin: 0,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    boxSizing: "border-box",
    overflow: "auto",
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  };

  const formContainerStyle: React.CSSProperties = {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    padding: "40px",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
    width: "100%",
    maxWidth: "400px",
    margin: "0 auto",
  };

  const headingStyle: React.CSSProperties = {
    textAlign: "center",
    marginBottom: "30px",
    color: "#333",
    fontSize: "28px",
    fontWeight: "700",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "15px 20px",
    marginBottom: "20px",
    border: "2px solid #e0e0e0",
    borderRadius: "12px",
    fontSize: "16px",
    transition: "all 0.3s ease",
    outline: "none",
    boxSizing: "border-box",
  };

  const passwordContainerStyle: React.CSSProperties = {
    position: "relative",
    width: "100%",
    marginBottom: "20px",
  };

  const passwordInputStyle: React.CSSProperties = {
    width: "100%",
    padding: "15px 50px 15px 20px",
    border: "2px solid #e0e0e0",
    borderRadius: "12px",
    fontSize: "16px",
    transition: "all 0.3s ease",
    outline: "none",
    boxSizing: "border-box",
  };

  const toggleButtonStyle: React.CSSProperties = {
    position: "absolute",
    right: "15px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "5px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#666",
    transition: "color 0.3s ease",
  };

  const inputFocusStyle: React.CSSProperties = {
    borderColor: "#667eea",
    boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.1)",
  };

  const buttonStyle: React.CSSProperties = {
    width: "100%",
    padding: "15px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    border: "none",
    borderRadius: "12px",
    color: "white",
    fontSize: "18px",
    fontWeight: "600",
    cursor: isLoading ? "not-allowed" : "pointer",
    transition: "all 0.3s ease",
    opacity: isLoading ? 0.7 : 1,
    marginBottom: "20px",
  };



  return (
    <div className="login-page-container" style={containerStyle}>
      <div className="form-container" style={formContainerStyle}>
        <h2 className="form-heading" style={headingStyle}>Welcome Back</h2>
      <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            required
            className="form-input"
            style={inputStyle}
            onFocus={(e) => {
              Object.assign(e.target.style, inputFocusStyle);
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e0e0e0";
              e.target.style.boxShadow = "none";
            }}
          />

          <div className="password-container" style={passwordContainerStyle}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className="form-input password-input"
              style={passwordInputStyle}
              onFocus={(e) => {
                Object.assign(e.target.style, inputFocusStyle);
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e0e0e0";
                e.target.style.boxShadow = "none";
              }}
            />
            <button
              type="button"
              style={toggleButtonStyle}
              onClick={() => setShowPassword(!showPassword)}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#667eea";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#666";
              }}
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>

          <button
            type="submit"
            className="form-button"
            style={buttonStyle}
            disabled={isLoading}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 10px 25px rgba(102, 126, 234, 0.3)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }
            }}
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
      </form>

        {/* <p className="form-link" style={linkStyle}>
          Don't have an account?{" "}
          <span
            style={linkSpanStyle}
            onClick={() => navigate("/register")}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#5a67d8";
              e.currentTarget.style.textDecoration = "underline";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#667eea";
              e.currentTarget.style.textDecoration = "none";
            }}
          >
            Create Account
          </span>
        </p> */}
      </div>

      <style>{`
        /* Override global CSS for login page */
        .login-page-container {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: auto !important;
          z-index: 1000 !important;
        }

        /* Tablet responsive design */
        @media (max-width: 1024px) and (min-width: 769px) {
          .login-page-container .form-container {
            max-width: 380px !important;
            padding: 35px !important;
          }
          
          .login-page-container .form-heading {
            font-size: 26px !important;
            margin-bottom: 28px !important;
          }
          
          .login-page-container .form-input {
            padding: 14px 18px !important;
            font-size: 15px !important;
            margin-bottom: 18px !important;
          }
          
          .login-page-container .password-container {
            margin-bottom: 18px !important;
          }
          
          .login-page-container .password-input {
            padding: 14px 45px 14px 18px !important;
          }
          
          .login-page-container .form-button {
            padding: 14px !important;
            font-size: 17px !important;
          }
        }

        /* Mobile responsive design */
        @media (max-width: 768px) {
          .login-page-container {
            padding: 0 !important;
            margin: 0 !important;
          }
          
          .login-page-container .form-container {
            padding: 25px 20px !important;
            border-radius: 15px !important;
            margin: 15px !important;
            max-width: calc(100vw - 30px) !important;
          }
          
          .login-page-container .form-heading {
            font-size: 24px !important;
            margin-bottom: 25px !important;
          }
          
          .login-page-container .form-input {
            padding: 12px 15px !important;
            font-size: 16px !important;
            margin-bottom: 15px !important;
          }
          
          .login-page-container .password-container {
            margin-bottom: 15px !important;
          }
          
          .login-page-container .password-input {
            padding: 12px 40px 12px 15px !important;
          }
          
          .login-page-container .form-button {
            padding: 12px !important;
            font-size: 16px !important;
          }
        }

        @media (max-width: 480px) {
          .login-page-container .form-container {
            margin: 10px !important;
            padding: 20px 15px !important;
            border-radius: 12px !important;
            max-width: calc(100vw - 20px) !important;
          }
          
          .login-page-container .form-heading {
            font-size: 22px !important;
            margin-bottom: 20px !important;
          }
          
          .login-page-container .form-input {
            padding: 12px 15px !important;
            font-size: 14px !important;
            margin-bottom: 12px !important;
          }
          
          .login-page-container .password-container {
            margin-bottom: 12px !important;
          }
          
          .login-page-container .password-input {
            padding: 12px 40px 12px 15px !important;
          }
          
          .login-page-container .form-button {
            padding: 12px !important;
            font-size: 15px !important;
          }
          
          .login-page-container .form-link {
            font-size: 14px !important;
          }
        }

        /* Focus and hover effects */
        .login-page-container .form-input:focus {
          border-color: #667eea !important;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
        }

        .login-page-container .form-button:hover:not(:disabled) {
          transform: translateY(-2px) !important;
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3) !important;
        }

        .login-page-container .form-button:active:not(:disabled) {
          transform: translateY(0) !important;
        }

        /* Smooth animations */
        .login-page-container * {
          transition: all 0.3s ease !important;
        }
      `}</style>
    </div>
  );
}
