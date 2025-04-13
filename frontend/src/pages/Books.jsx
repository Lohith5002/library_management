import React from 'react';
import BookList from '../components/Book/BookList';

function Books() {
  return (
    <div className="books-page">
      <h1>All Books</h1>
      <BookList />
    </div>
  );
}

export default Books;