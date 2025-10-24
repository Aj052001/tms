

import { useState, useEffect } from "react";

interface LeftNavProps {
  activePage: string;
  setActivePage: (
    page:
      | "dashboard"
      | "students"
      | "studentProfile"
      | "inquiries"
      | "analytics"
      | "expenses"
      | "settings"
      | "profile"
  ) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function LeftNav({ activePage, setActivePage, isOpen = true, onClose }: LeftNavProps) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    window.location.href = "/login";
  };

  const handleItemClick = (itemId: string) => {
    setActivePage(itemId as any);
    if (isMobile && onClose) {
      onClose();
    }
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "students", label: "Students", icon: "👥" },
    { id: "inquiries", label: "Notifications", icon: "🔔" },
    { id: "analytics", label: "Analytics", icon: "📈" },
    { id: "expenses", label: "Expenses", icon: "📄" },
    { id: "settings", label: "Settings", icon: "⚙️" },
    { id: "profile", label: "Profile", icon: "👤" },
  ];

  const getItemStyle = (itemId: string) => ({
    display: "flex",
    alignItems: "center",
    padding: "14px 18px",
    marginBottom: "6px",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    backgroundColor: activePage === itemId 
      ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
      : "transparent",
    color: activePage === itemId ? "#fff" : "#374151",
    fontWeight: activePage === itemId ? "600" : "500",
    border: activePage === itemId ? "none" : "1px solid transparent",
    boxShadow: activePage === itemId 
      ? "0 4px 12px rgba(102, 126, 234, 0.3)" 
      : "none",
    ":hover": {
      backgroundColor: activePage === itemId 
        ? "linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)" 
        : "#f1f5f9",
      transform: "translateX(4px)",
    }
  });

  const iconStyle = {
    marginRight: "10px",
    fontSize: "16px",
  };

  const containerStyle = {
    width: isMobile ? "220px" : "240px",
    background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
    height: isMobile ? "calc(100vh - 60px)" : "100%", // Subtract top navbar height on mobile
    padding: "16px",
    margin: 0,
    borderRight: isMobile ? "none" : "1px solid #e2e8f0",
    boxShadow: isMobile ? "4px 0 20px rgba(0,0,0,0.15)" : "2px 0 8px rgba(0,0,0,0.1)",
    overflow: "hidden",
    boxSizing: "border-box" as const,
    position: isMobile ? ("fixed" as const) : ("relative" as const),
    top: isMobile ? "60px" : "auto", // Position below top navbar (60px height)
    left: isMobile ? (isOpen ? "0" : "-220px") : "auto",
    zIndex: isMobile ? 999 : "auto", // Lower than top navbar
    transition: isMobile ? "left 0.3s ease" : "none",
  };

  const overlayStyle = {
    position: "fixed" as const,
    top: "60px", // Start below top navbar
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    zIndex: 998, // Lower than left nav but higher than content
    display: isMobile && isOpen ? "block" : "none",
    backdropFilter: "blur(2px)",
  };

  return (
    <>
      {isMobile && isOpen && (
        <div style={overlayStyle} onClick={onClose} />
      )}
      <div style={containerStyle}>
    
      {menuItems.map((item) => (
        <div
          key={item.id}
          style={getItemStyle(item.id)}
          onClick={() => handleItemClick(item.id)}
          onMouseEnter={(e) => {
            if (activePage !== item.id) {
              e.currentTarget.style.backgroundColor = "#f1f5f9";
              e.currentTarget.style.transform = "translateX(4px)";
              e.currentTarget.style.color = "#374151";
            }
          }}
          onMouseLeave={(e) => {
            if (activePage !== item.id) {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.transform = "translateX(0)";
              e.currentTarget.style.color = "#374151";
            }
          }}
        >
          <span style={iconStyle}>{item.icon}</span>
          {item.label}
        </div>
      ))}

      <div
        style={{
          marginTop: "50px",
          padding: "14px 18px",
          borderRadius: "12px",
          cursor: "pointer",
          background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
          color: "#fff",
          textAlign: "center",
          fontWeight: "600",
          transition: "all 0.3s ease",
          boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
          border: "none",
        }}
        onClick={handleLogout}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)";
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 6px 16px rgba(239, 68, 68, 0.4)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)";
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(239, 68, 68, 0.3)";
        }}
      >
        
        Logout
      </div>
      </div>
    </>
  );
}