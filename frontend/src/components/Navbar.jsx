import React from "react";
import { Link, useNavigate } from "react-router-dom"; // Replace useHistory with useNavigate
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate(); // Use useNavigate instead of useHistory

  const handleLogout = () => {
    signOut();
    navigate("/login"); // Use navigate as a function
  };

  return (
    <nav className="navbar">
      <Link to="/">Home</Link>
      <Link to="/books">Books</Link>
      {user ? (
        <>
          <Link to={`/dashboard/${user.role.toLowerCase()}`}>Dashboard</Link>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      )}
    </nav>
  );
}

export default Navbar;
