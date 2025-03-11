// src/controllers/reservationController.js
const ReservationModel = require('../models/reservation');
const BookModel = require('../models/book');

const ReservationController = {
  // Get all reservations
  getAllReservations: async (req, res) => {
    try {
      // Extract filter parameters from query
      const { userId, bookId, status } = req.query;
      const filters = { userId, bookId, status };
      
      const reservations = await ReservationModel.getAll(filters);
      res.json({ reservations });
    } catch (error) {
      console.error('Error getting reservations:', error);
      res.status(500).json({ message: 'Error fetching reservations' });
    }
  },

  // Get reservation by ID
  getReservationById: async (req, res) => {
    try {
      const reservationId = req.params.id;
      const reservation = await ReservationModel.getById(reservationId);
      
      if (!reservation) {
        return res.status(404).json({ message: 'Reservation not found' });
      }
      
      res.json({ reservation });
    } catch (error) {
      console.error('Error getting reservation:', error);
      res.status(500).json({ message: 'Error fetching reservation' });
    }
  },

  // Get user reservations
  getUserReservations: async (req, res) => {
    try {
      const userId = req.params.userId || req.user.UserID;
      
      // Check if user is requesting their own reservations or is admin/librarian
      if (req.user.UserID !== parseInt(userId) && 
          req.user.Role !== 'Admin' && 
          req.user.Role !== 'Librarian') {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const reservations = await ReservationModel.getUserReservations(userId);
      res.json({ reservations });
    } catch (error) {
      console.error('Error getting user reservations:', error);
      res.status(500).json({ message: 'Error fetching user reservations' });
    }
  },

  // Create reservation
  createReservation: async (req, res) => {
    try {
      const { bookId, userId } = req.body;
      const reserverId = userId || req.user.UserID;
      
      // Check if user can create reservation (librarian/admin can reserve for others)
      if (reserverId !== req.user.UserID && 
          req.user.Role !== 'Admin' && 
          req.user.Role !== 'Librarian') {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // Check if book exists
      const book = await BookModel.getById(bookId);
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }
      
      // Check if book is already available
      if (book.AvailableCopies > 0) {
        return res.status(400).json({ message: 'Book is available for borrowing, reservation not needed' });
      }
      
      // Check if user already has an active reservation for this book
      const alreadyReserved = await ReservationModel.isBookReservedByUser(reserverId, bookId);
      if (alreadyReserved) {
        return res.status(400).json({ message: 'User already has a pending reservation for this book' });
      }
      
      // Set expiry date (default: 7 days from now)
      const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      
      // Create reservation
      const reservationId = await ReservationModel.create(reserverId, bookId, expiryDate);
      
      res.status(201).json({
        message: 'Reservation created successfully',
        reservationId,
        expiryDate
      });
    } catch (error) {
      console.error('Error creating reservation:', error);
      res.status(500).json({ message: 'Error creating reservation' });
    }
  },

  // Update reservation status
  updateReservationStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      // Check if reservation exists
      const reservation = await ReservationModel.getById(id);
      if (!reservation) {
        return res.status(404).json({ message: 'Reservation not found' });
      }
      
      // Check if user can update status (user's own reservation or admin/librarian)
      if (reservation.UserID !== req.user.UserID && 
          req.user.Role !== 'Admin' && 
          req.user.Role !== 'Librarian') {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // Check if status is valid
      const validStatuses = ['Pending', 'Fulfilled', 'Cancelled', 'Expired'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
      
      // Update status
      const updated = await ReservationModel.updateStatus(id, status);
      
      if (!updated) {
        return res.status(400).json({ message: 'Failed to update reservation' });
      }
      
      res.json({ message: 'Reservation updated successfully' });
    } catch (error) {
      console.error('Error updating reservation:', error);
      res.status(500).json({ message: 'Error updating reservation' });
    }
  },

  // Cancel reservation
  cancelReservation: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check if reservation exists
      const reservation = await ReservationModel.getById(id);
      if (!reservation) {
        return res.status(404).json({ message: 'Reservation not found' });
      }
      
      // Check if user can cancel (user's own reservation or admin/librarian)
      if (reservation.UserID !== req.user.UserID && 
          req.user.Role !== 'Admin' && 
          req.user.Role !== 'Librarian') {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // Check if reservation is already fulfilled or cancelled
      if (reservation.Status !== 'Pending') {
        return res.status(400).json({ message: `Reservation is already ${reservation.Status.toLowerCase()}` });
      }
      
      // Update status to Cancelled
      const updated = await ReservationModel.updateStatus(id, 'Cancelled');
      
      if (!updated) {
        return res.status(400).json({ message: 'Failed to cancel reservation' });
      }
      
      res.json({ message: 'Reservation cancelled successfully' });
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      res.status(500).json({ message: 'Error cancelling reservation' });
    }
  }
};

module.exports = ReservationController;