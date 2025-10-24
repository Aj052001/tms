import { useState, useEffect } from "react";
import axios from "../api/axios";

interface Expense {
  _id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
}

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isSmallMobile, setIsSmallMobile] = useState(window.innerWidth <= 480);
  const [form, setForm] = useState({
    description: "",
    amount: "",
    date: new Date().toISOString().split('T')[0],
    category: "General"
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(isMobile);
      setIsSmallMobile(isSmallMobile);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchExpenses = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/expenses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExpenses(res.data);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      setExpenses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem("token");
      await axios.post("/expenses", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setForm({ description: "", amount: "", date: new Date().toISOString().split('T')[0], category: "General" });
      setShowAddForm(false);
      fetchExpenses();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to add expense");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteExpense = async (expenseId: string, description: string) => {
    if (window.confirm(`Are you sure you want to delete "${description}"?`)) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`/expenses/${expenseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      
        fetchExpenses();
      } catch (error: any) {
        alert(error.response?.data?.message || "Failed to delete expense");
      }
    }
  };

  const getTotalExpenses = () => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getExpensesByCategory = () => {
    const categories: { [key: string]: number } = {};
    expenses.forEach(expense => {
      categories[expense.category] = (categories[expense.category] || 0) + expense.amount;
    });
    return categories;
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: "1200px",
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
            📄 Expenses Management
          </h2>
          
          <button
            style={{
              ...buttonStyle,
              width: isMobile ? "100%" : "auto"
            }}
            onClick={() => setShowAddForm(true)}
          >
            ➕ Add Expense
          </button>
        </div>

        {/* Summary Cards */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: isMobile 
            ? "1fr" 
            : "repeat(auto-fit, minmax(200px, 1fr))", 
          gap: "20px", 
          marginBottom: "30px" 
        }}>
          <div style={{
            background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
            borderRadius: "12px",
            padding: "20px",
            color: "white",
            textAlign: "center"
          }}>
            <h3 style={{ margin: "0 0 10px 0", fontSize: "14px", opacity: 0.9 }}>Total Expenses</h3>
            <p style={{ margin: 0, fontSize: "28px", fontWeight: "bold" }}>₹{getTotalExpenses().toLocaleString()}</p>
          </div>
          
          <div style={{
            background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
            borderRadius: "12px",
            padding: "20px",
            color: "white",
            textAlign: "center"
          }}>
            <h3 style={{ margin: "0 0 10px 0", fontSize: "14px", opacity: 0.9 }}>Total Records</h3>
            <p style={{ margin: 0, fontSize: "28px", fontWeight: "bold" }}>{expenses.length}</p>
          </div>
        </div>

        {/* Category Breakdown */}
        {Object.keys(getExpensesByCategory()).length > 0 && (
          <div style={{ marginBottom: "30px" }}>
            <h3 style={{ margin: "0 0 20px 0", color: "#1e293b", fontSize: "20px" }}>
              📊 Expenses by Category
            </h3>
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: isMobile 
                ? "1fr" 
                : window.innerWidth <= 1024 
                  ? "repeat(auto-fit, minmax(200px, 1fr))" 
                  : "repeat(auto-fit, minmax(150px, 1fr))", 
              gap: "15px" 
            }}>
              {Object.entries(getExpensesByCategory()).map(([category, amount]) => (
                <div key={category} style={{
                  background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                  borderRadius: "12px",
                  padding: "15px",
                  border: "1px solid #bae6fd",
                  textAlign: "center"
                }}>
                  <h4 style={{ margin: "0 0 8px 0", color: "#1e293b", fontSize: "16px" }}>{category}</h4>
                  <p style={{ margin: 0, color: "#059669", fontSize: "18px", fontWeight: "600" }}>
                    ₹{amount.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expenses List */}
        <div>
          <h3 style={{ margin: "0 0 20px 0", color: "#1e293b", fontSize: "20px" }}>
            📋 Recent Expenses
          </h3>
          
          {isLoading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
              <div style={{ fontSize: "48px", marginBottom: "20px" }}>⏳</div>
              <h3 style={{ margin: "0 0 10px 0", color: "#1e293b" }}>Loading...</h3>
              <p style={{ margin: 0 }}>Fetching expenses...</p>
            </div>
          ) : expenses.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
              <p>No expenses recorded yet.</p>
              <p>Click "Add Expense" to start tracking your expenses.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {expenses.map((expense) => (
                <div
                  key={expense._id}
                  style={{
                    padding: "20px",
                    background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                    borderRadius: "12px",
                    border: "1px solid #f59e0b",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: isMobile ? "flex-start" : "center",
                    flexDirection: isMobile ? "column" : "row",
                    gap: isMobile ? "15px" : "0"
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h4 style={{ 
                      margin: "0 0 8px 0", 
                      color: "#1e293b", 
                      fontSize: isMobile ? "16px" : "18px" 
                    }}>
                      {expense.description}
                    </h4>
                    <div style={{ 
                      display: "flex", 
                      gap: "20px", 
                      fontSize: "14px", 
                      color: "#6b7280",
                      flexDirection: isSmallMobile ? "column" : "row",
                      flexWrap: "wrap"
                    }}>
                      <span>Category: {expense.category}</span>
                      <span>Date: {new Date(expense.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "15px",
                    flexDirection: isMobile ? "row" : "row",
                    justifyContent: isMobile ? "space-between" : "flex-end",
                    width: isMobile ? "100%" : "auto"
                  }}>
                    <div style={{ textAlign: isMobile ? "left" : "right" }}>
                      <p style={{ 
                        margin: "0 0 5px 0", 
                        color: "#dc2626", 
                        fontSize: isMobile ? "18px" : "20px", 
                        fontWeight: "600" 
                      }}>
                        ₹{expense.amount.toLocaleString()}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => handleDeleteExpense(expense._id, expense.description)}
                      style={{
                        padding: "8px 12px",
                        background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                        border: "none",
                        borderRadius: "8px",
                        color: "white",
                        fontSize: "14px",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        minWidth: isMobile ? "80px" : "auto"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.05)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Expense Form Modal */}
      {showAddForm && (
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
            padding: isMobile ? "20px" : "30px",
            maxWidth: "500px",
            width: "90%",
            maxHeight: "90vh",
            overflow: "auto",
            margin: isMobile ? "10px" : "0"
          }}>
            <h3 style={{ margin: "0 0 20px 0", color: "#1e293b" }}>Add New Expense</h3>
            
            <form onSubmit={handleSubmit}>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151" }}>
                  Description *
                </label>
                <input
                  type="text"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                  placeholder="Enter expense description"
                />
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151" }}>
                  Amount *
                </label>
                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                  placeholder="Enter amount"
                />
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151" }}>
                  Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                />
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151" }}>
                  Category *
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                >
                  <option value="General">General</option>
                  <option value="Rent">Rent</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Supplies">Supplies</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div style={{ 
                display: "flex", 
                gap: "10px", 
                marginTop: "20px",
                flexDirection: isSmallMobile ? "column" : "row"
              }}>
                <button
                  type="submit"
                  style={{
                    ...buttonStyle,
                    width: isSmallMobile ? "100%" : "auto",
                    flex: isSmallMobile ? "none" : "1"
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? "Adding..." : "Add Expense"}
                </button>
                
                <button
                  type="button"
                  style={{ 
                    ...buttonStyle, 
                    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                    width: isSmallMobile ? "100%" : "auto",
                    flex: isSmallMobile ? "none" : "1"
                  }}
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}