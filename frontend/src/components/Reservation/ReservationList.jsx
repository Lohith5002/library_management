import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function ReservationList({ onAction }) {
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchReservations();
  }, [user]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/reservations/user/${user.id}`);

      if (response.data && response.data.reservations) {
        setReservations(response.data.reservations);

        // Update reservation count in the dashboard (local update)
        const activeReservationsEl = document.getElementById(
          "active-reservations"
        );
        if (activeReservationsEl) {
          const pendingReservations = response.data.reservations.filter(
            (r) => r.Status === "Pending"
          ).length;
          activeReservationsEl.textContent = pendingReservations;
        }
      } else {
        setReservations([]);
      }
    } catch (err) {
      console.error("Reservation fetch error:", err);
      setError(err.response?.data?.message || "Failed to fetch reservations");
    } finally {
      setLoading(false);
    }
  };

  const cancelReservation = async (id) => {
    try {
      await api.put(`/reservations/${id}/cancel`);
      setSuccess("Reservation cancelled successfully!");
      fetchReservations();
      if (onAction) onAction(); // Trigger parent component to refresh stats
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel reservation");
    }
  };

  return (
    <div className="reservation-list">
      <h2>Your Reservations</h2>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      {loading ? (
        <p>Loading reservations...</p>
      ) : reservations.length === 0 ? (
        <p>You don't have any reservations.</p>
      ) : (
        <ul className="reservation-items">
          {reservations.map((reservation) => (
            <li key={reservation.ReservationID} className="reservation-item">
              <div>
                <strong>{reservation.BookTitle}</strong>
                <p>
                  Reserved:{" "}
                  {new Date(reservation.ReservationDate).toLocaleDateString()}
                </p>
                <p>
                  Expires:{" "}
                  {new Date(reservation.ExpiryDate).toLocaleDateString()}
                </p>
                <p>Status: {reservation.Status}</p>
              </div>
              {reservation.Status === "Pending" && (
                <button
                  onClick={() => cancelReservation(reservation.ReservationID)}
                >
                  Cancel
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ReservationList;
