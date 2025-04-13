import React, { useState, useEffect } from "react";
import BookList from "../Book/BookList";
import TransactionList from "../Transaction/TransactionList";
import BorrowForm from "../Transaction/BorrowForm";
import ReservationList from "../Reservation/ReservationList";
import ReservationForm from "../Reservation/ReservationForm";
import FineList from "../Fine/FineList";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

function UserDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("books");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [stats, setStats] = useState({
    activeLoans: "Loading...",
    reservations: "Loading...",
    unpaidFines: "Loading...",
  });

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // Fetch all user stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch transactions for active loans count
        const transactionsRes = await api.get("/transactions/my/transactions");
        const activeLoans = (transactionsRes.data.transactions || []).filter(
          (t) => t.Status === "Borrowed"
        ).length;

        // Fetch reservations
        const reservationsRes = await api.get(`/reservations/user/${user.id}`);
        const reservations = (reservationsRes.data.reservations || []).filter(
          (r) => r.Status === "Pending"
        ).length;

        // Fetch unpaid fines
        const finesRes = await api.get(`/fines/user/${user.id}`);
        const unpaidFines = (finesRes.data.fines || [])
          .filter((f) => f.Status === "Unpaid")
          .reduce((total, fine) => total + parseFloat(fine.Amount), 0)
          .toFixed(2);

        setStats({
          activeLoans,
          reservations,
          unpaidFines: `$${unpaidFines}`,
        });

        // Also update DOM elements (as your other components expect this)
        const activeLoansEl = document.getElementById("active-loans");
        if (activeLoansEl) activeLoansEl.textContent = activeLoans;

        const activeReservationsEl = document.getElementById(
          "active-reservations"
        );
        if (activeReservationsEl)
          activeReservationsEl.textContent = reservations;

        const unpaidFinesEl = document.getElementById("unpaid-fines");
        if (unpaidFinesEl) unpaidFinesEl.textContent = `$${unpaidFines}`;
      } catch (err) {
        console.error("Error fetching stats:", err);
        setStats({
          activeLoans: "Error",
          reservations: "Error",
          unpaidFines: "Error",
        });
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user, refreshTrigger]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome, {user?.name}</h1>
        <div className="user-stats">
          <div className="stat-item">
            <span className="stat-label">Active Loans:</span>
            <span className="stat-value" id="active-loans">
              {stats.activeLoans}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Reservations:</span>
            <span className="stat-value" id="active-reservations">
              {stats.reservations}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Unpaid Fines:</span>
            <span className="stat-value" id="unpaid-fines">
              {stats.unpaidFines}
            </span>
          </div>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === "books" ? "active" : ""}`}
          onClick={() => setActiveTab("books")}
        >
          Browse Books
        </button>
        <button
          className={`tab-button ${
            activeTab === "transactions" ? "active" : ""
          }`}
          onClick={() => setActiveTab("transactions")}
        >
          My Loans
        </button>
        <button
          className={`tab-button ${
            activeTab === "reservations" ? "active" : ""
          }`}
          onClick={() => setActiveTab("reservations")}
        >
          My Reservations
        </button>
        <button
          className={`tab-button ${activeTab === "fines" ? "active" : ""}`}
          onClick={() => setActiveTab("fines")}
        >
          My Fines
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === "books" && (
          <>
            <div className="dashboard-actions">
              <BorrowForm onBookBorrowed={handleRefresh} />
              <ReservationForm onReservationAdded={handleRefresh} />
            </div>
            <BookList key={`books-${refreshTrigger}`} />
          </>
        )}

        {activeTab === "transactions" && (
          <>
            <TransactionList
              key={`transactions-${refreshTrigger}`}
              onAction={handleRefresh}
            />
          </>
        )}

        {activeTab === "reservations" && (
          <>
            <ReservationForm onReservationAdded={handleRefresh} />
            <ReservationList
              key={`reservations-${refreshTrigger}`}
              onAction={handleRefresh}
            />
          </>
        )}

        {activeTab === "fines" && (
          <FineList key={`fines-${refreshTrigger}`} onAction={handleRefresh} />
        )}
      </div>
    </div>
  );
}

export default UserDashboard;
