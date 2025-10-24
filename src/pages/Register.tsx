import { useState, useEffect } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    coachingName: "",
    seats: "",
    ownerName: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.post("/auth/register", {
        ...form,
        seats: Number(form.seats),
      });
      // alert("Registration successful!");
      navigate("/login", { replace: true });
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
    maxWidth: "450px",
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

  const linkStyle: React.CSSProperties = {
    textAlign: "center",
    color: "#666",
    fontSize: "16px",
  };

  const linkSpanStyle: React.CSSProperties = {
    cursor: "pointer",
    color: "#667eea",
    fontWeight: "600",
    textDecoration: "none",
    transition: "color 0.3s ease",
  };

  return (
    <div className="register-page-container" style={containerStyle}>
      <div className="form-container" style={formContainerStyle}>
        <h2 className="form-heading" style={headingStyle}>Create Account</h2>
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

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
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

          <input
            type="text"
            name="coachingName"
            placeholder="Coaching Institute Name"
            value={form.coachingName}
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

          <input
            type="number"
            name="seats"
            placeholder="Number of Seats"
            value={form.seats}
            onChange={handleChange}
            required
            min="1"
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

          <input
            type="text"
            name="ownerName"
            placeholder="Owner Name"
            value={form.ownerName}
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
            {isLoading ? "Creating Account..." : "Register"}
          </button>
        </form>

        <p className="form-link" style={linkStyle}>
          Already have an account?{" "}
          <span
            style={linkSpanStyle}
            onClick={() => navigate("/login")}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#5a67d8";
              e.currentTarget.style.textDecoration = "underline";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#667eea";
              e.currentTarget.style.textDecoration = "none";
            }}
          >
            Login Here
          </span>
        </p>
      </div>

      <style>{`
        /* Override global CSS for register page */
        .register-page-container {
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
          .register-page-container .form-container {
            max-width: 420px !important;
            padding: 35px !important;
          }
          
          .register-page-container .form-heading {
            font-size: 26px !important;
            margin-bottom: 28px !important;
          }
          
          .register-page-container .form-input {
            padding: 14px 18px !important;
            font-size: 15px !important;
            margin-bottom: 18px !important;
          }
          
          .register-page-container .form-button {
            padding: 14px !important;
            font-size: 17px !important;
          }
        }

        /* Mobile responsive design */
        @media (max-width: 768px) {
          .register-page-container {
            padding: 0 !important;
            margin: 0 !important;
          }
          
          .register-page-container .form-container {
            padding: 25px 20px !important;
            border-radius: 15px !important;
            margin: 15px !important;
            max-width: calc(100vw - 30px) !important;
          }
          
          .register-page-container .form-heading {
            font-size: 24px !important;
            margin-bottom: 25px !important;
          }
          
          .register-page-container .form-input {
            padding: 12px 15px !important;
            font-size: 16px !important;
            margin-bottom: 15px !important;
          }
          
          .register-page-container .form-button {
            padding: 12px !important;
            font-size: 16px !important;
          }
        }

        /* Small mobile responsive design */
        @media (max-width: 480px) {
          .register-page-container .form-container {
            margin: 10px !important;
            padding: 20px 15px !important;
            border-radius: 12px !important;
            max-width: calc(100vw - 20px) !important;
          }
          
          .register-page-container .form-heading {
            font-size: 22px !important;
            margin-bottom: 20px !important;
          }
          
          .register-page-container .form-input {
            padding: 12px 15px !important;
            font-size: 14px !important;
            margin-bottom: 12px !important;
          }
          
          .register-page-container .form-button {
            padding: 12px !important;
            font-size: 15px !important;
          }
          
          .register-page-container .form-link {
            font-size: 14px !important;
          }
        }

        /* Focus and hover effects */
        .register-input:focus {
          border-color: #667eea !important;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
        }

        .register-button:hover:not(:disabled) {
          transform: translateY(-2px) !important;
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3) !important;
        }

        .register-button:active:not(:disabled) {
          transform: translateY(0) !important;
        }

        /* Smooth animations */
        * {
          transition: all 0.3s ease !important;
        }

        /* Remove spinner arrows from number input */
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none !important;
          margin: 0 !important;
        }

        input[type="number"] {
          -moz-appearance: textfield !important;
        }
      `}</style>
    </div>
  );
}