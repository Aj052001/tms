import { useState, useEffect } from "react";
import axios from "../api/axios";

interface FeeData {
  month: string;
  amount: number;
}

interface ExpenseData {
  month: string;
  amount: number;
}

export default function Analytics() {
  const [feeData, setFeeData] = useState<FeeData[]>([]);
  const [expenseData, setExpenseData] = useState<ExpenseData[]>([]);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");

      const [studentsRes, expensesRes] = await Promise.all([
        axios.get("/students", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("/expenses", {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);

      const monthlyFees: { [key: string]: number } = {};
      studentsRes.data.forEach((student: any) => {
        if (student.fees && Array.isArray(student.fees)) {
          student.fees.forEach((fee: any) => {
            const date = new Date(fee.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthlyFees[monthKey] = (monthlyFees[monthKey] || 0) + fee.amount;
          });
        }
      });

      const monthlyExpenses: { [key: string]: number } = {};
      expensesRes.data.forEach((expense: any) => {
        const date = new Date(expense.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyExpenses[monthKey] = (monthlyExpenses[monthKey] || 0) + expense.amount;
      });

      // Month labels only from DB
      const allMonths = Array.from(new Set([...Object.keys(monthlyFees), ...Object.keys(monthlyExpenses)])).sort();
      setAvailableMonths(allMonths);
      if (allMonths.length > 0 && !selectedMonth) {
        setSelectedMonth(allMonths[allMonths.length - 1]); // latest month by default
      }

      const feeDataArray = Object.entries(monthlyFees).map(([month, amount]) => ({
        month,
        amount
      }));

      const expenseDataArray = Object.entries(monthlyExpenses).map(([month, amount]) => ({
        month,
        amount
      }));

      setFeeData(feeDataArray);
      setExpenseData(expenseDataArray);

    } catch (err) {
      console.error("Error fetching analytics data:", err);
      setFeeData([]);
      setExpenseData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectedMonthData = () => {
    const fee = feeData.find(f => f.month === selectedMonth)?.amount || 0;
    const expense = expenseData.find(e => e.month === selectedMonth)?.amount || 0;
    return { fee, expense, profit: fee - expense };
  };

  const { fee, expense, profit } = getSelectedMonthData();

  const getProfitPercentage = () => {
    if (fee === 0) return 0;
    return ((profit / fee) * 100).toFixed(1);
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "20px",
  };

  const cardStyle: React.CSSProperties = {
    background: "white",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
    border: "1px solid #e2e8f0",
    marginBottom: "20px",
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2>📊 Monthly Analytics</h2>

        {/* Month Selector */}
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          style={{ padding: "8px 16px", borderRadius: "8px", marginBottom: "20px" }}
        >
          {availableMonths.map((m) => (
            <option key={m} value={m}>
              {new Date(m + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </option>
          ))}
        </select>

        {/* Stats */}
        <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
          <div style={{ flex: 1, textAlign: "center" }}>
            <h4>Total Fees</h4>
            <p>₹{fee.toLocaleString()}</p>
          </div>
          <div style={{ flex: 1, textAlign: "center" }}>
            <h4>Total Expenses</h4>
            <p>₹{expense.toLocaleString()}</p>
          </div>
          <div style={{ flex: 1, textAlign: "center" }}>
            <h4>{profit >= 0 ? "Net Profit" : "Net Loss"}</h4>
            <p style={{ color: profit >= 0 ? "green" : "red" }}>
              ₹{Math.abs(profit).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Profit % Graph */}
        <div>
          <h4>📈 Profit/Loss Percentage</h4>
          <div style={{
            background: "#f3f4f6",
            borderRadius: "8px",
            height: "30px",
            position: "relative",
            overflow: "hidden"
          }}>
            <div
              style={{
                height: "100%",
                width: `${Math.min(Math.abs(Number(getProfitPercentage())), 100)}%`,
                background: profit >= 0 ? "#10b981" : "#ef4444",
                transition: "width 0.3s ease"
              }}
            />
          </div>
          <p style={{ marginTop: "10px", fontWeight: "600" }}>
            {profit >= 0 ? "Profit" : "Loss"}: {getProfitPercentage()}%
          </p>
        </div>
      </div>
    </div>
  );
}

