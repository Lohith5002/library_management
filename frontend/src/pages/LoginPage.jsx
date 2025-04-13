import React from "react";
import Login from "../components/Auth/Login";
import { useNavigate } from "react-router-dom"; // Replace useHistory with useNavigate
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const navigate = useNavigate(); // Use useNavigate
  const { user } = useAuth();

  const handleLogin = () => {
    navigate(`/dashboard/${user.role.toLowerCase()}`); // Use navigate
  };

  return (
    <div className="login-page">
      <h2>Login</h2>
      <Login onLogin={handleLogin} />
    </div>
  );
}

export default LoginPage;
