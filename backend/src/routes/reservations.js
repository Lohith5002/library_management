// src/routes/reservations.js
const express = require('express');
const router = express.Router();
const ReservationController = require('../controllers/reservationController');
const { auth, isLibrarianOrAdmin } = require('../middleware/auth');

// Get all reservations - admin/librarian only
router.get('/', auth, isLibrarianOrAdmin, ReservationController.getAllReservations);

// Get reservation by ID
router.get('/:id', auth, ReservationController.getReservationById);

// Get user's reservations
router.get('/user/:userId', auth, ReservationController.getUserReservations);

// Create reservation
router.post('/', auth, ReservationController.createReservation);

// Update reservation status
router.put('/:id/status', auth, ReservationController.updateReservationStatus);

// Cancel reservation
router.put('/:id/cancel', auth, ReservationController.cancelReservation);

module.exports = router;