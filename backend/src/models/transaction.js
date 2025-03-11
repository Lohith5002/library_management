// src/models/transaction.js
const { pool } = require('../config/db');

// Helper function to calculate fine amount
const calculateFine = (dueDate, returnDate) => {
  // Default fine rate: $0.50 per day
  const fineRatePerDay = 0.5;
  const dueDateTime = new Date(dueDate);
  const returnDateTime = returnDate ? new Date(returnDate) : new Date();
  
  // No fine if returned on time
  if (returnDateTime <= dueDateTime) {
    return 0;
  }
  
  // Calculate days overdue
  const daysOverdue = Math.ceil((returnDateTime - dueDateTime) / (1000 * 60 * 60 * 24));
  return daysOverdue * fineRatePerDay;
};

const TransactionModel = {
  // Get all transactions
  getAll: async (filters = {}) => {
    let query = `
      SELECT t.*, b.Title as BookTitle, u.Name as UserName
      FROM transactions t
      JOIN books b ON t.BookID = b.BookID
      JOIN users u ON t.UserID = u.UserID
      WHERE 1=1
    `;
    
    const queryParams = [];
    
    // Apply filters
    if (filters.userId) {
      query += ' AND t.UserID = ?';
      queryParams.push(filters.userId);
    }
    
    if (filters.bookId) {
      query += ' AND t.BookID = ?';
      queryParams.push(filters.bookId);
    }
    
    if (filters.status) {
      query += ' AND t.Status = ?';
      queryParams.push(filters.status);
    }
    
    const [rows] = await pool.query(query, queryParams);
    return rows;
  },

  // Get transaction by ID
  getById: async (id) => {
    const [rows] = await pool.query(
      `SELECT t.*, b.Title as BookTitle, u.Name as UserName
       FROM transactions t
       JOIN books b ON t.BookID = b.BookID
       JOIN users u ON t.UserID = u.UserID
       WHERE t.TransactionID = ?`,
      [id]
    );
    return rows[0];
  },

  // Get user's active transactions
  getUserActiveTransactions: async (userId) => {
    const [rows] = await pool.query(
      `SELECT t.*, b.Title as BookTitle
       FROM transactions t
       JOIN books b ON t.BookID = b.BookID
       WHERE t.UserID = ? AND t.Status != 'Returned'`,
      [userId]
    );
    return rows;
  },

  // Check if book is available for borrowing
  isBookAvailable: async (bookId) => {
    const [rows] = await pool.query(
      'SELECT AvailableCopies FROM books WHERE BookID = ?',
      [bookId]
    );
    
    return rows[0] && rows[0].AvailableCopies > 0;
  },

  // Create new transaction (borrow book)
  borrowBook: async (userId, bookId, dueDate) => {
    // Start a transaction
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      // Insert transaction record
      const [result] = await connection.query(
        `INSERT INTO transactions (UserID, BookID, DueDate)
         VALUES (?, ?, ?)`,
        [userId, bookId, dueDate]
      );
      
      // Update book availability
      await connection.query(
        `UPDATE books SET AvailableCopies = AvailableCopies - 1,
         Availability = (AvailableCopies - 1 > 0)
         WHERE BookID = ?`,
        [bookId]
      );
      
      await connection.commit();
      return result.insertId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  // Return book
  returnBook: async (transactionId) => {
    // Start a transaction
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      // Get transaction details
      const [transactionRows] = await connection.query(
        'SELECT * FROM transactions WHERE TransactionID = ?',
        [transactionId]
      );
      
      if (transactionRows.length === 0) {
        throw new Error('Transaction not found');
      }
      
      const transaction = transactionRows[0];
      
      if (transaction.Status === 'Returned') {
        throw new Error('Book already returned');
      }
      
      const returnDate = new Date();
      const fineAmount = calculateFine(transaction.DueDate, returnDate);
      const status = returnDate > new Date(transaction.DueDate) ? 'Overdue' : 'Returned';
      
      // Update transaction
      await connection.query(
        `UPDATE transactions 
         SET ReturnDate = ?, Status = ?, FineAmount = ?
         WHERE TransactionID = ?`,
        [returnDate, status, fineAmount, transactionId]
      );
      
      // Update book availability
      await connection.query(
        `UPDATE books 
         SET AvailableCopies = AvailableCopies + 1, Availability = true
         WHERE BookID = ?`,
        [transaction.BookID]
      );
      
      // Create fine record if needed
      if (fineAmount > 0) {
        await connection.query(
          `INSERT INTO fines (UserID, TransactionID, Amount)
           VALUES (?, ?, ?)`,
          [transaction.UserID, transactionId, fineAmount]
        );
      }
      
      await connection.commit();
      return { status, fineAmount };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  // Update transaction status
  updateStatus: async (id, status) => {
    const [result] = await pool.query(
      'UPDATE transactions SET Status = ? WHERE TransactionID = ?',
      [status, id]
    );
    return result.affectedRows > 0;
  }
};

module.exports = TransactionModel;