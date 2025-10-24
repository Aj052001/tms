import { useState, useEffect } from "react";
import axios, { ASSET_BASE_URL } from "../api/axios";

interface Student {
  _id: string;
  name: string;
  mobile: string;
  address: string;
  courseName: string;
  joinDate: string;
  seatNumber: number;
  image?: string;
  totalFees: number;
  fees: Array<{
    _id: string;
    amount: number;
    date: string;
    description: string;
    status: string;
  }>;
}

interface StudentProfileProps {
  studentId?: string;
  onBack?: () => void;
}

export default function StudentProfile({ studentId, onBack }: StudentProfileProps) {

  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showFeesForm, setShowFeesForm] = useState(false);
  const [showIdCard, setShowIdCard] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingFeeIndex, setEditingFeeIndex] = useState<number | null>(null);
  const [feesForm, setFeesForm] = useState({
    amount: "",
    date: new Date().toISOString().split('T')[0],
    description: "Monthly Fee"
  });
  const [mobileError, setMobileError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    mobile: "",
    address: "",
    courseName: "",
    joinDate: "",
    seatNumber: 0,
    totalFees: 0,
    image: null as File | null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Responsive helpers
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth <= 768);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (studentId) {
      fetchStudent();
    }
  }, [studentId]);

  const fetchStudent = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/students/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(res.data)
      setStudent(res.data);
      setEditForm({
        name: res.data.name,
        mobile: res.data.mobile,
        address: res.data.address,
        courseName: res.data.courseName,
        joinDate: res.data.joinDate.split('T')[0],
        seatNumber: res.data.seatNumber,
        totalFees: res.data.totalFees || 0,
        image: null,
      });
    } catch (error) {
      console.error("Error fetching student:", error);
    }
  };

  const handleFeesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem("token");
      if (editingFeeIndex !== null && student) {
        const feeId = student.fees[editingFeeIndex]._id;
        await axios.put(`/students/${studentId}/fees/${feeId}`, feesForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // alert("Fee updated successfully!");
      } else {
        await axios.post(`/students/${studentId}/fees`, feesForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // alert("Fee added successfully!");
      }
      setFeesForm({ amount: "", date: new Date().toISOString().split('T')[0], description: "Monthly Fee" });
      setEditingFeeIndex(null);
      setShowFeesForm(false);
      // Notify other parts of app (e.g., Notifications) to refresh overdue list
      window.dispatchEvent(new CustomEvent("feesUpdated"));
      fetchStudent(); // Refresh student data
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to save fee");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "mobile") {
      const digits = value.replace(/\D/g, "");
      setEditForm({ ...editForm, mobile: digits });
      if (digits.length !== 10) {
        setMobileError("Mobile number must be exactly 10 digits");
      } else {
        setMobileError(null);
      }
    } else {
      setEditForm({ ...editForm, [name]: value });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditForm({ ...editForm, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("name", editForm.name);
      formData.append("mobile", editForm.mobile);
      formData.append("address", editForm.address);
      formData.append("courseName", editForm.courseName);
      formData.append("joinDate", editForm.joinDate);
      formData.append("seatNumber", editForm.seatNumber.toString());
      formData.append("totalFees", editForm.totalFees.toString());
      formData.append("originalSeatNumber", student?.seatNumber.toString() || "0");
      if (editForm.image) {
        formData.append("image", editForm.image);
      }
      
      await axios.put(`/students/${studentId}`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        },
      });
      alert("Student updated successfully!");
      setIsEditing(false);
      // Broadcast to refresh other parts of the app (e.g., Students list)
      window.dispatchEvent(new CustomEvent("studentUpdated"));
      fetchStudent();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update student");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditFee = (index: number) => {
    const fee = student?.fees[index];
    if (fee) {
      setFeesForm({
        amount: fee.amount.toString(),
        date: fee.date.split('T')[0],
        description: fee.description
      });
      setEditingFeeIndex(index);
      setShowFeesForm(true);
    }
  };

  const handleDeleteFee = async (index: number) => {
    if (!student) return;
    if (window.confirm("Are you sure you want to delete this fee record?")) {
      try {
        const token = localStorage.getItem("token");
        const feeId = student.fees[index]._id;
        await axios.delete(`/students/${studentId}/fees/${feeId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // alert("Fee deleted successfully!");
        window.dispatchEvent(new CustomEvent("feesUpdated"));
        fetchStudent();
      } catch (error: any) {
        alert(error.response?.data?.message || "Failed to delete fee");
      }
    }
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "20px",
  };

  const cardStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
    borderRadius: "16px",
    padding: "30px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
    border: "1px solid #e2e8f0",
    marginBottom: "20px",
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
    marginBottom: "10px",
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



const generateFeeReceipt = async (feeIndex: number) => {
  if (!student) return;
  const fee = student.fees[feeIndex];
  if (!fee) return;

  const canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 700;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Border
  ctx.strokeStyle = "#1e3a8a";
  ctx.lineWidth = 3;
  ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

  // Header
  ctx.fillStyle = "#1e3a8a";
  ctx.fillRect(20, 20, canvas.width - 40, 100);
  
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 24px Arial";
  ctx.textAlign = "center";
  
  ctx.font = "bold 32px Arial";
  ctx.fillText("TMS COMPUTER CLASSES, SIKAR", canvas.width / 2, 90);
  
  // Receipt Title
  ctx.fillStyle = "#1e293b";
  ctx.font = "bold 28px Arial";
  ctx.fillText("FEE RECEIPT", canvas.width / 2, 155);
  
  // Receipt Number and Date
  ctx.font = "16px Arial";
  ctx.textAlign = "left";
  ctx.fillStyle = "#374151";
  ctx.fillText(`Receipt No: ${fee.description}`, 60, 180);
  ctx.textAlign = "right";
  ctx.fillText(`Date: ${new Date(fee.date).toLocaleDateString()}`, canvas.width - 60, 180);
  
  // Divider
  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(60, 200);
  ctx.lineTo(canvas.width - 60, 200);
  ctx.stroke();
  
  // Student Details
  let y = 240;
  ctx.textAlign = "left";
  ctx.fillStyle = "#111827";
  ctx.font = "bold 18px Arial";
  ctx.fillText("Student Details:", 60, y);
  
  y += 35;
  ctx.font = "16px Arial";
  ctx.fillStyle = "#374151";
  const details = [
    [`Name: ${student.name}`, `Seat No: ${student.seatNumber}`],
    [`Mobile: ${student.mobile}`, `Course: ${student.courseName}`],
    [`Join Date: ${new Date(student.joinDate).toLocaleDateString()}`, ``]
  ];
  
  details.forEach(([left, right]) => {
    ctx.fillText(left, 60, y);
    if (right) ctx.fillText(right, 420, y);
    y += 30;
  });
  
  // Payment Details Section
  y += 20;
  ctx.fillStyle = "#f3f4f6";
  ctx.fillRect(60, y, canvas.width - 120, 140);
  
  y += 30;
  ctx.fillStyle = "#111827";
  ctx.font = "bold 18px Arial";
  ctx.fillText("Payment Details:", 80, y);
  
  y += 35;
  ctx.font = "16px Arial";
  ctx.fillStyle = "#374151";
  ctx.fillText(`Description: ${fee.description}`, 80, y);
  
  y += 30;
  ctx.fillText(`Payment Method: Cash/Online`, 80, y);
  
  y += 30;
  ctx.font = "bold 20px Arial";
  ctx.fillStyle = "#059669";
  ctx.fillText(`Amount Paid: ₹${fee.amount}`, 80, y);
  
  // Total Fees Summary
  y += 50;
  const feesPaid = student.fees.reduce((sum, f) => sum + f.amount, 0);
  const remaining = student.totalFees - feesPaid;
  
  ctx.font = "16px Arial";
  ctx.fillStyle = "#374151";
  ctx.fillText(`Total Course Fees: ₹${student.totalFees}`, 60, y);
  y += 25;
  ctx.fillText(`Total Paid: ₹${feesPaid}`, 60, y);
  y += 25;
  ctx.fillStyle = remaining > 0 ? "#dc2626" : "#059669";
  ctx.font = "bold 16px Arial";
  ctx.fillText(`Remaining Balance: ₹${remaining}`, 60, y);
  
  
  // Signature line
  y += 30;
  ctx.strokeStyle = "#374151";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(canvas.width - 200, y);
  ctx.lineTo(canvas.width - 60, y);
  ctx.stroke();
  ctx.font = "12px Arial";
  ctx.fillText("Authorized Signature", canvas.width - 180, y + 15);
  
  // Export
  const dataUrl = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = `TMS_FeeReceipt_${student.name.replace(/\s+/g, "_")}_${new Date(fee.date).toISOString().split('T')[0]}.png`;
  a.click();
};

const generateIdCard = async () => {
  if (!student) return;

  const canvas = document.createElement("canvas");
  canvas.width = 320;   // smaller width
  canvas.height = 460;  // increased height for course name
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // === CARD BACKGROUND with clipping ===
ctx.beginPath();
ctx.roundRect(15, 15, canvas.width - 30, canvas.height - 30, 16);
ctx.fillStyle = "#ffffff";
ctx.fill();
ctx.stroke();

// Enable clipping so nothing draws outside card
ctx.clip();

// === HEADER BAR ===
const headerH = 60;
ctx.fillStyle = "#1e3a8a"; // dark blue
ctx.fillRect(15, 15, canvas.width - 30, headerH);

// === HEADER TEXT ===
ctx.fillStyle = "#ffffff";
ctx.font = "bold 20px Arial";
ctx.textAlign = "center";
ctx.textBaseline = "middle";
ctx.fillText("LIBRARY CARD", canvas.width / 2, 15 + headerH / 2);

  // === PHOTO ===
  const img = new Image();
  img.crossOrigin = "anonymous";
  const imgUrl = student.image ? (student.image.startsWith("/") ? `${ASSET_BASE_URL}${student.image}` : student.image) : "";

  const photoSize = 120;
  const photoX = canvas.width / 2 - photoSize / 2;
  const photoY = headerH + 40;

  await new Promise<void>((resolve) => {
    if (!imgUrl) { resolve(); return; }
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = imgUrl;
  });

  ctx.fillStyle = "#e5e7eb";
  ctx.beginPath();
  ctx.roundRect(photoX, photoY, photoSize, photoSize, 10);
  ctx.fill();

  if (imgUrl) {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(photoX, photoY, photoSize, photoSize, 10);
    ctx.clip();
    ctx.drawImage(img, photoX, photoY, photoSize, photoSize);
    ctx.restore();
  }

  // === NAME ===
  let textY = photoY + photoSize + 40;
  ctx.fillStyle = "#111827";
  ctx.font = "bold 22px Arial";
  ctx.textAlign = "center";
  ctx.fillText(student.name, canvas.width / 2, textY);

  textY += 35;

  // === DETAILS (Seat No, Course, Mobile, Joined) ===
  const details = [
    ["Seat No", String(student.seatNumber)],
    ["Course", student.courseName],
    ["Mobile", student.mobile],
    ["Joining", new Date(student.joinDate).toLocaleDateString()],
  ];

  ctx.textAlign = "left";
  details.forEach(([label, value]) => {
    ctx.fillStyle = "#374151";
    ctx.font = "bold 16px Arial";
    ctx.fillText(label + ":", 60, textY);

    ctx.fillStyle = "#111827";
    ctx.font = "16px Arial";
    ctx.fillText(value, 170, textY);

    textY += 40;
  });

  // === EXPORT ===
  const dataUrl = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = `${student.name.replace(/\s+/g, "_")}_IDCard.png`;
  a.click();
};



  if (!student) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <p>Loading student details...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ margin: 0, color: "#1e293b", fontSize: "24px", fontWeight: "700" }}>
          👤 Student Profile
        </h2>
        {onBack && (
          <button
            style={{ ...buttonStyle, background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" }}
            onClick={onBack}
          >
            Back
          </button>
        )}
      </div>

      {/* Student Details */}
      <div style={cardStyle}>
<div style={{ display: "flex", gap: isMobile ? "16px" : "30px", alignItems: "flex-start", flexDirection: isMobile ? "row" : "row" }}>
          {/* Student Photo */}
          <div>
            {student.image ? (
<img
                src={student.image.startsWith("/") ? `${ASSET_BASE_URL}${student.image}` : student.image}
                alt={student.name}
                loading="lazy"
                style={{
                  width: isMobile ? "100px" : "150px",
                  height: isMobile ? "100px" : "150px",
                  objectFit: "cover",
                  borderRadius: "16px",
                  border: "3px solid #e2e8f0",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                }}
              />
            ) : (
<div style={{
                width: isMobile ? "100px" : "150px",
                height: isMobile ? "100px" : "150px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                borderRadius: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: isMobile ? "36px" : "48px",
                color: "white",
                fontWeight: "bold"
              }}>
                {student.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Student Info */}
          <div style={{ flex: 1 }}>
<h3 style={{ margin: "0 0 20px 0", color: "#1e293b", fontSize: isMobile ? "22px" : "28px" }}>
              {student.name}
            </h3>
            
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "20px" }}>
              <div>
                <label style={{ display: "block", fontWeight: "600", color: "#6b7280", marginBottom: "5px" }}>
                  Mobile Number
                </label>
                <p style={{ margin: 0, color: "#374151", fontSize: "16px" }}>{student.mobile}</p>
              </div>
              
              <div>
                <label style={{ display: "block", fontWeight: "600", color: "#6b7280", marginBottom: "5px" }}>
                  Seat Number
                </label>
                <p style={{ margin: 0, color: "#374151", fontSize: "16px" }}>Seat {student.seatNumber}</p>
              </div>
              
              <div>
                <label style={{ display: "block", fontWeight: "600", color: "#6b7280", marginBottom: "5px" }}>
                  Course Name
                </label>
                <p style={{ margin: 0, color: "#374151", fontSize: "16px" }}>{student.courseName}</p>
              </div>
              
              <div>
                <label style={{ display: "block", fontWeight: "600", color: "#6b7280", marginBottom: "5px" }}>
                  Join Date
                </label>
                <p style={{ margin: 0, color: "#374151", fontSize: "16px" }}>
                  {new Date(student.joinDate).toLocaleDateString()}
                </p>
              </div>
              
              <div>
                <label style={{ display: "block", fontWeight: "600", color: "#6b7280", marginBottom: "5px" }}>
                  Total Fees
                </label>
                <p style={{ margin: 0, color: "#374151", fontSize: "16px" }}>
                  ₹{student.totalFees || 0}
                </p>
              </div>
              
              <div>
                <label style={{ display: "block", fontWeight: "600", color: "#6b7280", marginBottom: "5px" }}>
                  Fees Paid
                </label>
                <p style={{ margin: 0, color: "#059669", fontSize: "16px", fontWeight: "600" }}>
                  ₹{student.fees.reduce((sum, fee) => sum + fee.amount, 0)}
                </p>
              </div>
              
              <div>
                <label style={{ display: "block", fontWeight: "600", color: "#6b7280", marginBottom: "5px" }}>
                  Remaining Fees
                </label>
                <p style={{ 
                  margin: 0, 
                  color: ((student.totalFees || 0) - student.fees.reduce((sum, fee) => sum + fee.amount, 0)) > 0 ? "#ef4444" : "#059669", 
                  fontSize: "16px",
                  fontWeight: "600"
                }}>
                  ₹{(student.totalFees || 0) - student.fees.reduce((sum, fee) => sum + fee.amount, 0)}
                </p>
              </div>
            </div>
            
            <div style={{ marginTop: "20px" }}>
              <label style={{ display: "block", fontWeight: "600", color: "#6b7280", marginBottom: "5px" }}>
                Address
              </label>
              <p style={{ margin: 0, color: "#374151", fontSize: "16px" }}>{student.address}</p>
            </div>
          </div>
        </div>
       
        <div
  style={{
    marginTop: "30px",
    display: "flex",
    gap: "10px",
    flexWrap: "nowrap",   // prevent wrapping
    justifyContent: "flex-start", // keep them in a row
  }}
>
  <button
    style={{
      ...buttonStyle,
      padding: "6px 12px",   // smaller size
      fontSize: "14px",      // reduce text size
    }}
    onClick={() => setShowFeesForm(true)}
  >
    Add Fee
  </button>

  <button
    style={{
      ...buttonStyle,
      padding: "6px 12px",
      fontSize: "14px",
      background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    }}
    onClick={generateIdCard}
  >
    Generate ID Card
  </button>

  <button
    style={{
      ...buttonStyle,
      padding: "6px 12px",
      fontSize: "14px",
      background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    }}
    onClick={() => setIsEditing(!isEditing)}
  >
    {isEditing ? "Cancel Edit" : "Edit Profile"}
  </button>
</div>

      </div>

      {/* Fees History */}
      <div style={cardStyle}>
        <h3 style={{ margin: "0 0 20px 0", color: "#1e293b", fontSize: "20px" }}>
          Fee History
        </h3>
        
        {student.fees.length === 0 ? (
          <p style={{ color: "#6b7280", textAlign: "center", padding: "20px" }}>
            No fees recorded yet.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {student.fees.map((fee, index) => (
              <div
                key={index}
style={{
                  padding: "15px",
                  background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                  borderRadius: "12px",
                  border: "1px solid #bae6fd",
                  display: "flex",
                  flexDirection: isMobile ? "row" : "row",
                  justifyContent: isMobile ? "flex-start" : "space-between",
                  alignItems: isMobile ? "flex-start" : "center",
                  gap: isMobile ? "10px" : undefined
                }}
              >
                <div>
                  <p style={{ margin: "0 0 5px 0", fontWeight: "600", color: "#1e293b" }}>
                    {fee.description}
                  </p>
                  <p style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>
                    {new Date(fee.date).toLocaleDateString()}
                  </p>
                </div>
                <div style={{ textAlign: "right", display: "flex", alignItems: "center", gap: "10px" }}>
                  <div>
                    <p style={{ margin: "0 0 5px 0", fontWeight: "600", color: "#059669", fontSize: "18px" }}>
                      ₹{fee.amount}
                    </p>
                    <span style={{
                      padding: "4px 8px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "600",
                      background: fee.status === "paid" ? "#dcfce7" : "#fef3c7",
                      color: fee.status === "paid" ? "#166534" : "#92400e"
                    }}>
                      {fee.status.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "5px" }}>
                    <button
                      onClick={() => generateFeeReceipt(index)}
                      style={{
                        padding: "6px 10px",
                        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                        border: "none",
                        borderRadius: "6px",
                        color: "white",
                        fontSize: "12px",
                        cursor: "pointer"
                      }}
                      title="Generate Receipt"
                    >
                      🧾
                    </button>
                    <button
                      onClick={() => handleEditFee(index)}
                      style={{
                        padding: "6px 10px",
                        background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                        border: "none",
                        borderRadius: "6px",
                        color: "white",
                        fontSize: "12px",
                        cursor: "pointer"
                      }}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteFee(index)}
                      style={{
                        padding: "6px 10px",
                        background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                        border: "none",
                        borderRadius: "6px",
                        color: "white",
                        fontSize: "12px",
                        cursor: "pointer"
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Profile Form Modal */}
      {isEditing && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "white",
            borderRadius: "16px",
            padding: "30px",
            maxWidth: "600px",
            width: "90%",
            maxHeight: "90vh",
            overflow: "auto"
          }}>
            <h3 style={{ margin: "0 0 20px 0", color: "#1e293b" }}>Edit Student Profile</h3>
            
            <form onSubmit={handleEditSubmit}>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151" }}>
                  Student Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  required
                  style={inputStyle}
                />
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151" }}>
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={10}
                  name="mobile"
                  value={editForm.mobile}
                  onChange={handleEditChange}
                  onKeyDown={(e) => {
                    const allowed = ["Backspace","Delete","ArrowLeft","ArrowRight","Tab"]; 
                    if (!/[0-9]/.test(e.key) && !allowed.includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  required
                  style={inputStyle}
                />
                {mobileError && (
                  <p style={{ color: "#ef4444", marginTop: "-12px", marginBottom: "12px", fontSize: "14px" }}>{mobileError}</p>
                )}
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151" }}>
                  Address *
                </label>
                <input
                  type="text"
                  name="address"
                  value={editForm.address}
                  onChange={handleEditChange}
                  required
                  style={inputStyle}
                />
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151" }}>
                  Course Name *
                </label>
                <input
                  type="text"
                  name="courseName"
                  value={editForm.courseName}
                  onChange={handleEditChange}
                  required
                  style={inputStyle}
                />
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151" }}>
                  Join Date *
                </label>
                <input
                  type="date"
                  name="joinDate"
                  value={editForm.joinDate}
                  onChange={handleEditChange}
                  required
                  style={inputStyle}
                />
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151" }}>
                  Seat Number *
                </label>
                <input
                  type="number"
                  name="seatNumber"
                  value={editForm.seatNumber}
                  onChange={handleEditChange}
                  required
                  style={inputStyle}
                />
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151" }}>
                  Total Fees *
                </label>
                <input
                  type="number"
                  name="totalFees"
                  value={editForm.totalFees}
                  onChange={handleEditChange}
                  required
                  style={inputStyle}
                  placeholder="Enter total course fees"
                />
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151" }}>
                  Student Photo
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
                  disabled={isLoading || !!mobileError || editForm.mobile.length !== 10}
                >
                  {isLoading ? "Updating..." : "Update Profile"}
                </button>
                
                <button
                  type="button"
                  style={{ ...buttonStyle, background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" }}
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Fee Form Modal */}
      {showFeesForm && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "white",
            borderRadius: "16px",
            padding: "30px",
            maxWidth: "500px",
            width: "90%",
            maxHeight: "90vh",
            overflow: "auto"
          }}>
            <h3 style={{ margin: "0 0 20px 0", color: "#1e293b" }}>Add Fee Payment</h3>
            
            <form onSubmit={handleFeesSubmit}>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151" }}>
                  Amount *
                </label>
                <input
                  type="number"
                  value={feesForm.amount}
                  onChange={(e) => setFeesForm({ ...feesForm, amount: e.target.value })}
                  required
                  style={inputStyle}
                  placeholder="Enter amount"
                />
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151" }}>
                  Payment Date *
                </label>
                <input
                  type="date"
                  value={feesForm.date}
                  onChange={(e) => setFeesForm({ ...feesForm, date: e.target.value })}
                  required
                  style={inputStyle}
                />
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151" }}>
                  Description
                </label>
                <input
                  type="text"
                  value={feesForm.description}
                  onChange={(e) => setFeesForm({ ...feesForm, description: e.target.value })}
                  style={inputStyle}
                  placeholder="Enter description"
                />
              </div>
              
              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                <button
                  type="submit"
                  style={buttonStyle}
                  disabled={isLoading}
                >
                  {isLoading ? "Adding..." : "Add Fee"}
                </button>
                
                <button
                  type="button"
                  style={{ ...buttonStyle, background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" }}
                  onClick={() => setShowFeesForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ID Card Modal */}
      {showIdCard && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "white",
            borderRadius: "16px",
            padding: "30px",
            maxWidth: "400px",
            width: "90%",
            textAlign: "center"
          }}>
            <h3 style={{ margin: "0 0 20px 0", color: "#1e293b" }}>Student ID Card</h3>
            
            {/* ID Card Design (preview vertical) */}
            <div style={{
              borderRadius: "16px",
              padding: 0,
              color: "#0f172a",
              marginBottom: "20px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
              overflow: "hidden",
            }}>
              <div style={{
                background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
                padding: "12px 16px",
                color: "white",
                textAlign: "center"
              }}>
                <h2 style={{ margin: 0, fontSize: "18px" }}>Student ID</h2>
              </div>

              <div style={{ padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                {student.image ? (
<img
                    src={student.image.startsWith("/") ? `${ASSET_BASE_URL}${student.image}` : student.image}
                    alt={student.name}
                    loading="lazy"
                    style={{
                      width: "120px",
                      height: "120px",
                      objectFit: "cover",
                      borderRadius: "50%",
                      border: "4px solid #e2e8f0",
                    }}
                  />
                ) : (
                  <div style={{
                    width: "120px",
                    height: "120px",
                    background: "linear-gradient(135deg, #a78bfa 0%, #22d3ee 100%)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "48px",
                    color: "white",
                    fontWeight: 700
                  }}>
                    {student.name.charAt(0).toUpperCase()}
                  </div>
                )}

                <h3 style={{ margin: "10px 0 0 0", fontSize: "20px", color: "#0f172a", textAlign: "center" }}>{student.name}</h3>
                <div style={{ width: "100%", marginTop: "8px" }}>
                  <p style={{ margin: "6px 0", fontSize: "14px", color: "#334155" }}>
                    Seat: <strong>{student.seatNumber}</strong>
                  </p>
                  <p style={{ margin: "6px 0", fontSize: "14px", color: "#334155" }}>
                    Mobile: <strong>{student.mobile}</strong>
                  </p>
                  <p style={{ margin: "6px 0", fontSize: "14px", color: "#334155" }}>
                    Joined: <strong>{new Date(student.joinDate).toLocaleDateString()}</strong>
                  </p>
                </div>
              </div>
            </div>
            
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                style={{ ...buttonStyle, flex: 1 }}
                onClick={() => window.print()}
              >
                🖨️ Print ID Card
              </button>
              
              <button
                style={{ ...buttonStyle, background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", flex: 1 }}
                onClick={() => setShowIdCard(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}