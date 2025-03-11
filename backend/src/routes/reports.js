// src/routes/reports.js
const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/reportController');
const { auth, isAdmin, isLibrarianOrAdmin } = require('../middleware/auth');

// All report routes require authentication
router.use(auth);

// Get all reports - admin/librarian only
router.get('/', isLibrarianOrAdmin, ReportController.getAllReports);

// Get report by ID - admin/librarian only
router.get('/:id', isLibrarianOrAdmin, ReportController.getReportById);

// Generate book inventory report - admin/librarian only
router.post('/book-inventory', isLibrarianOrAdmin, ReportController.generateBookInventoryReport);

// Generate user activity report - admin/librarian only
router.post('/user-activity', isLibrarianOrAdmin, ReportController.generateUserActivityReport);

// Generate fine collection report - admin/librarian only
router.post('/fine-collection', isLibrarianOrAdmin, ReportController.generateFineCollectionReport);

// Generate book circulation report - admin/librarian only
router.post('/book-circulation', isLibrarianOrAdmin, ReportController.generateBookCirculationReport);

// Delete report - admin only
router.delete('/:id', isAdmin, ReportController.deleteReport);

module.exports = router;