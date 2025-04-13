import React, { useState } from "react";
import api from "../../services/api";

function ReservationForm({ onReservationAdded }) {
  const [bookId, setBookId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      // No need to send userId - the API will get it from the token
      await api.post("/reservations", {
        bookId: parseInt(bookId),
      });
      setBookId("");
      setSuccess("Book reserved successfully!");

      if (onReservationAdded) {
        onReservationAdded();
      }
    } catch (err) {
      console.error("Reservation error:", err);
      setError(err.response?.data?.message || "Failed to reserve book");
    }
  };

  return (
    <div className="reservation-form">
      <h3>Reserve a Book</h3>
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
        <button type="submit">Reserve</button>
      </form>
    </div>
  );
}

export default ReservationForm;
