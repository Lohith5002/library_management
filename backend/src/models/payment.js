// src/models/payment.js
const { pool } = require('../config/db');

const PaymentModel = {
  // Get all payments
  getAll: async (filters = {}) => {
    let query = `
      SELECT p.*, u.Name as UserName, 
             t.TransactionID, t.BookID, b.Title as BookTitle
      FROM payments p
      JOIN users u ON p.UserID = u.UserID
      LEFT JOIN transactions t ON p.TransactionID = t.TransactionID
      LEFT JOIN books b ON t.BookID = b.BookID
      WHERE 1=1
    `;
    
    const queryParams = [];
    
    // Apply filters
    if (filters.userId) {
      query += ' AND p.UserID = ?';
      queryParams.push(filters.userId);
    }
    
    if (filters.paymentMethod) {
      query += ' AND p.PaymentMethod = ?';
      queryParams.push(filters.paymentMethod);
    }
    
    if (filters.startDate) {
      query += ' AND p.PaymentDate >= ?';
      queryParams.push(filters.startDate);
    }
    
    if (filters.endDate) {
      query += ' AND p.PaymentDate <= ?';
      queryParams.push(filters.endDate);
    }
    
    const [rows] = await pool.query(query, queryParams);
    return rows;
  },

  // Get payment by ID
  getById: async (id) => {
    const [rows] = await pool.query(
      `SELECT p.*, u.Name as UserName, 
              t.TransactionID, t.BookID, b.Title as BookTitle
       FROM payments p
       JOIN users u ON p.UserID = u.UserID
       LEFT JOIN transactions t ON p.TransactionID = t.TransactionID
       LEFT JOIN books b ON t.BookID = b.BookID
       WHERE p.PaymentID = ?`,
      [id]
    );
    return rows[0];
  },

  // Get user payments
  getUserPayments: async (userId) => {
    const [rows] = await pool.query(
      `SELECT p.*, t.BookID, b.Title as BookTitle
       FROM payments p
       LEFT JOIN transactions t ON p.TransactionID = t.TransactionID
       LEFT JOIN books b ON t.BookID = b.BookID
       WHERE p.UserID = ?`,
      [userId]
    );
    return rows;
  },

  // Create payment
  create: async (paymentData) => {
    const {
      userId,
      transactionId,
      amountPaid,
      paymentMethod
    } = paymentData;
    
    const [result] = await pool.query(
      `INSERT INTO payments (UserID, TransactionID, AmountPaid, PaymentMethod)
       VALUES (?, ?, ?, ?)`,
      [userId, transactionId, amountPaid, paymentMethod]
    );
    
    return result.insertId;
  }
};

module.exports = PaymentModel;