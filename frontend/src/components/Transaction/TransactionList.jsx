import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function TransactionList({ onAction }) {
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const endpoint =
        user.role === "Student"
          ? `/transactions/my/transactions`
          : `/transactions`;
      const response = await api.get(endpoint);
      setTransactions(response.data.transactions || []);

      // Only update stats if no central update mechanism
      // We'll keep this for backward compatibility
      updateLocalStats(response.data.transactions || []);
    } catch (err) {
      console.error("Transaction fetch error:", err);
      setError(err.response?.data?.message || "Failed to fetch transactions");
    } finally {
      setIsLoading(false);
    }
  };

  const updateLocalStats = (transactions) => {
    const activeLoansEl = document.getElementById("active-loans");
    if (activeLoansEl) {
      const activeLoans = transactions.filter(
        (t) => t.Status === "Borrowed"
      ).length;
      activeLoansEl.textContent = activeLoans;
    }
  };

  const returnBook = async (transactionId) => {
    try {
      await api.post(`/transactions/return/${transactionId}`);
      setMessage("Book returned successfully");
      fetchTransactions();
      if (onAction) onAction(); // This will trigger the parent component to refresh stats
    } catch (err) {
      setError(err.response?.data?.message || "Failed to return book");
    }
  };

  const renewBook = async (transaction) => {
    try {
      // Create a due date 14 days from now
      const newDueDate = new Date();
      newDueDate.setDate(newDueDate.getDate() + 14);

      // 1. Borrow the book again with new due date
      await api.post(`/transactions/borrow`, {
        bookId: transaction.BookID,
        dueDate: newDueDate.toISOString(),
      });

      // 2. Return the old transaction
      await api.post(`/transactions/return/${transaction.TransactionID}`);

      setMessage("Book renewed successfully");
      fetchTransactions();
      if (onAction) onAction(); // This will trigger the parent component to refresh stats
    } catch (err) {
      console.error("Renew error:", err);
      setError(err.response?.data?.message || "Failed to renew book");
    }
  };

  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const renderDueStatus = (dueDate, status) => {
    if (status !== "Borrowed") return null;

    const daysUntilDue = getDaysUntilDue(dueDate);

    if (daysUntilDue < 0) {
      return (
        <span className="overdue">
          Overdue by {Math.abs(daysUntilDue)} days
        </span>
      );
    } else if (daysUntilDue <= 3) {
      return <span className="due-soon">Due in {daysUntilDue} days</span>;
    } else {
      return <span className="on-time">Due in {daysUntilDue} days</span>;
    }
  };

  return (
    <div className="transactions-container">
      <h2>Your Book Loans</h2>
      {error && <p className="error-message">{error}</p>}
      {message && <p className="success-message">{message}</p>}

      {isLoading ? (
        <div className="loading">Loading transactions...</div>
      ) : transactions.length === 0 ? (
        <p>You don't have any book loans yet.</p>
      ) : (
        <div className="transaction-cards">
          {transactions.map((transaction) => (
            <div
              key={transaction.TransactionID}
              className={`transaction-card ${transaction.Status.toLowerCase()}`}
            >
              <div className="transaction-header">
                <h3>{transaction.BookTitle}</h3>
                <span
                  className={`status-badge ${transaction.Status.toLowerCase()}`}
                >
                  {transaction.Status}
                </span>
              </div>

              <div className="transaction-details">
                <p>
                  <strong>Borrowed:</strong>{" "}
                  {new Date(transaction.BorrowDate).toLocaleDateString()}
                </p>
                <p>
                  <strong>Due:</strong>{" "}
                  {new Date(transaction.DueDate).toLocaleDateString()}
                  {renderDueStatus(transaction.DueDate, transaction.Status)}
                </p>
                {transaction.ReturnDate && (
                  <p>
                    <strong>Returned:</strong>{" "}
                    {new Date(transaction.ReturnDate).toLocaleDateString()}
                  </p>
                )}
              </div>

              {transaction.Status === "Borrowed" &&
                transaction.UserID === user.id && (
                  <div className="transaction-actions">
                    <button
                      onClick={() => returnBook(transaction.TransactionID)}
                      className="return-button"
                    >
                      Return Book
                    </button>
                    <button onClick={() => renewBook(transaction)}>
                      Renew Loan
                    </button>
                  </div>
                )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TransactionList;
