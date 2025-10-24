
import { useState } from "react";
import axios from "../api/axios";

export default function Settings() {
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords({ ...showPasswords, [field]: !showPasswords[field] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (form.newPassword !== form.confirmPassword) {
      // alert("New password and confirm password do not match!");
      return;
    }

    if (form.newPassword.length < 6) {
      // alert("New password must be at least 6 characters long!");
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put("/auth/password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // alert("Password updated successfully!");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update password");
    } finally {
      setIsLoading(false);
    }
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "20px",
  };

  const cardStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
    borderRadius: "16px",
    padding: "30px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
    border: "1px solid #e2e8f0",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 50px 12px 16px",
    marginBottom: "20px",
    border: "2px solid #e2e8f0",
    borderRadius: "12px",
    fontSize: "16px",
    transition: "all 0.3s ease",
    outline: "none",
    boxSizing: "border-box",
  };

  const buttonStyle: React.CSSProperties = {
    padding: "12px 24px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    border: "none",
    borderRadius: "12px",
    color: "white",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    width: "100%",
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
    color: "#666",
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={{ 
          margin: "0 0 30px 0", 
          color: "#1e293b",
          fontSize: "24px",
          fontWeight: "700"
        }}>
          ⚙️ Update Password
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ position: "relative" }}>
            <label style={{ 
              display: "block", 
              marginBottom: "8px", 
              fontWeight: "600", 
              color: "#374151" 
            }}>
              Current Password
            </label>
            <input
              type={showPasswords.current ? "text" : "password"}
              name="currentPassword"
              value={form.currentPassword}
              onChange={handleChange}
              required
              style={inputStyle}
              placeholder="Enter your current password"
            />
            <button
              type="button"
              style={toggleButtonStyle}
              onClick={() => togglePasswordVisibility("current")}
            >
              {showPasswords.current ? "🙈" : "👁️"}
            </button>
          </div>

          <div style={{ position: "relative" }}>
            <label style={{ 
              display: "block", 
              marginBottom: "8px", 
              fontWeight: "600", 
              color: "#374151" 
            }}>
              New Password
            </label>
            <input
              type={showPasswords.new ? "text" : "password"}
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              required
              style={inputStyle}
              placeholder="Enter your new password"
            />
            <button
              type="button"
              style={toggleButtonStyle}
              onClick={() => togglePasswordVisibility("new")}
            >
              {showPasswords.new ? "🙈" : "👁️"}
            </button>
          </div>

          <div style={{ position: "relative" }}>
            <label style={{ 
              display: "block", 
              marginBottom: "8px", 
              fontWeight: "600", 
              color: "#374151" 
            }}>
              Confirm New Password
            </label>
            <input
              type={showPasswords.confirm ? "text" : "password"}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              style={inputStyle}
              placeholder="Confirm your new password"
            />
            <button
              type="button"
              style={toggleButtonStyle}
              onClick={() => togglePasswordVisibility("confirm")}
            >
              {showPasswords.confirm ? "🙈" : "👁️"}
            </button>
          </div>

          <button
            type="submit"
            style={buttonStyle}
            disabled={isLoading}
          >
            {isLoading ? "Updating Password..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
