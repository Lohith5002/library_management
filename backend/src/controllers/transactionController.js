// src/controllers/transactionController.js
const TransactionModel = require('../models/transaction');
const BookModel = require('../models/book');

const TransactionController = {
  // Get all transactions
  getAllTransactions: async (req, res) => {
    try {
      // Extract filter parameters from query
      const { userId, bookId, status } = req.query;
      const filters = { userId, bookId, status };
      
      const transactions = await TransactionModel.getAll(filters);
      res.json({ transactions });
    } catch (error) {
      console.error('Error getting transactions:', error);
      res.status(500).json({ message: 'Error fetching transactions' });
    }
  },

  // Get transaction by ID
  getTransactionById: async (req, res) => {
    try {
      const transactionId = req.params.id;
      const transaction = await TransactionModel.getById(transactionId);
      
      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }
      
      res.json({ transaction });
    } catch (error) {
      console.error('Error getting transaction:', error);
      res.status(500).json({ message: 'Error fetching transaction' });
    }
  },

  // Get user's active transactions
  getUserTransactions: async (req, res) => {
    try {
      const userId = req.params.userId || req.user.UserID;
      
      // Check if user is requesting their own transactions or is admin/librarian
      if (req.user.UserID !== parseInt(userId) && 
          req.user.Role !== 'Admin' && 
          req.user.Role !== 'Librarian') {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const transactions = await TransactionModel.getUserActiveTransactions(userId);
      res.json({ transactions });
    } catch (error) {
      console.error('Error getting user transactions:', error);
      res.status(500).json({ message: 'Error fetching user transactions' });
    }
  },

  // Borrow a book
  borrowBook: async (req, res) => {
    try {
      const { bookId, userId, dueDate } = req.body;
      const borrowerId = userId || req.user.UserID;
      
      // Check if user can borrow the book (librarian/admin can borrow for others)
      if (borrowerId !== req.user.UserID && 
          req.user.Role !== 'Admin' && 
          req.user.Role !== 'Librarian') {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // Check if book exists
      const book = await BookModel.getById(bookId);
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }
      
      // Check if book is available
      if (book.AvailableCopies <= 0) {
        return res.status(400).json({ message: 'Book is not available for borrowing' });
      }
      
      // Set due date (default: 14 days from now)
      const dueDateValue = dueDate ? new Date(dueDate) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
      
      // Borrow the book
      const transactionId = await TransactionModel.borrowBook(borrowerId, bookId, dueDateValue);
      
      res.status(201).json({
        message: 'Book borrowed successfully',
        transactionId,
        dueDate: dueDateValue
      });
    } catch (error) {
      console.error('Error borrowing book:', error);
      res.status(500).json({ message: 'Error borrowing book' });
    }
  },

  // Return a book
  returnBook: async (req, res) => {
    try {
      const { transactionId } = req.params;
      
      // Get transaction details
      const transaction = await TransactionModel.getById(transactionId);
      
      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }
      
      // Check if user can return the book (self, librarian, or admin)
      if (transaction.UserID !== req.user.UserID && 
          req.user.Role !== 'Admin' && 
          req.user.Role !== 'Librarian') {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // Check if book is already returned
      if (transaction.Status === 'Returned') {
        return res.status(400).json({ message: 'Book already returned' });
      }
      
      // Return the book
      const result = await TransactionModel.returnBook(transactionId);
      
      res.json({
        message: 'Book returned successfully',
        status: result.status,
        fineAmount: result.fineAmount
      });
    } catch (error) {
        console.error('Error returning book:', error);
        res.status(500).json({ message: 'Error returning book', error: error.message });
      }
    },
  
    // Update transaction status
    updateTransactionStatus: async (req, res) => {
      try {
        const { transactionId } = req.params;
        const { status } = req.body;
        
        // Validate status
        const validStatuses = ['Borrowed', 'Returned', 'Overdue'];
        if (!validStatuses.includes(status)) {
          return res.status(400).json({ message: 'Invalid status' });
        }
        
        // Get transaction details
        const transaction = await TransactionModel.getById(transactionId);
        
        if (!transaction) {
          return res.status(404).json({ message: 'Transaction not found' });
        }
        
        // Only librarian or admin can update status
        if (req.user.Role !== 'Admin' && req.user.Role !== 'Librarian') {
          return res.status(403).json({ message: 'Access denied' });
        }
        
        // Update status
        const updated = await TransactionModel.updateStatus(transactionId, status);
        
        if (!updated) {
          return res.status(400).json({ message: 'Failed to update transaction status' });
        }
        
        res.json({ message: 'Transaction status updated successfully' });
      } catch (error) {
        console.error('Error updating transaction status:', error);
        res.status(500).json({ message: 'Error updating transaction status' });
      }
    }
  };
  
  module.exports = TransactionController;