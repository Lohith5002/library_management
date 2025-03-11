// src/models/user.js
const { pool } = require('../config/db');
const bcrypt = require('bcrypt');

const UserModel = {
  // Get all users
  getAll: async () => {
    const [rows] = await pool.query('SELECT UserID, Name, Email, Role, CreatedAt, UpdatedAt FROM users');
    return rows;
  },

  // Get user by ID
  getById: async (id) => {
    const [rows] = await pool.query(
      'SELECT UserID, Name, Email, Role, CreatedAt, UpdatedAt FROM users WHERE UserID = ?',
      [id]
    );
    return rows[0];
  },

  // Get user by email
  getByEmail: async (email) => {
    const [rows] = await pool.query('SELECT * FROM users WHERE Email = ?', [email]);
    return rows[0];
  },

  // Create new user
  create: async (userData) => {
    const { name, email, password, role = 'Student' } = userData;
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const [result] = await pool.query(
      'INSERT INTO users (Name, Email, Password, Role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );
    
    return result.insertId;
  },

  // Update user
  update: async (id, userData) => {
    const { name, email, role } = userData;
    
    const [result] = await pool.query(
      'UPDATE users SET Name = ?, Email = ?, Role = ? WHERE UserID = ?',
      [name, email, role, id]
    );
    
    return result.affectedRows > 0;
  },

  // Update user password
  updatePassword: async (id, password) => {
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const [result] = await pool.query(
      'UPDATE users SET Password = ? WHERE UserID = ?',
      [hashedPassword, id]
    );
    
    return result.affectedRows > 0;
  },

  // Delete user
  delete: async (id) => {
    const [result] = await pool.query('DELETE FROM users WHERE UserID = ?', [id]);
    return result.affectedRows > 0;
  }
};

module.exports = UserModel;