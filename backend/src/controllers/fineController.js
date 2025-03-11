// src/controllers/fineController.js
const FineModel = require('../models/fine');

const FineController = {
  // Get all fines
  getAllFines: async (req, res) => {
    try {
      // Extract filter parameters from query
      const { userId, status } = req.query;
      const filters = { userId, status };
      
      const fines = await FineModel.getAll(filters);
      res.json({ fines });
    } catch (error) {
      console.error('Error getting fines:', error);
      res.status(500).json({ message: 'Error fetching fines' });
    }
  },

  // Get fine by ID
  getFineById: async (req, res) => {
    try {
      const fineId = req.params.id;
      const fine = await FineModel.getById(fineId);
      
      if (!fine) {
        return res.status(404).json({ message: 'Fine not found' });
      }
      
      res.json({ fine });
    } catch (error) {
      console.error('Error getting fine:', error);
      res.status(500).json({ message: 'Error fetching fine' });
    }
  },

  // Get user's fines
  getUserFines: async (req, res) => {
    try {
      const userId = req.params.userId || req.user.UserID;
      
      // Check if user is requesting their own fines or is admin/librarian
      if (req.user.UserID !== parseInt(userId) && 
          req.user.Role !== 'Admin' && 
          req.user.Role !== 'Librarian') {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const fines = await FineModel.getUserFines(userId);
      const unpaidTotal = await FineModel.getUserUnpaidFinesTotal(userId);
      
      res.json({ 
        fines, 
        unpaidTotal,
        fineCount: fines.length,
        unpaidCount: fines.filter(fine => fine.Status === 'Unpaid').length
      });
    } catch (error) {
      console.error('Error getting user fines:', error);
      res.status(500).json({ message: 'Error fetching user fines' });
    }
  },

  // Pay fine
  payFine: async (req, res) => {
    try {
      const { id } = req.params;
      const { paymentMethod = 'Cash' } = req.body;
      
      // Check if fine exists
      const fine = await FineModel.getById(id);
      if (!fine) {
        return res.status(404).json({ message: 'Fine not found' });
      }
      
      // Check if user can pay (user's own fine or admin/librarian)
      if (fine.UserID !== req.user.UserID && 
          req.user.Role !== 'Admin' && 
          req.user.Role !== 'Librarian') {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // Check if fine is already paid
      if (fine.Status === 'Paid') {
        return res.status(400).json({ message: 'Fine already paid' });
      }
      
      // Process payment
      const paymentId = await FineModel.payFine(id, paymentMethod);
      
      res.json({
        message: 'Fine paid successfully',
        paymentId,
        paymentMethod,
        amountPaid: fine.Amount
      });
    } catch (error) {
      console.error('Error paying fine:', error);
      res.status(500).json({ message: 'Error processing payment' });
    }
  }
};

module.exports = FineController;