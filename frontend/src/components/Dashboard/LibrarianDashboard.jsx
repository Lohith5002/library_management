import React, { useEffect, useState } from "react";
import BookForm from "../Book/BookForm";
import CategoryList from "../Category/CategoryList";
import CategoryForm from "../Category/CategoryForm";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

function LibrarianDashboard() {
  const { user } = useAuth();

  const [message, setMessage] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [books, setBooks] = useState([]);
  const [editingBook, setEditingBook] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    publicationYear: "",
    publisher: "",
    totalCopies: "",
    availableCopies: "",
    categoryId: "",
  });

  useEffect(() => {
    fetchBooks();
    fetchTransactions();
    fetchReservations();
  }, []);

  const refreshData = () => {
    fetchBooks();
    fetchTransactions();
    fetchReservations();
  };

  const fetchBooks = async () => {
    try {
      const res = await api.get("/books");
      setBooks(res.data.books || []);
    } catch (err) {
      console.error("Failed to load books:", err);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await api.get("/transactions");
      setTransactions(res.data.transactions || []);
    } catch (err) {
      console.error("Failed to load transactions:", err);
    }
  };

  const fetchReservations = async () => {
    try {
      const res = await api.get("/reservations");
      setReservations(res.data.reservations || []);
    } catch (err) {
      console.error("Failed to load reservations:", err);
    }
  };

  const handleDeleteBook = async (bookId) => {
    try {
      await api.delete(`/books/${bookId}`);
      setMessage("Book deleted");
      fetchBooks();
    } catch {
      setMessage("Failed to delete book");
    }
  };

  const handleEditClick = (book) => {
    setEditingBook(book.BookID);
    setEditFormData({
      title: book.Title,
      author: book.Author,
      isbn: book.ISBN,
      publicationYear: book.PublicationYear,
      publisher: book.Publisher,
      totalCopies: book.TotalCopies,
      availableCopies: book.AvailableCopies,
      categoryId: book.CategoryID,
    });
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/books/${editingBook}`, editFormData);
      setMessage("Book updated successfully");
      setEditingBook(null);
      fetchBooks();
    } catch {
      setMessage("Failed to update book");
    }
  };

  const handleReturn = async (transactionId) => {
    try {
      await api.post(`/transactions/${transactionId}/return`);
      setMessage("Book returned");
      fetchTransactions();
    } catch {
      setMessage("Failed to return book");
    }
  };

  const handleRenew = async (transactionId) => {
    try {
      await api.put(`/transactions/${transactionId}/renew`);
      setMessage("Loan renewed");
      fetchTransactions();
    } catch {
      setMessage("Failed to renew loan");
    }
  };

  return (
    <div className="librarian-dashboard">
      <h1>Librarian Dashboard - {user.name}</h1>
      {message && <p className="status-msg">{message}</p>}

      <h2>Manage Books</h2>
      <BookForm onBookAdded={refreshData} />
      <ul>
        {books.map((book) => (
          <li key={book.BookID}>
            <b>{book.Title}</b> by {book.Author} — {book.AvailableCopies} copies
            <button onClick={() => handleEditClick(book)}>Edit</button>
            <button onClick={() => handleDeleteBook(book.BookID)}>
              Delete
            </button>
          </li>
        ))}
      </ul>

      {editingBook && (
        <form onSubmit={handleEditSubmit}>
          <h3>Edit Book ID: {editingBook}</h3>
          {Object.entries(editFormData).map(([field, value]) => (
            <input
              key={field}
              name={field}
              type={
                field.includes("Year") || field.includes("Copies")
                  ? "number"
                  : "text"
              }
              placeholder={field}
              value={value}
              onChange={handleEditChange}
              required
            />
          ))}
          <button type="submit">Update Book</button>
          <button type="button" onClick={() => setEditingBook(null)}>
            Cancel
          </button>
        </form>
      )}

      <h2>Manage Categories</h2>
      <CategoryForm onCategoryAdded={refreshData} />
      <CategoryList />

      <h2>All Book Loans</h2>
      <ul>
        {transactions.map((txn) => (
          <li key={txn.TransactionID}>
            User {txn.UserID} - {txn.BookTitle} ({txn.Status}) - Due:{" "}
            {new Date(txn.DueDate).toLocaleDateString()}
            {txn.Status === "Borrowed" && (
              <>
                <button onClick={() => handleReturn(txn.TransactionID)}>
                  Return
                </button>
                <button onClick={() => handleRenew(txn.TransactionID)}>
                  Renew
                </button>
              </>
            )}
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
    </div>
  );
}

export default LibrarianDashboard;
