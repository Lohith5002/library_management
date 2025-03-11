// src/routes/books.js
const express = require('express');
const router = express.Router();
const BookController = require('../controllers/bookController');
const { auth, isLibrarianOrAdmin } = require('../middleware/auth');

// Get all books - public
router.get('/', BookController.getAllBooks);

// Get book by ID - public
router.get('/:id', BookController.getBookById);

// Create new book - librarian/admin only
router.post('/', auth, isLibrarianOrAdmin, BookController.createBook);

// Update book - librarian/admin only
router.put('/:id', auth, isLibrarianOrAdmin, BookController.updateBook);

// Delete book - librarian/admin only
router.delete('/:id', auth, isLibrarianOrAdmin, BookController.deleteBook);

module.exports = router;