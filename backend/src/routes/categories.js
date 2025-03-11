// src/routes/categories.js
const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/categoryController');
const { auth, isLibrarianOrAdmin } = require('../middleware/auth');

// Get all categories - public
router.get('/', CategoryController.getAllCategories);

// Get category by ID - public
router.get('/:id', CategoryController.getCategoryById);

// Get books by category - public
router.get('/:id/books', CategoryController.getCategoryBooks);

// Create new category - librarian/admin only
router.post('/', auth, isLibrarianOrAdmin, CategoryController.createCategory);

// Update category - librarian/admin only
router.put('/:id', auth, isLibrarianOrAdmin, CategoryController.updateCategory);

// Delete category - librarian/admin only
router.delete('/:id', auth, isLibrarianOrAdmin, CategoryController.deleteCategory);

module.exports = router;