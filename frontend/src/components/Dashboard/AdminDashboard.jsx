import React, { useEffect, useState } from "react";
import BookList from "../Book/BookList";
import BookForm from "../Book/BookForm";
import CategoryList from "../Category/CategoryList";
import ReportList from "../Report/ReportList";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [reportType, setReportType] = useState("");
  const [category, setCategory] = useState({
    categoryName: "",
    description: "",
  });
  const [message, setMessage] = useState("");

  // Global data
  const [transactions, setTransactions] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [fines, setFines] = useState([]);
  const [payments, setPayments] = useState([]);

  const refreshData = () => window.location.reload();

  useEffect(() => {
    if (user?.role === "Admin") {
      fetchAllData();
    }
  }, [user]);

  const fetchAllData = async () => {
    try {
      const [usersRes, txnsRes, resvRes, finesRes, paymentsRes] =
        await Promise.all([
          api.get("/users"),
          api.get("/transactions"),
          api.get("/reservations"),
          api.get("/fines"),
          api.get("/payments"),
        ]);

      setUsers(usersRes.data.users || []);
      setTransactions(txnsRes.data.transactions || []);
      setReservations(resvRes.data.reservations || []);
      setFines(finesRes.data.fines || []);
      setPayments(paymentsRes.data.payments || []);
    } catch (err) {
      console.error("Failed to fetch admin data:", err);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await api.delete(`/users/${userId}`);
      setUsers(users.filter((u) => u.UserID !== userId));
    } catch (err) {
      console.error(err);
      alert("Failed to delete user.");
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/categories", category);
      setMessage("Category added");
      setCategory({ categoryName: "", description: "" });
    } catch {
      setMessage("Failed to add category");
    }
  };

  const handleGenerateReport = async () => {
    try {
      await api.post("/reports", { reportType });
      setMessage("Report generated");
    } catch {
      setMessage("Failed to generate report");
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm("Delete this book?")) return;
    try {
      await api.delete(`/books/${bookId}`);
      setMessage("Book deleted");
      refreshData();
    } catch {
      alert("Failed to delete book");
    }
  };

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard - {user.name}</h1>
      {message && <p className="status-msg">{message}</p>}

      <h2>Manage Books</h2>
      <BookForm onBookAdded={refreshData} />
      <BookList />
      <div className="book-delete-control">
        <input
          type="number"
          placeholder="Enter Book ID to delete"
          id="delete-book-id"
        />
        <button
          onClick={() => {
            const bookId = document.getElementById("delete-book-id").value;
            if (bookId) handleDeleteBook(bookId);
          }}
        >
          Delete Book by ID
        </button>
      </div>

      <h2>Manage Categories</h2>
      <form onSubmit={handleCategorySubmit}>
        <input
          type="text"
          placeholder="Category Name"
          value={category.categoryName}
          onChange={(e) =>
            setCategory({ ...category, categoryName: e.target.value })
          }
          required
        />
        <input
          type="text"
          placeholder="Description"
          value={category.description}
          onChange={(e) =>
            setCategory({ ...category, description: e.target.value })
          }
        />
        <button type="submit">Add Category</button>
      </form>
      <CategoryList />

      <h2>All Book Loans</h2>
      <ul>
        {transactions.map((txn) => (
          <li key={txn.TransactionID}>
            User {txn.UserID} - {txn.BookTitle} ({txn.Status}) - Due:{" "}
            {new Date(txn.DueDate).toLocaleDateString()}
          </li>
        ))}
      </ul>

      <h2>All Reservations</h2>
      <ul>
        {reservations.map((resv) => (
          <li key={resv.ReservationID}>
            User {resv.UserID} reserved Book {resv.BookID} on{" "}
            {new Date(resv.ReservedAt).toLocaleDateString()}
          </li>
        ))}
      </ul>

      <h2>All Fines</h2>
      <ul>
        {fines.map((fine) => (
          <li key={fine.FineID}>
            User {fine.UserID} - {fine.BookTitle} - ${fine.Amount} - Status:{" "}
            {fine.Status}
          </li>
        ))}
      </ul>

      <h2>All Payments</h2>
      <ul>
        {payments.map((pay) => (
          <li key={pay.PaymentID}>
            User {pay.UserID} - ${pay.AmountPaid} via {pay.PaymentMethod} on{" "}
            {new Date(pay.PaymentDate).toLocaleDateString()}
          </li>
        ))}
      </ul>

      <h2>Generate Reports</h2>
      <div>
        <select
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
        >
          <option value="">Select Report</option>
          <option value="Book Inventory">Book Inventory</option>
        </select>
        <button onClick={handleGenerateReport}>Generate</button>
      </div>
      <ReportList />

      <h2>User Management</h2>
      <ul>
        {users.map((u) => (
          <li key={u.UserID}>
            {u.UserID} - {u.Name} - {u.Email} ({u.Role})
            <button onClick={() => handleDeleteUser(u.UserID)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminDashboard;
