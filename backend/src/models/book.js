// src/models/book.js
const { pool } = require('../config/db');

const BookModel = {
  // Get all books
  getAll: async (filters = {}) => {
    let query = `
      SELECT b.*, c.CategoryName 
      FROM books b
      LEFT JOIN categories c ON b.CategoryID = c.CategoryID
      WHERE 1=1
    `;
    
    const queryParams = [];
    
    // Apply filters
    if (filters.title) {
      query += ' AND b.Title LIKE ?';
      queryParams.push(`%${filters.title}%`);
    }
    
    if (filters.author) {
      query += ' AND b.Author LIKE ?';
      queryParams.push(`%${filters.author}%`);
    }
    
    if (filters.category) {
      query += ' AND b.CategoryID = ?';
      queryParams.push(filters.category);
    }
    
    if (filters.available) {
      query += ' AND b.AvailableCopies > 0';
    }
    
    const [rows] = await pool.query(query, queryParams);
    return rows;
  },

  // Get book by ID
  getById: async (id) => {
    const [rows] = await pool.query(
      `SELECT b.*, c.CategoryName 
       FROM books b
       LEFT JOIN categories c ON b.CategoryID = c.CategoryID
       WHERE b.BookID = ?`,
      [id]
    );
    return rows[0];
  },

  // Create new book
  create: async (bookData) => {
    const {
      title,
      author,
      isbn,
      publicationYear,
      publisher,
      totalCopies,
      categoryId
    } = bookData;
    
    const [result] = await pool.query(
      `INSERT INTO books 
       (Title, Author, ISBN, PublicationYear, Publisher, TotalCopies, AvailableCopies, CategoryID)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, author, isbn, publicationYear, publisher, totalCopies, totalCopies, categoryId]
    );
    
    return result.insertId;
  },

  // Update book
  update: async (id, bookData) => {
    const {
      title,
      author,
      isbn,
      publicationYear,
      publisher,
      totalCopies,
      availableCopies,
      categoryId
    } = bookData;
    
    const [result] = await pool.query(
      `UPDATE books 
       SET Title = ?, Author = ?, ISBN = ?, PublicationYear = ?,
           Publisher = ?, TotalCopies = ?, AvailableCopies = ?, CategoryID = ?
       WHERE BookID = ?`,
      [title, author, isbn, publicationYear, publisher, totalCopies, availableCopies, categoryId, id]
    );
    
    return result.affectedRows > 0;
  },

  // Delete book
  delete: async (id) => {
    const [result] = await pool.query('DELETE FROM books WHERE BookID = ?', [id]);
    return result.affectedRows > 0;
  },

  // Update book availability
  updateAvailability: async (id, isCheckout) => {
    let query;
    
    if (isCheckout) {
      query = `UPDATE books SET AvailableCopies = AvailableCopies - 1, 
               Availability = (AvailableCopies - 1 > 0)
               WHERE BookID = ? AND AvailableCopies > 0`;
    } else {
      query = `UPDATE books SET AvailableCopies = AvailableCopies + 1,
               Availability = true
               WHERE BookID = ? AND AvailableCopies < TotalCopies`;
    }
    
    const [result] = await pool.query(query, [id]);
    return result.affectedRows > 0;
  }
};

module.exports = BookModel;