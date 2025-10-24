

import { useState, useEffect } from "react";
import axios, { ASSET_BASE_URL } from "../api/axios";

interface Student {
  _id: string;
  name: string;
  mobile: string;
  address: string;
  joinDate: string;
  seatNumber: number;
  image?: string;
  totalFees: number;
  fees: Array<{
    amount: number;
    date: string;
    description: string;
    status: string;
  }>;
}

interface StudentsProps {
  onAddStudent?: () => void;
  onStudentClick?: (studentId: string) => void;
}

export default function Students({ onAddStudent, onStudentClick }: StudentsProps) {
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    fetchStudents();
  }, []);

  // Refresh list whenever a student or fees are updated elsewhere
  useEffect(() => {
    const handler = () => fetchStudents();
    window.addEventListener("studentUpdated", handler as EventListener);
    window.addEventListener("feesUpdated", handler as EventListener);
    return () => {
      window.removeEventListener("studentUpdated", handler as EventListener);
      window.removeEventListener("feesUpdated", handler as EventListener);
    };
  }, []);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/students", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(res.data);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    if (window.confirm(`Are you sure you want to delete ${studentName}?`)) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`/students/${studentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // alert("Student deleted successfully!");
        fetchStudents();
      } catch (error: any) {
        // alert(error.response?.data?.message || "Failed to delete student");
      }
    }
  };

  const buttonStyle: React.CSSProperties = {
    padding: "12px 24px",
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    border: "none",
    borderRadius: "12px",
    color: "white",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    marginBottom: "20px",
  };

  return (
    <div>
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
          👥 Students Management
        </h2>
        
        {onAddStudent && (
          <button
            style={buttonStyle}
            onClick={onAddStudent}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 16px rgba(16, 185, 129, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            ➕ Add New Student
          </button>
        )}
      </div>
      
      {students.length === 0 ? (
        <div style={{
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          borderRadius: "16px",
          padding: "30px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          border: "1px solid #e2e8f0",
          textAlign: "center",
          color: "#6b7280"
        }}>
          <p>No students found.</p>
          <p>Click "Add New Student" to add students to your coaching institute.</p>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "20px",
          marginTop: "20px"
        }}>
          {students.map((student) => (
            <div
              key={student._id}
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                borderRadius: "16px",
                padding: "20px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                border: "1px solid #e2e8f0",
                cursor: "pointer",
                transition: "all 0.3s ease",
                position: "relative"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.1)";
              }}
              onClick={() => onStudentClick?.(student._id)}
            >
              {/* Student Photo */}
              <div style={{ textAlign: "center", marginBottom: "15px" }}>
                {student.image ? (
<img
                    src={student.image.startsWith("/") ? `${ASSET_BASE_URL}${student.image}` : student.image}
                    alt={student.name}
                    loading="lazy"
                    style={{
                      width: "80px",
                      height: "80px",
                      objectFit: "cover",
                      borderRadius: "50%",
                      border: "3px solid #e2e8f0",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                    }}
                  />
                ) : (
                  <div style={{
                    width: "80px",
                    height: "80px",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "32px",
                    color: "white",
                    fontWeight: "bold",
                    margin: "0 auto"
                  }}>
                    {student.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Student Info */}
              <div style={{ textAlign: "center" }}>
                <h3 style={{ 
                  margin: "0 0 10px 0", 
                  color: "#1e293b", 
                  fontSize: "20px",
                  fontWeight: "600"
                }}>
                  {student.name}
                </h3>
                
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "1fr 1fr", 
                  gap: "10px", 
                  marginBottom: "15px",
                  fontSize: "14px"
                }}>
                  <div>
                    <span style={{ fontWeight: "600", color: "#6b7280" }}>Seat:</span>
                    <br />
                    <span style={{ color: "#374151" }}>{student.seatNumber}</span>
                  </div>
                  <div>
                    <span style={{ fontWeight: "600", color: "#6b7280" }}>Mobile:</span>
                    <br />
                    <span style={{ color: "#374151" }}>{student.mobile}</span>
                  </div>
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <span style={{ fontWeight: "600", color: "#6b7280", fontSize: "14px" }}>Total Fees:</span>
                  <br />
                  <span style={{ 
                    color: "#1e293b", 
                    fontSize: "18px", 
                    fontWeight: "600" 
                  }}>
                    ₹{student.totalFees || 0}
                  </span>
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <span style={{ fontWeight: "600", color: "#6b7280", fontSize: "14px" }}>Remaining Fees:</span>
                  <br />
                  <span style={{ 
                    color: ((student.totalFees || 0) - student.fees.reduce((sum, fee) => sum + fee.amount, 0)) > 0 ? "#ef4444" : "#059669", 
                    fontSize: "18px", 
                    fontWeight: "600" 
                  }}>
                    ₹{(student.totalFees || 0) - student.fees.reduce((sum, fee) => sum + fee.amount, 0)}
                  </span>
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <span style={{ fontWeight: "600", color: "#6b7280", fontSize: "14px" }}>Joined:</span>
                  <br />
                  <span style={{ color: "#374151", fontSize: "14px" }}>
                    {new Date(student.joinDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Delete Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteStudent(student._id, student.name);
                }}
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  padding: "6px 10px",
                  background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                  border: "none",
                  borderRadius: "6px",
                  color: "white",
                  fontSize: "12px",
                  cursor: "pointer",
                  opacity: 0.8,
                  transition: "opacity 0.3s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "1";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "0.8";
                }}
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
