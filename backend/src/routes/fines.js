// src/routes/fines.js
const express = require('express');
const router = express.Router();
const FineController = require('../controllers/fineController');
const { auth, isLibrarianOrAdmin } = require('../middleware/auth');

// Get all fines - admin/librarian only
router.get('/', auth, isLibrarianOrAdmin, FineController.getAllFines);

// Get fine by ID
router.get('/:id', auth, FineController.getFineById);

// Get user's fines
router.get('/user/:userId', auth, FineController.getUserFines);

// Pay fine
router.post('/:id/pay', auth, FineController.payFine);

module.exports = router;