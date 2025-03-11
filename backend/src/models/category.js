// src/models/category.js
const { pool } = require('../config/db');

const CategoryModel = {
  // Get all categories
  getAll: async () => {
    const [rows] = await pool.query('SELECT * FROM categories');
    return rows;
  },

  // Get category by ID
  getById: async (id) => {
    const [rows] = await pool.query('SELECT * FROM categories WHERE CategoryID = ?', [id]);
    return rows[0];
  },

  // Create new category
  create: async (categoryData) => {
    const { categoryName, description } = categoryData;
    
    const [result] = await pool.query(
      'INSERT INTO categories (CategoryName, Description) VALUES (?, ?)',
      [categoryName, description]
    );
    
    return result.insertId;
  },

  // Update category
  update: async (id, categoryData) => {
    const { categoryName, description } = categoryData;
    
    const [result] = await pool.query(
      'UPDATE categories SET CategoryName = ?, Description = ? WHERE CategoryID = ?',
      [categoryName, description, id]
    );
    
    return result.affectedRows > 0;
  },

  // Delete category
  delete: async (id) => {
    const [result] = await pool.query('DELETE FROM categories WHERE CategoryID = ?', [id]);
    return result.affectedRows > 0;
  },

  // Get books by category
  getBooks: async (id) => {
    const [rows] = await pool.query(
      'SELECT * FROM books WHERE CategoryID = ?',
      [id]
    );
    return rows;
  }
};

module.exports = CategoryModel;