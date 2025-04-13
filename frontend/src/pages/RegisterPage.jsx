import React from "react";
import Register from "../components/Auth/Register";
import { useNavigate } from "react-router-dom"; // Replace useHistory with useNavigate
import { useAuth } from "../context/AuthContext";

function RegisterPage() {
  const navigate = useNavigate(); // Use useNavigate
  const { signIn } = useAuth();

  const handleRegister = async () => {
    navigate("/login"); // Use navigate
  };

  return (
    <div className="register-page">
      <h2>Register</h2>
      <Register onRegister={handleRegister} />
    </div>
  );
}

export default RegisterPage;
