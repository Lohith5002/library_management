import React from "react";
import { Navigate } from "react-router-dom"; // Only need Navigate
import { useAuth } from "../context/AuthContext.jsx";

function ProtectedRoute({ children, roles }) {
  const { user, token } = useAuth();

  if (!token || (roles && !roles.includes(user?.role))) {
    return <Navigate to="/login" />;
  }

  return children; // Render children if authorized
}

export default ProtectedRoute;
