import { useState, useEffect } from "react";
import axios from "../api/axios";

interface OverdueStudent {
  _id: string;
  name: string;
  mobile: string;
  seatNumber: number;
  fees: Array<{
    amount: number;
    date: string;
    description: string;
    status: string;
  }>;
}

export default function Notifications() {
  const [overdueStudents, setOverdueStudents] = useState<OverdueStudent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isSmallMobile, setIsSmallMobile] = useState(window.innerWidth <= 480);

  useEffect(() => {
    fetchOverdueStudents();
  }, []);

  // Refresh when fees are updated elsewhere
  useEffect(() => {
    const handler = () => fetchOverdueStudents();
    window.addEventListener("feesUpdated", handler as EventListener);
    return () => window.removeEventListener("feesUpdated", handler as EventListener);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsSmallMobile(isSmallMobile);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchOverdueStudents = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/students/overdue", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOverdueStudents(res.data);
    } catch (error) {
      console.error("Error fetching overdue students:", error);
      setOverdueStudents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "20px",
    width: "100%",
    boxSizing: "border-box",
  };

  const cardStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
    borderRadius: "16px",
    padding: "30px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
    border: "1px solid #e2e8f0",
    marginBottom: "20px",
  };

 
  const studentCardStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
    borderRadius: "12px",
    padding: "20px",
    border: "1px solid #f59e0b",
    marginBottom: "15px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          marginBottom: "30px",
          flexDirection: isMobile ? "column" : "row",
          gap: "20px"
        }}>
          <h2 style={{ 
            margin: 0, 
            color: "#1e293b", 
            fontSize: isMobile ? "20px" : "24px", 
            fontWeight: "700",
            textAlign: isMobile ? "center" : "left"
          }}>
            🔔 Fee Reminders
          </h2>
          
        </div>

        {isLoading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
            <div style={{ fontSize: "48px", marginBottom: "20px" }}>⏳</div>
            <h3 style={{ margin: "0 0 10px 0", color: "#1e293b" }}>Loading...</h3>
            <p style={{ margin: 0 }}>Fetching overdue students...</p>
          </div>
        ) : overdueStudents.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
            <div style={{ fontSize: "48px", marginBottom: "20px" }}>🎉</div>
            <h3 style={{ margin: "0 0 10px 0", color: "#1e293b" }}>All Caught Up!</h3>
            <p style={{ margin: 0 }}>No students have overdue fees at the moment.</p>
          </div>
        ) : (
          <div>
            <p style={{ color: "#6b7280", marginBottom: "20px" }}>
              {overdueStudents.length} student(s) have overdue fees or haven't paid any fees yet.
            </p>
            
            {overdueStudents.map((student) => {
              const lastFee = student.fees.length > 0 
                ? student.fees[student.fees.length - 1]
                : null;
              
              const daysSinceLastFee = lastFee 
                ? Math.floor((new Date().getTime() - new Date(lastFee.date).getTime()) / (1000 * 60 * 60 * 24))
                : null;

              return (
                <div key={student._id} style={{
                  ...studentCardStyle,
                  flexDirection: isMobile ? "column" : "row",
                  alignItems: isMobile ? "flex-start" : "center",
                  gap: isMobile ? "15px" : "15px"
                }}>
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "10px",
                    width: isMobile ? "100%" : "auto"
                  }}>
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student._id)}
                      onChange={() => handleStudentSelect(student._id)}
                      style={{ width: "20px", height: "20px", cursor: "pointer" }}
                    />
                    <h3 style={{ 
                      margin: 0, 
                      color: "#1e293b", 
                      fontSize: isMobile ? "16px" : "18px" 
                    }}>
                      {student.name}
                    </h3>
                  </div>
                  
                  <div style={{ 
                    flex: 1, 
                    width: isMobile ? "100%" : "auto"
                  }}>
                    <div style={{ 
                      display: "grid", 
                      gridTemplateColumns: isMobile 
                        ? "1fr" 
                        : window.innerWidth <= 1024 
                          ? "1fr 1fr" 
                          : "1fr 1fr 1fr", 
                      gap: "15px", 
                      fontSize: "14px" 
                    }}>
                      <div>
                        <span style={{ fontWeight: "600", color: "#6b7280" }}>Seat:</span> {student.seatNumber}
                      </div>
                      <div>
                        <span style={{ fontWeight: "600", color: "#6b7280" }}>Mobile:</span> {student.mobile}
                      </div>
                      <div>
                        <span style={{ fontWeight: "600", color: "#6b7280" }}>Total Fees:</span> ₹{student.fees.reduce((sum, fee) => sum + fee.amount, 0)}
                      </div>
                    </div>
                    
                    {lastFee ? (
                      <div style={{ marginTop: "8px", fontSize: "14px" }}>
                        <span style={{ fontWeight: "600", color: "#6b7280" }}>Last Payment:</span> 
                        <span style={{ color: "#dc2626", fontWeight: "600" }}>
                          {" "}₹{lastFee.amount} ({daysSinceLastFee} days ago)
                        </span>
                      </div>
                    ) : (
                      <div style={{ marginTop: "8px", fontSize: "14px" }}>
                        <span style={{ color: "#dc2626", fontWeight: "600" }}>
                          ⚠️ No fees paid yet
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div style={{ 
                    textAlign: isMobile ? "left" : "right",
                    width: isMobile ? "100%" : "auto"
                  }}>
                    <button
                      onClick={() => {
                        // Build a single-student WhatsApp message
                        const last = lastFee;
                        let message = "📚 *Fee Reminder - Coaching Institute*\n\n";
                        message += `👤 *${student.name}*\n`;
                        message += `🪑 Seat: ${student.seatNumber}\n`;
                        message += `📱 Mobile: ${student.mobile}\n`;
                        if (last) {
                          const days = Math.floor((new Date().getTime() - new Date(last.date).getTime()) / (1000 * 60 * 60 * 24));
                          message += `💰 Last Fee: ₹${last.amount} (${days} days ago)\n`;
                        } else {
                          message += `💰 Status: No fees paid yet\n`;
                        }
                        message += "\nPlease submit your monthly fee at the earliest.\n";
                        message += "Thank you!";
                        const wa = `https://wa.me/?text=${encodeURIComponent(message)}`;
                        window.open(wa, "_blank");
                      }}
                      style={{
                        padding: "8px 12px",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: "600",
                        background: lastFee && daysSinceLastFee && daysSinceLastFee > 30 
                          ? "#fef2f2" 
                          : "#fef3c7",
                        color: lastFee && daysSinceLastFee && daysSinceLastFee > 30 
                          ? "#dc2626" 
                          : "#d97706",
                        border: "1px solid #e5e7eb",
                        cursor: "pointer"
                      }}
                    >
                      {lastFee && daysSinceLastFee && daysSinceLastFee > 30 
                        ? `${daysSinceLastFee} days overdue`
                        : "Overdue"
                      }
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}