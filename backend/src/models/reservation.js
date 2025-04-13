// src/models/reservation.js
const { pool } = require('../config/db');

const ReservationModel = {
  // Get all reservations
  getAll: async (filters = {}) => {
    let query = `
      SELECT r.*, b.Title as BookTitle, u.Name as UserName
      FROM reservations r
      JOIN books b ON r.BookID = b.BookID
      JOIN users u ON r.UserID = u.UserID
      WHERE 1=1
    `;
    
    const queryParams = [];
    
    // Apply filters
    if (filters.userId) {
      query += ' AND r.UserID = ?';
      queryParams.push(filters.userId);
    }
    
    if (filters.bookId) {
      query += ' AND r.BookID = ?';
      queryParams.push(filters.bookId);
    }
    
    if (filters.status) {
      query += ' AND r.Status = ?';
      queryParams.push(filters.status);
    }
    
    const [rows] = await pool.query(query, queryParams);
    return rows;
  },

  // Get reservation by ID
  getById: async (id) => {
    const [rows] = await pool.query(
      `SELECT r.*, b.Title as BookTitle, u.Name as UserName
       FROM reservations r
       JOIN books b ON r.BookID = b.BookID
       JOIN users u ON r.UserID = u.UserID
       WHERE r.ReservationID = ?`,
      [id]
    );
    return rows[0];
  },

  // Get user's reservations
  getUserReservations: async (userId) => {
    const [rows] = await pool.query(
      `SELECT r.*, b.Title as BookTitle
       FROM reservations r
       JOIN books b ON r.BookID = b.BookID
       WHERE r.UserID = ?`,
      [userId]
    );
    return rows;
  },

  // Create reservation
  create: async (userId, bookId, expiryDays = 7) => {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiryDays);
    
    const [result] = await pool.query(
      `INSERT INTO reservations (UserID, BookID, ExpiryDate)
       VALUES (?, ?, ?)`,
      [userId, bookId, expiryDate]
    );
    
    return result.insertId;
  },

  // Update reservation status
  updateStatus: async (id, status) => {
    const validStatuses = ['Pending', 'Fulfilled', 'Cancelled', 'Expired'];
    
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status');
    }
    
    const [result] = await pool.query(
      'UPDATE reservations SET Status = ? WHERE ReservationID = ?',
      [status, id]
    );
    
    return result.affectedRows > 0;
  },
  isBookReservedByUser: async (userId, bookId) => {
    const [rows] = await pool.query(
      'SELECT * FROM reservations WHERE UserID = ? AND BookID = ? AND Status = "Pending"',
      [userId, bookId]
    );
    return rows.length > 0;
  },

  // Check for expired reservations
  checkExpiredReservations: async () => {
    const [result] = await pool.query(
      `UPDATE reservations 
       SET Status = 'Expired'
       WHERE Status = 'Pending' AND ExpiryDate < NOW()`
    );
    
    return result.affectedRows;
  }
};

module.exports = ReservationModel;