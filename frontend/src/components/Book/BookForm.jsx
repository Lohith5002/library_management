import React, { useState } from 'react';
import api from '../../services/api';

function BookForm({ onBookAdded }) {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    publicationYear: '',
    publisher: '',
    totalCopies: 1,
    categoryId: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/books', formData);
      setFormData({
        title: '',
        author: '',
        isbn: '',
        publicationYear: '',
        publisher: '',
        totalCopies: 1,
        categoryId: ''
      });
      onBookAdded();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add book');
    }
  };

  return (
    <div className="book-form">
      <h3>Add New Book</h3>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Title"
          required
        />
        <input
          type="text"
          value={formData.author}
          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
          placeholder="Author"
          required
        />
        <input
          type="text"
          value={formData.isbn}
          onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
          placeholder="ISBN"
        />
        <input
          type="number"
          value={formData.publicationYear}
          onChange={(e) => setFormData({ ...formData, publicationYear: e.target.value })}
          placeholder="Publication Year"
        />
        <input
          type="text"
          value={formData.publisher}
          onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
          placeholder="Publisher"
        />
        <input
          type="number"
          value={formData.totalCopies}
          onChange={(e) => setFormData({ ...formData, totalCopies: e.target.value })}
          placeholder="Total Copies"
          min="1"
        />
        <input
          type="number"
          value={formData.categoryId}
          onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
          placeholder="Category ID"
        />
        <button type="submit">Add Book</button>
      </form>
    </div>
  );
}

export default BookForm;