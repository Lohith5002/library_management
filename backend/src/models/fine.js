// src/models/fine.js
const { pool } = require('../config/db');

const FineModel = {
  // Get all fines
  getAll: async (filters = {}) => {
    let query = `
      SELECT f.*, t.BorrowDate, t.DueDate, t.ReturnDate, 
             b.Title as BookTitle, u.Name as UserName
      FROM fines f
      JOIN transactions t ON f.TransactionID = t.TransactionID
      JOIN users u ON f.UserID = u.UserID
      JOIN books b ON t.BookID = b.BookID
      WHERE 1=1
    `;
    
    const queryParams = [];
    
    // Apply filters
    if (filters.userId) {
      query += ' AND f.UserID = ?';
      queryParams.push(filters.userId);
    }
    
    if (filters.status) {
      query += ' AND f.Status = ?';
      queryParams.push(filters.status);
    }
    
    const [rows] = await pool.query(query, queryParams);
    return rows;
  },

  // Get fine by ID
  getById: async (id) => {
    const [rows] = await pool.query(
      `SELECT f.*, t.BorrowDate, t.DueDate, t.ReturnDate, 
              b.Title as BookTitle, u.Name as UserName
       FROM fines f
       JOIN transactions t ON f.TransactionID = t.TransactionID
       JOIN users u ON f.UserID = u.UserID
       JOIN books b ON t.BookID = b.BookID
       WHERE f.FineID = ?`,
      [id]
    );
    return rows[0];
  },

  // Get user's fines
  getUserFines: async (userId) => {
    const [rows] = await pool.query(
      `SELECT f.*, t.BorrowDate, t.DueDate, t.ReturnDate, b.Title as BookTitle
       FROM fines f
       JOIN transactions t ON f.TransactionID = t.TransactionID
       JOIN books b ON t.BookID = b.BookID
       WHERE f.UserID = ?`,
      [userId]
    );
    return rows;
  },

  // Pay fine
  payFine: async (fineId, paymentMethod) => {
    // Start a transaction
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      // Get fine details
      const [fineRows] = await connection.query(
        'SELECT * FROM fines WHERE FineID = ?',
        [fineId]
      );
      
      if (fineRows.length === 0) {
        throw new Error('Fine not found');
      }
      
      const fine = fineRows[0];
      
      if (fine.Status === 'Paid') {
        throw new Error('Fine already paid');
      }
      
      // Update fine status
      await connection.query(
        'UPDATE fines SET Status = ? WHERE FineID = ?',
        ['Paid', fineId]
      );
      
      // Create payment record
      await connection.query(
        `INSERT INTO payments (UserID, TransactionID, AmountPaid, PaymentMethod)
         VALUES (?, ?, ?, ?)`,
        [fine.UserID, fine.TransactionID, fine.Amount, paymentMethod || 'Cash']
      );
      
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  // Update fine
  updateFine: async (id, amount) => {
    const [result] = await pool.query(
      'UPDATE fines SET Amount = ? WHERE FineID = ? AND Status = ?',
      [amount, id, 'Unpaid']
    );
    return result.affectedRows > 0;
  }
};

module.exports = FineModel;