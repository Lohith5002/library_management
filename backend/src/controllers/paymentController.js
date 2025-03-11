// src/controllers/paymentController.js
const PaymentModel = require('../models/payment');

const PaymentController = {
  // Get all payments
  getAllPayments: async (req, res) => {
    try {
      // Extract filter parameters from query
      const { userId, paymentMethod, startDate, endDate } = req.query;
      const filters = { userId, paymentMethod, startDate, endDate };
      
      const payments = await PaymentModel.getAll(filters);
      res.json({ payments });
    } catch (error) {
      console.error('Error getting payments:', error);
      res.status(500).json({ message: 'Error fetching payments' });
    }
  },

  // Get payment by ID
  getPaymentById: async (req, res) => {
    try {
      const paymentId = req.params.id;
      const payment = await PaymentModel.getById(paymentId);
      
      if (!payment) {
        return res.status(404).json({ message: 'Payment not found' });
      }
      
      res.json({ payment });
    } catch (error) {
      console.error('Error getting payment:', error);
      res.status(500).json({ message: 'Error fetching payment' });
    }
  },

  // Get user's payments
  getUserPayments: async (req, res) => {
    try {
      const userId = req.params.userId || req.user.UserID;
      
      // Check if user is requesting their own payments or is admin/librarian
      if (req.user.UserID !== parseInt(userId) && 
          req.user.Role !== 'Admin' && 
          req.user.Role !== 'Librarian') {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const payments = await PaymentModel.getUserPayments(userId);
      
      res.json({
        payments,
        total: payments.reduce((sum, payment) => sum + payment.AmountPaid, 0)
      });
    } catch (error) {
      console.error('Error getting user payments:', error);
      res.status(500).json({ message: 'Error fetching user payments' });
    }
  },

  // Create payment
  createPayment: async (req, res) => {
    try {
      const { userId, transactionId, amountPaid, paymentMethod } = req.body;
      
      // Check if user is creating their own payment or is admin/librarian
      if (userId !== req.user.UserID && 
          req.user.Role !== 'Admin' && 
          req.user.Role !== 'Librarian') {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // Create payment
      const paymentId = await PaymentModel.create({
        userId,
        transactionId,
        amountPaid,
        paymentMethod: paymentMethod || 'Cash'
      });
      
      res.status(201).json({
        message: 'Payment created successfully',
        paymentId
      });
    } catch (error) {
      console.error('Error creating payment:', error);
      res.status(500).json({ message: 'Error creating payment' });
    }
  }
};

module.exports = PaymentController;