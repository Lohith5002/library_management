import React, { useState, useEffect } from 'react';
import api from '../../services/api';

function BookDetails({ bookId }) {
  const [book, setBook] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await api.get(`/books/${bookId}`);
        setBook(response.data.book);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch book');
      }
    };
    fetchBook();
  }, [bookId]);

  if (!book) return <div>Loading...</div>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="book-details">
      <h3>{book.Title}</h3>
      <p>Author: {book.Author}</p>
      <p>ISBN: {book.ISBN}</p>
      <p>Publisher: {book.Publisher}</p>
      <p>Publication Year: {book.PublicationYear}</p>
      <p>Total Copies: {book.TotalCopies}</p>
      <p>Available Copies: {book.AvailableCopies}</p>
      <p>Category: {book.CategoryName}</p>
    </div>
  );
}

export default BookDetails;