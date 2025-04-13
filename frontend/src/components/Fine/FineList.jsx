import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function FineList({ onAction }) {
  const [fines, setFines] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchFines();
  }, [user]);

  const fetchFines = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/fines/user/${user.id}`);

      if (response.data && response.data.fines) {
        setFines(response.data.fines);

        // Update unpaid fines amount in dashboard (local update)
        const unpaidFinesEl = document.getElementById("unpaid-fines");
        if (unpaidFinesEl) {
          const unpaidAmount = response.data.fines
            .filter((f) => f.Status === "Unpaid")
            .reduce((total, fine) => total + parseFloat(fine.Amount || 0), 0);
          unpaidFinesEl.textContent = `$${unpaidAmount.toFixed(2)}`;
        }
      } else {
        setFines([]);
      }
    } catch (err) {
      console.error("Fines fetch error:", err);
      setError(err.response?.data?.message || "Failed to fetch fines");
    } finally {
      setLoading(false);
    }
  };

  const payFine = async (fineId, amount) => {
    try {
      await api.post(`/fines/${fineId}/pay`, {
        paymentMethod: "Cash",
        amountPaid: amount,
      });

      setSuccess("Fine paid successfully!");
      fetchFines();
      if (onAction) onAction(); // Trigger parent component to refresh stats
    } catch (err) {
      setError(err.response?.data?.message || "Failed to pay fine");
    }
  };

  return (
    <div className="fine-list">
      <h2>Your Fines</h2>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      {loading ? (
        <p>Loading fines...</p>
      ) : fines.length === 0 ? (
        <p>You don't have any fines.</p>
      ) : (
        <ul className="fine-items">
          {fines.map((fine) => (
            <li key={fine.FineID} className="fine-item">
              <div>
                <strong>{fine.BookTitle || "Book"}</strong>
                <p>Amount: ${parseFloat(fine.Amount).toFixed(2)}</p>
                <p>Status: {fine.Status}</p>
                {fine.Reason && <p>Reason: {fine.Reason}</p>}
              </div>
              {fine.Status === "Unpaid" && (
                <button onClick={() => payFine(fine.FineID, fine.Amount)}>
                  Pay
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default FineList;
