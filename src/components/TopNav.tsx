
import { useState, useEffect } from "react";

interface Props {
  coachingName: string;
  ownerName:string,
  onMenuToggle?: () => void;
  isMenuOpen?: boolean;
  onSearch?: (query: string) => void;
}

export default function TopNav({ coachingName,ownerName, onMenuToggle, isMenuOpen, onSearch }: Props) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isSmallMobile, setIsSmallMobile] = useState(window.innerWidth <= 480);

  // Check screen size on resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsSmallMobile(window.innerWidth <= 480);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const hamburgerStyle = {
    display: isMobile ? "flex" : "none",
    flexDirection: "column" as const,
    cursor: "pointer",
    padding: "8px",
    borderRadius: "4px",
    transition: "background-color 0.3s ease",
  };

  const hamburgerLineStyle = {
    width: "25px",
    height: "3px",
    backgroundColor: "#333",
    margin: "3px 0",
    transition: "0.3s",
    transform: isMenuOpen ? "rotate(45deg) translate(5px, 5px)" : "none",
  };

  const hamburgerLine2Style = {
    width: "25px",
    height: "3px",
    backgroundColor: "#333",
    margin: "3px 0",
    transition: "0.3s",
    opacity: isMenuOpen ? 0 : 1,
  };

  const hamburgerLine3Style = {
    width: "25px",
    height: "3px",
    backgroundColor: "#333",
    margin: "3px 0",
    transition: "0.3s",
    transform: isMenuOpen ? "rotate(-45deg) translate(7px, -6px)" : "none",
  };

  const [search, setSearch] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) onSearch(search);
  };

  return (
    <div style={{
      display: "flex", 
      justifyContent: "space-between",
      alignItems: "center", 
      padding: "10px 12px", 
      background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
      position: "relative",
      zIndex: 1001,
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      borderBottom: "1px solid #e2e8f0"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div 
          style={hamburgerStyle}
          onClick={onMenuToggle}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#ddd";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <div style={hamburgerLineStyle}></div>
          <div style={hamburgerLine2Style}></div>
          <div style={hamburgerLine3Style}></div>
        </div>
        <h2 style={{ margin: 0, fontSize: isMobile ? "18px" : "24px" }}>{coachingName}</h2>
      </div>
      
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <form onSubmit={handleSearchSubmit} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <input 
            type="text" 
            placeholder="Search student..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: isSmallMobile ? "6px 10px" : "8px 12px",
              borderRadius: "20px",
              border: "1px solid #cbd5e1",
              outline: "none",
              width: isSmallMobile ? "120px" : (isMobile ? "160px" : "240px")
            }}
          />
          <button type="submit" style={{
            padding: isSmallMobile ? "6px 10px" : "8px 12px",
            borderRadius: "20px",
            border: "none",
            background: "#3b82f6",
            color: "white",
            cursor: "pointer",
            fontSize: isSmallMobile ? "12px" : "14px"
          }}>Search</button>
        </form>
{
  !isSmallMobile &&  <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: isSmallMobile ? "6px" : "10px",
          padding: isSmallMobile ? "6px 10px" : "8px 16px",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: "25px",
          color: "white",
          fontSize: isSmallMobile ? "12px" : (isMobile ? "14px" : "16px"),
          fontWeight: "500",
        }}>
          <div style={{
            width: isSmallMobile ? "24px" : "32px",
            height: isSmallMobile ? "24px" : "32px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: isSmallMobile ? "14px" : "16px"
          }}>
            👤
          </div>
          {!isSmallMobile && <span>{ownerName}</span>}
        </div>
}
       
      </div>
    </div>
  );
}
