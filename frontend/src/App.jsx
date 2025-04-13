import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // Use Routes instead of Switch
import { AuthProvider } from "./context/AuthContext.jsx";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Books from "./pages/Books.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import UserDashboard from "./components/Dashboard/UserDashboard.jsx";
import LibrarianDashboard from "./components/Dashboard/LibrarianDashboard.jsx";
import AdminDashboard from "./components/Dashboard/AdminDashboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          {" "}
          {/* Replace Switch with Routes */}
          <Route exact path="/" element={<Home />} />{" "}
          {/* Use element instead of component */}
          <Route path="/books" element={<Books />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/dashboard/student"
            element={
              <ProtectedRoute roles={["Student"]}>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/librarian"
            element={
              <ProtectedRoute roles={["Librarian"]}>
                <LibrarianDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute roles={["Admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
