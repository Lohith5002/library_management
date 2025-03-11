// src/routes/payments.js
const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/paymentController');
const { auth, isLibrarianOrAdmin } = require('../middleware/auth');

// Get all payments - admin/librarian only
router.get('/', auth, isLibrarianOrAdmin, PaymentController.getAllPayments);

// Get payment by ID
router.get('/:id', auth, PaymentController.getPaymentById);

// Get user's payments
router.get('/user/:userId', auth, PaymentController.getUserPayments);

// Create payment - admin/librarian only
router.post('/', auth, isLibrarianOrAdmin, PaymentController.createPayment);

module.exports = router;