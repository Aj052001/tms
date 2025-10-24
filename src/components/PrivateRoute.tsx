import type { JSX } from "react";
import { Navigate, useLocation } from "react-router-dom";

interface Props { children: JSX.Element }

export default function PrivateRoute({ children }: Props) {
  const token = localStorage.getItem("token");
  const location = useLocation();
  
  // If no token, redirect to login with replace to prevent back navigation
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
}
