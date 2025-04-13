import React, { useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function BorrowForm({ onBookBorrowed }) {
  const [bookId, setBookId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      // Create a due date 14 days from now
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);

      // Include dueDate in the request (required by your API)
      // userId is not needed as the API will get it from the token
      await api.post("/transactions/borrow", {
        bookId: parseInt(bookId),
        dueDate: dueDate.toISOString(),
      });

      setBookId("");
      setSuccess("Book borrowed successfully!");
      if (onBookBorrowed) onBookBorrowed();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to borrow book");
    }
  };

  return (
    <div className="borrow-form">
      <h3>Borrow a Book</h3>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          value={bookId}
          onChange={(e) => setBookId(e.target.value)}
          placeholder="Book ID"
          required
        />
        <button type="submit">Borrow</button>
      </form>
    </div>
  );
}

export default BorrowForm;
