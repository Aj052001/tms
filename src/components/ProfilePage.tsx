import { useState, useEffect } from "react";
import axios from "../api/axios";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    coachingName: "",
    ownerName: "",
    seats: 0,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForm(res.data.user);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put("/auth/profile", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // alert("Profile updated successfully!");
      setIsEditing(false);
      // Update localStorage
      localStorage.setItem("userData", JSON.stringify(form));
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update profile");
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
    padding: "12px 16px",
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
    marginRight: "10px",
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          marginBottom: "30px" 
        }}>
          <h2 style={{ 
            margin: 0, 
            color: "#1e293b",
            fontSize: "24px",
            fontWeight: "700"
          }}>
            👤 Owner Profile
          </h2>
          <button
            style={{
              ...buttonStyle,
              background: isEditing 
                ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" 
                : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            }}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <div>
              <label style={{ 
                display: "block", 
                marginBottom: "8px", 
                fontWeight: "600", 
                color: "#374151" 
              }}>
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                style={inputStyle}
                disabled
              />
            </div>

            <div>
              <label style={{ 
                display: "block", 
                marginBottom: "8px", 
                fontWeight: "600", 
                color: "#374151" 
              }}>
                Coaching Institute Name
              </label>
              <input
                type="text"
                name="coachingName"
                value={form.coachingName}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ 
                display: "block", 
                marginBottom: "8px", 
                fontWeight: "600", 
                color: "#374151" 
              }}>
                Owner Name
              </label>
              <input
                type="text"
                name="ownerName"
                value={form.ownerName}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ 
                display: "block", 
                marginBottom: "8px", 
                fontWeight: "600", 
                color: "#374151" 
              }}>
                Total Seats
              </label>
              <input
                type="number"
                name="seats"
                value={form.seats}
                onChange={handleChange}
                required
                min="1"
                style={inputStyle}
              />
            </div>

            <button
              type="submit"
              style={buttonStyle}
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Update Profile"}
            </button>
          </form>
        ) : (
          <div>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ 
                display: "block", 
                marginBottom: "8px", 
                fontWeight: "600", 
                color: "#6b7280" 
              }}>
                Email Address
              </label>
              <div style={{
                padding: "12px 16px",
                background: "#f9fafb",
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
                color: "#374151",
              }}>
                {form.email}
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ 
                display: "block", 
                marginBottom: "8px", 
                fontWeight: "600", 
                color: "#6b7280" 
              }}>
                Coaching Institute Name
              </label>
              <div style={{
                padding: "12px 16px",
                background: "#f9fafb",
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
                color: "#374151",
              }}>
                {form.coachingName}
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ 
                display: "block", 
                marginBottom: "8px", 
                fontWeight: "600", 
                color: "#6b7280" 
              }}>
                Owner Name
              </label>
              <div style={{
                padding: "12px 16px",
                background: "#f9fafb",
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
                color: "#374151",
              }}>
                {form.ownerName}
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ 
                display: "block", 
                marginBottom: "8px", 
                fontWeight: "600", 
                color: "#6b7280" 
              }}>
                Total Seats
              </label>
              <div style={{
                padding: "12px 16px",
                background: "#f9fafb",
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
                color: "#374151",
              }}>
                {form.seats}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}