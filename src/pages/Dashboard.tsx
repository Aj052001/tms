import { useEffect, useState, lazy, Suspense } from "react";
import TopNav from "../components/TopNav";
import LeftNav from "../components/LeftNav";
import SeatCard from "../components/SeatCard";
import axios, { ASSET_BASE_URL } from "../api/axios";

// Lazy-loaded pages/components to speed up initial load
const StudentsPage = lazy(() => import("./Students"));
const Analytics = lazy(() => import("../components/Analytics"));
const Expenses = lazy(() => import("../components/Expenses"));
const SettingsPage = lazy(() => import("./Settings"));
const ProfilePage = lazy(() => import("../components/ProfilePage"));
const AddStudentForm = lazy(() => import("../components/AddStudentForm"));
const StudentProfile = lazy(() => import("../components/StudentProfile"));
const Notifications = lazy(() => import("../components/Notifications"));

interface Seat {
  seatNumber: number;
  occupied: boolean;
  studentName?: string;
  studentId?: string;
  studentImage?: string;
}

export default function Dashboard() {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [coachingName, setCoachingName] = useState("Loading...");
   const [ownerName, setOwnerName] = useState("Loading...");
  const [totalSeats, setTotalSeats] = useState(50); // Default fallback
  
  const [activePage, setActivePage] = useState<
    | "dashboard"
    | "students"
    | "studentProfile"
    | "inquiries"
    | "analytics"
    | "fees"
    | "expenses"
    | "settings"
    | "profile"
  >("dashboard");
  
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth > 768 && window.innerWidth <= 1200);
  const [highlightSeats, setHighlightSeats] = useState<number[]>([]);
  const [searchResult, setSearchResult] = useState<{
    type: 'info' | 'error';
    message?: string;
    matches?: { seatNumber: number; studentName: string }[];
  } | null>(null);
  const [showAddStudentForm, setShowAddStudentForm] = useState(false);
  const [selectedSeatForForm, setSelectedSeatForForm] = useState<number | null>(null);
  const [availableSeats, setAvailableSeats] = useState<number[]>([]);

  // Fetch user profile data
  useEffect(() => {
    // First try to get data from localStorage for faster loading
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      try {
        const userData = JSON.parse(storedUserData);

        setOwnerName(userData.ownerName)
        setCoachingName(userData.coachingName);
        setTotalSeats(userData.seats);
      } catch (error) {
        console.error("Error parsing stored user data:", error);
      }
    }

    // Then fetch fresh data from server
    const token = localStorage.getItem("token");
    axios
      .get("/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const userData = res.data.user;
        setCoachingName(userData.coachingName);
        setOwnerName(userData.ownerName)
        setTotalSeats(userData.seats);
        // Update localStorage with fresh data
        localStorage.setItem("userData", JSON.stringify(userData));
      })
      .catch((error) => {
        console.error("Error fetching user profile:", error);
        // Fallback to default values if no stored data
        if (!storedUserData) {
          setCoachingName("Coaching Institute");
          setOwnerName("Owner Name")
          setTotalSeats(50);
        }
      });
  }, []);

  // Helper: fetch students and compose seats list without reloading the page
  const loadSeats = () => {
    if (totalSeats === 0) return; // Don't fetch if totalSeats not loaded yet

    const token = localStorage.getItem("token");
    return axios
      .get("/students", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const occupiedSeats = res.data;
        const tempSeats: Seat[] = [];

        for (let i = 1; i <= totalSeats; i++) {
          const student = occupiedSeats.find((s: any) => s.seatNumber === i);
          tempSeats.push({
            seatNumber: i,
            occupied: !!student,
            studentName: student?.name,
            studentId: student?._id,
            studentImage: student?.image ? (student.image.startsWith("/") ? `${ASSET_BASE_URL}${student.image}` : student.image) : undefined,
          });
        }
        setSeats(tempSeats);

        // Calculate available seats for the form
        const occupiedSeatNumbers = occupiedSeats.map((s: any) => s.seatNumber);
        const available = [];
        for (let i = 1; i <= totalSeats; i++) {
          if (!occupiedSeatNumbers.includes(i)) {
            available.push(i);
          }
        }
        setAvailableSeats(available);
      })
      .catch((error) => {
        console.error("Error fetching students:", error);
        // Create empty seats if students fetch fails
        const tempSeats: Seat[] = [];
        for (let i = 1; i <= totalSeats; i++) {
          tempSeats.push({
            seatNumber: i,
            occupied: false,
          });
        }
        setSeats(tempSeats);

        // If fetch fails, assume all seats are available
        const available = [];
        for (let i = 1; i <= totalSeats; i++) {
          available.push(i);
        }
        setAvailableSeats(available);
      });
  };

  // Fetch students and create seats based on user's seat count
  useEffect(() => {
    loadSeats();
  }, [totalSeats]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      const tablet = window.innerWidth > 768 && window.innerWidth <= 1200;
      setIsMobile(mobile);
      setIsTablet(tablet);
      if (!mobile) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSeatClick = (seat: Seat) => {
    if (seat.occupied && seat.studentId) {
      setSelectedStudentId(seat.studentId);
      setActivePage("studentProfile");
    } else {
      // Open add student form with pre-selected seat
      setSelectedSeatForForm(seat.seatNumber);
      setShowAddStudentForm(true);
      setActivePage("students"); // Switch to students page to show the form
    }
  };

  // Auto-scroll to the first highlighted seat
  useEffect(() => {
    if (highlightSeats.length > 0) {
      requestAnimationFrame(() => {
        const first = highlightSeats[0];
        const el = document.getElementById(`seat-${first}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        }
      });
    }
  }, [highlightSeats]);

  const handleSearchByName = (query: string) => {
    const q = query.trim().toLowerCase();
    if (!q) return;
    // Prefix match: names starting with the query
    const matches = seats.filter(s => s.occupied && (s.studentName || "").toLowerCase().startsWith(q));
    if (matches.length > 0) {
      setActivePage("dashboard");
      const seatNums = matches.map(m => m.seatNumber);
      setHighlightSeats(seatNums);
      setSearchResult({
        type: 'info',
        matches: matches.map(m => ({ seatNumber: m.seatNumber, studentName: m.studentName || 'Student' }))
      });
      // Auto-clear highlights after a while
      setTimeout(() => setHighlightSeats([]), 4000);
    } else {
      setSearchResult({ message: "No matching student found", type: 'error' });
    }
  };

  const renderActivePage = () => {
    switch (activePage) {
      case "dashboard":
        return (
          <div>
            <div style={{
              textAlign: "center",
              marginBottom: 30,
              padding: isMobile ? "20px 15px" : "25px 20px",
              background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 16px rgba(0,0,0,0.1)"
            }}>
              <h2 style={{ 
                margin: 0,
                color: "#1e293b",
                fontSize: isMobile ? "22px" : "28px",
                fontWeight: "700",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text"
              }}>
                Seat Management Dashboard
              </h2>
              <p style={{
                margin: "8px 0 0 0",
                color: "#64748b",
                fontSize: isMobile ? "14px" : "16px",
                fontWeight: "500"
              }}>
                {coachingName} • {totalSeats} Total Seats
              </p>
            </div>
            
            {/* Search result banner */}
            {searchResult && (
              <div style={{
                marginBottom: 16,
                padding: "12px 16px",
                borderRadius: 12,
                background: searchResult.type === 'info' 
                  ? "linear-gradient(135deg, #ecfccb 0%, #d9f99d 100%)"
                  : "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
                border: searchResult.type === 'info' ? "1px solid #bef264" : "1px solid #fca5a5",
                color: searchResult.type === 'info' ? "#166534" : "#991b1b",
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12
              }}>
                <div style={{ fontWeight: 600, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
                  {searchResult.matches && searchResult.matches.length > 0 ? (
                    <>
                      <span>Found {searchResult.matches.length} match(es):</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {searchResult.matches.map(m => (
                          <button
                            key={m.seatNumber}
                            onClick={() => {
                              const el = document.getElementById(`seat-${m.seatNumber}`);
                              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                              setHighlightSeats(prev => Array.from(new Set([...prev, m.seatNumber])));
                              // Keep highlights visible a bit longer on click
                              setTimeout(() => setHighlightSeats([]), 4000);
                            }}
                            style={{
                              background: 'rgba(34, 197, 94, 0.15)',
                              border: '1px solid #86efac',
                              color: '#166534',
                              padding: '4px 8px',
                              borderRadius: 999,
                              cursor: 'pointer',
                              fontWeight: 600
                            }}
                            aria-label={`Go to seat ${m.seatNumber}`}
                          >
                            {m.studentName} · Seat {m.seatNumber}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div>{searchResult.message}</div>
                  )}
                </div>
                <button
                  onClick={() => setSearchResult(null)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'inherit',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                  aria-label="Dismiss"
                >×</button>
              </div>
            )}

            {/* Seat Statistics */}
            <div style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
              padding: isMobile ? "20px 15px" : "25px 20px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: "16px",
              boxShadow: "0 8px 32px rgba(102, 126, 234, 0.3)",
              color: "white"
            }}>
              <div style={{ 
                textAlign: "center", 
                marginBottom: isMobile ? "15px" : "0",
                flex: 1
              }}>
                <div style={{ 
                  fontSize: isMobile ? "28px" : "32px", 
                  fontWeight: "bold", 
                  color: "#4ade80",
                  textShadow: "0 2px 4px rgba(0,0,0,0.3)"
                }}>
                  {seats.filter(seat => !seat.occupied).length}
                </div>
                <div style={{ 
                  fontSize: isMobile ? "14px" : "16px", 
                  color: "rgba(255,255,255,0.9)",
                  fontWeight: "500"
                }}>
                  Available Seats
                </div>
              </div>
              <div style={{ 
                textAlign: "center", 
                marginBottom: isMobile ? "15px" : "0",
                flex: 1
              }}>
                <div style={{ 
                  fontSize: isMobile ? "28px" : "32px", 
                  fontWeight: "bold", 
                  color: "#f87171",
                  textShadow: "0 2px 4px rgba(0,0,0,0.3)"
                }}>
                  {seats.filter(seat => seat.occupied).length}
                </div>
                <div style={{ 
                  fontSize: isMobile ? "14px" : "16px", 
                  color: "rgba(255,255,255,0.9)",
                  fontWeight: "500"
                }}>
                  Occupied Seats
                </div>
              </div>
              <div style={{ 
                textAlign: "center",
                flex: 1
              }}>
                <div style={{ 
                  fontSize: isMobile ? "28px" : "32px", 
                  fontWeight: "bold", 
                  color: "#60a5fa",
                  textShadow: "0 2px 4px rgba(0,0,0,0.3)"
                }}>
                  {totalSeats}
                </div>
                <div style={{ 
                  fontSize: isMobile ? "14px" : "16px", 
                  color: "rgba(255,255,255,0.9)",
                  fontWeight: "500"
                }}>
                  Total Capacity
                </div>
              </div>
            </div>
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: isMobile
                ? "repeat(2, 1fr)"
                : isTablet
                  ? "repeat(4, 1fr)"
                  : `repeat(${Math.min(6, Math.ceil(Math.sqrt(totalSeats * 1.2)))}, 1fr)`, 
              gap: isMobile ? "10px" : isTablet ? "12px" : "15px",
              maxWidth: "100%",
              justifyContent: "center",
              padding: isMobile ? "15px" : isTablet ? "20px" : "25px"
            }}>
              {seats.map((seat) => (
                <div key={seat.seatNumber} id={`seat-${seat.seatNumber}`}>
                  <SeatCard
                    seatNumber={seat.seatNumber}
                    occupied={seat.occupied}
                    studentName={seat.studentName}
                    studentId={seat.studentId}
                    studentImage={seat.studentImage}
                    isHighlighted={highlightSeats.includes(seat.seatNumber)}
                    onClick={() => handleSeatClick(seat)}
                    size={isMobile ? "mobile" : isTablet ? "tablet" : "desktop"}
                  />
                </div>
              ))}
            </div>
          </div>
        );

      case "students":
        return showAddStudentForm ? (
          <AddStudentForm 
            selectedSeatNumber={selectedSeatForForm || undefined}
            availableSeats={availableSeats}
            onSuccess={async () => {
              setShowAddStudentForm(false);
              setSelectedSeatForForm(null);
              // Refresh seats data without reloading page (prevents 404 on deep links)
              await loadSeats();
              setActivePage("dashboard");
            }}
            onCancel={() => {
              setShowAddStudentForm(false);
              setSelectedSeatForForm(null);
            }}
          />
        ) : (
          <StudentsPage 
            onAddStudent={() => setShowAddStudentForm(true)}
            onStudentClick={(studentId) => {
              setSelectedStudentId(studentId);
              setActivePage("studentProfile");
            }}
          />
        );

      case "studentProfile":
        return selectedStudentId ? (
          <StudentProfile 
            studentId={selectedStudentId}
            onBack={() => setActivePage("dashboard")}
          />
        ) : (
          <div>No student selected</div>
        );

      case "inquiries":
        return <Notifications />;

      case "analytics":
        return <Analytics />;


      case "expenses":
        return <Expenses />;

      case "settings":
        return <SettingsPage />;

      case "profile":
        return <ProfilePage />;

      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      height: "100vh",
      width: "100vw",
      margin: 0,
      padding: 0,
      overflow: "hidden",
      position: "absolute",
      top: 0,
      left: 0
    }}>
      <TopNav 
        coachingName={coachingName}
        ownerName ={ownerName} 
        onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMenuOpen={isMobileMenuOpen}
        onSearch={handleSearchByName}
      />
      
      <div style={{ 
        display: "flex", 
        flex: 1, 
        overflow: "hidden",
        height: "calc(100vh - 60px)", // Subtract TopNav height
        width: "100vw",
        margin: 0,
        padding: 0
      }}>
        <LeftNav 
          activePage={activePage} 
          setActivePage={setActivePage}
          isOpen={isMobile ? isMobileMenuOpen : true}
          onClose={() => setIsMobileMenuOpen(false)}
        />
        
        <div
          style={{
            flex: 1,
            height: "100%",
            width: isMobile ? "100vw" : "calc(100vw - 240px)", // Full width on mobile, subtract LeftNav width on desktop
            overflow: "auto", // Only allow scrolling in content area if needed
            padding: 0,
            margin: 0,
            background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
            transition: "width 0.3s ease",
            position: "relative",
            zIndex: 1, // Ensure content is above mobile menu overlay
          }}
        >
          <div style={{ 
            padding: isMobile ? "15px" : "20px", 
            height: "100%", 
            boxSizing: "border-box" 
          }}>
            <Suspense fallback={<div style={{ padding: 20 }}>Loading...</div>}>
              {renderActivePage()}
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}