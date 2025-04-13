import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Home() {
  const { user } = useAuth();

  return (
    <div className="home">
      <h1>Library Management System</h1>
      <p>Welcome to the library! Browse books or manage your account.</p>
      {user ? (
        <div>
          <p>Hello, {user.name} ({user.role})</p>
          <Link to={`/dashboard/${user.role.toLowerCase()}`}>Go to Dashboard</Link>
        </div>
      ) : (
        <div>
          <Link to="/login">Login</Link> | <Link to="/register">Register</Link>
        </div>
      )}
      <Link to="/books">Browse Books</Link>
    </div>
  );
}

export default Home;