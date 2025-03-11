// src/routes/transactions.js
const express = require('express');
const router = express.Router();
const TransactionController = require('../controllers/transactionController');
const { auth, isLibrarianOrAdmin } = require('../middleware/auth');

// Get all transactions - librarian/admin only
router.get('/', auth, isLibrarianOrAdmin, TransactionController.getAllTransactions);

// Get transaction by ID - auth required
router.get('/:id', auth, TransactionController.getTransactionById);

// Get user's transactions - auth required
router.get('/user/:userId', auth, TransactionController.getUserTransactions);

// Get current user's transactions - auth required
router.get('/my/transactions', auth, (req, res) => {
  req.params.userId = req.user.UserID;
  TransactionController.getUserTransactions(req, res);
});

// Borrow a book - auth required
router.post('/borrow', auth, TransactionController.borrowBook);

// Return a book - auth required
router.post('/return/:transactionId', auth, TransactionController.returnBook);

// Update transaction status - librarian/admin only
router.put('/:transactionId', auth, isLibrarianOrAdmin, TransactionController.updateTransactionStatus);

module.exports = router;