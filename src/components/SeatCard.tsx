import React from "react";


interface SeatCardProps {
  seatNumber: number;
  occupied: boolean;
  studentName?: string;
  studentId?: string;
  studentImage?: string;
  isHighlighted?: boolean;
  onClick?: () => void;
  size?: "mobile" | "tablet" | "desktop";
}

export default function SeatCard({
  seatNumber,
  occupied,
  studentName,
  studentImage,
  isHighlighted,
  onClick,
  size = "desktop",
}: SeatCardProps) {
  // Scale dimensions based on viewport size
  const heightPx = size === "mobile" ? 90 : size === "tablet" ? 130 : 110;
  const scale = heightPx / 100; // base size = 100

  const cardStyle: React.CSSProperties = {
    width: "100%",
    minWidth: "90px",
    height: `${heightPx}px`,
    border: isHighlighted ? "3px solid #f59e0b" : occupied ? "2px solid #dc3545" : "2px solid #28a745",
    borderRadius: "16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    margin: "6px",
    backgroundColor: occupied ? "#fff5f5" : "#f0fff4",
    cursor: "pointer",
    fontSize: `${Math.round(16 * scale)}px`,
    textAlign: "center",
    fontWeight: "600",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    position: "relative",
    overflow: "hidden",
    background: occupied 
      ? "linear-gradient(135deg, #fff5f5 0%, #ffe6e6 100%)" 
      : "linear-gradient(135deg, #f0fff4 0%, #e6ffe6 100%)",
  };

  const hoverStyle: React.CSSProperties = occupied
    ? {
        transform: "scale(1.05)",
        boxShadow: "0 8px 16px rgba(220, 53, 69, 0.3)",
        background: "linear-gradient(135deg, #ffd6d6 0%, #ffb3b3 100%)",
      }
    : {
        transform: "scale(1.02)",
        boxShadow: "0 6px 12px rgba(40, 167, 69, 0.2)",
        background: "linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)",
      };

  const [isHovered, setIsHovered] = React.useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const finalStyle = isHovered ? { ...cardStyle, ...hoverStyle } : cardStyle;

  return (
    <div
      style={finalStyle}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      title={
        occupied
          ? `Seat ${seatNumber} - ${studentName || "Occupied"} (Click to view profile)`
          : `Seat ${seatNumber} - Available`
      }
    >
      <div
        style={{
          fontSize: `${Math.round(20 * scale)}px`,
          fontWeight: "bold",
          color: occupied ? "#dc3545" : "#28a745",
          textShadow: "0 1px 2px rgba(0,0,0,0.1)",
        }}
      >
        {seatNumber}
      </div>
      
      {occupied && studentImage && (
        <div
          style={{
            width: `${Math.round(30 * scale)}px`,
            height: `${Math.round(30 * scale)}px`,
            borderRadius: "50%",
            backgroundImage: `url(${studentImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            marginTop: "4px",
            border: "2px solid white",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          }}
        />
      )}
      
      {occupied && (
        <div
          style={{
            fontSize: `${Math.round(11 * scale)}px`,
            color: "#666",
            marginTop: "4px",
            maxWidth: `${Math.round(80 * scale)}px`,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontWeight: "500",
          }}
        >
          {studentName ? studentName.substring(0, 12) : "Student"}
        </div>
      )}

      {occupied && (
        <div
          style={{
            position: "absolute",
            top: "6px",
            right: "6px",
            width: `${Math.round(10 * scale)}px`,
            height: `${Math.round(10 * scale)}px`,
            borderRadius: "50%",
            backgroundColor: "#dc3545",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          }}
        />
      )}

      {/* Add a subtle pattern overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: occupied 
            ? "radial-gradient(circle at 20% 20%, rgba(220, 53, 69, 0.1) 0%, transparent 50%)"
            : "radial-gradient(circle at 20% 20%, rgba(40, 167, 69, 0.1) 0%, transparent 50%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}