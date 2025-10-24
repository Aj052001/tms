import { useState, useEffect } from "react";
import axios from "../api/axios";

interface AddStudentFormProps {
  selectedSeatNumber?: number;
  availableSeats?: number[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function AddStudentForm({ selectedSeatNumber, availableSeats: propAvailableSeats, onSuccess, onCancel }: AddStudentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [availableSeats, setAvailableSeats] = useState<number[]>([]);
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    address: "",
    courseName: "",
    joinDate: new Date().toISOString().split('T')[0], // Today's date
    seatNumber: selectedSeatNumber || 1,
    totalFees: "",
    image: null as File | null,
  });
  
  const [mobileError, setMobileError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (propAvailableSeats && propAvailableSeats.length > 0) {
      setAvailableSeats(propAvailableSeats);
    } else {
      fetchAvailableSeats();
    }
    if (selectedSeatNumber) {
      setForm(prev => ({ ...prev, seatNumber: selectedSeatNumber }));
    }
  }, [selectedSeatNumber, propAvailableSeats]);

  const fetchAvailableSeats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/students", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Get user's total seats
      const userData = JSON.parse(localStorage.getItem("userData") || "{}");

      const totalSeats = userData.seats || 50;
      
      // Find occupied seats - handle case where res.data might be empty or undefined
      const occupiedSeats = res.data && Array.isArray(res.data) 
        ? res.data.map((student: any) => student.seatNumber)
        : [];
      
      // Create available seats array
      const available = [];
      for (let i = 1; i <= totalSeats; i++) {
        if (!occupiedSeats.includes(i)) {
          available.push(i);
        }
      }
      
      setAvailableSeats(available);
    } catch (error) {
      console.error("Error fetching available seats:", error);
      // If API fails, assume all seats are available
      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      const totalSeats = userData.seats || 50;
      const available = [];
      for (let i = 1; i <= totalSeats; i++) {
        available.push(i);
      }
      setAvailableSeats(available);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (e.target.name === "mobile") {
      const digits = (e.target as HTMLInputElement).value.replace(/\D/g, "");
      setForm({ ...form, mobile: digits });
      if (digits.length !== 10) {
        setMobileError("Mobile number must be exactly 10 digits");
      } else {
        setMobileError(null);
      }
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm({ ...form, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("mobile", form.mobile);
      formData.append("address", form.address);
      formData.append("courseName", form.courseName);
      formData.append("joinDate", form.joinDate);
      formData.append("seatNumber", form.seatNumber.toString());
      formData.append("totalFees", form.totalFees || "0");
      if (form.image) {
        formData.append("image", form.image);
      }

      console.log(form.totalFees)
      
      await axios.post("/students", formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        },
      });

      
    
      if (onSuccess) onSuccess();
    } catch (error: any) {
      // alert(error.response?.data?.message || "Failed to add student");
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

  const cancelButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
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
          👥 Add New Student
        </h2>

        <form onSubmit={handleSubmit}>
          <div>
            <label style={{ 
              display: "block", 
              marginBottom: "8px", 
              fontWeight: "600", 
              color: "#374151" 
            }}>
              Student Name *
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              style={inputStyle}
              placeholder="Enter student's full name"
            />
          </div>

          <div>
            <label style={{ 
              display: "block", 
              marginBottom: "8px", 
              fontWeight: "600", 
              color: "#374151" 
            }}>
              Mobile Number *
            </label>
            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={10}
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              onKeyDown={(e) => {
                const allowed = ["Backspace","Delete","ArrowLeft","ArrowRight","Tab"]; 
                if (!/[0-9]/.test(e.key) && !allowed.includes(e.key)) {
                  e.preventDefault();
                }
              }}
              required
              style={inputStyle}
              placeholder="Enter mobile number"
            />
            {mobileError && (
              <p style={{ color: "#ef4444", marginTop: "-12px", marginBottom: "12px", fontSize: "14px" }}>{mobileError}</p>
            )}
          </div>

          <div>
            <label style={{ 
              display: "block", 
              marginBottom: "8px", 
              fontWeight: "600", 
              color: "#374151" 
            }}>
              Address *
            </label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              required
              style={inputStyle}
              placeholder="Enter student's address"
            />
          </div>

          <div>
            <label style={{ 
              display: "block", 
              marginBottom: "8px", 
              fontWeight: "600", 
              color: "#374151" 
            }}>
              Course Name *
            </label>
            <input
              type="text"
              name="courseName"
              value={form.courseName}
              onChange={handleChange}
              required
              style={inputStyle}
              placeholder="Enter course name"
            />
          </div>

          <div>
            <label style={{ 
              display: "block", 
              marginBottom: "8px", 
              fontWeight: "600", 
              color: "#374151" 
            }}>
              Join Date *
            </label>
            <input
              type="date"
              name="joinDate"
              value={form.joinDate}
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
              Seat Number *
            </label>
            <select
              name="seatNumber"
              value={form.seatNumber}
              onChange={handleChange}
              required
              style={inputStyle}
            >
              {availableSeats.map(seatNum => (
                <option key={seatNum} value={seatNum}>
                  Seat {seatNum}
                </option>
              ))}
            </select>
            {availableSeats.length === 0 && (
              <p style={{ color: "#ef4444", fontSize: "14px", marginTop: "5px" }}>
                No available seats. All seats are occupied.
              </p>
            )}
          </div>

          <div>
            <label style={{ 
              display: "block", 
              marginBottom: "8px", 
              fontWeight: "600", 
              color: "#374151" 
            }}>
              Total Fees *
            </label>
            <input
              type="number"
              name="totalFees"
              value={form.totalFees}
              onChange={handleChange}
              required
              style={inputStyle}
              placeholder="Enter total course fees"
            />
          </div>

          <div>
            <label style={{ 
              display: "block", 
              marginBottom: "8px", 
              fontWeight: "600", 
              color: "#374151" 
            }}>
              Student Photo (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{
                ...inputStyle,
                padding: "8px 12px",
                cursor: "pointer"
              }}
            />
            {imagePreview && (
              <div style={{ marginTop: "10px" }}>
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{
                    width: "100px",
                    height: "100px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    border: "2px solid #e2e8f0"
                  }}
                />
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <button
              type="submit"
              style={buttonStyle}
              disabled={isLoading || availableSeats.length === 0 || form.mobile.length !== 10}
            >
              {isLoading ? "Adding Student..." : "Add Student"}
            </button>
            
            {onCancel && (
              <button
                type="button"
                style={cancelButtonStyle}
                onClick={onCancel}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}