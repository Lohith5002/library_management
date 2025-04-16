// src/controllers/reportController.js
const ReportModel = require('../models/report');

const ReportController = {
  // Get all reports
 // Get all reports
getAllReports: async (req, res) => {
  try {
    // Extract filter parameters from query
    const { reportType, adminId, startDate, endDate } = req.query;
    const filters = { reportType, adminId, startDate, endDate };
    
    const reports = await ReportModel.getAll(filters);
    
    // Include ReportData in the response
    const reportsWithData = reports.map((report) => ({
      ...report,
      reportData: JSON.parse(report.ReportData),  // Assuming ReportData is stored as a JSON string
    }));
    
    res.json({ reports: reportsWithData });
  } catch (error) {
    console.error('Error getting reports:', error);
    res.status(500).json({ message: 'Error fetching reports' });
  }
},

// Get report by ID
getReportById: async (req, res) => {
  try {
    const reportId = req.params.id;
    const report = await ReportModel.getById(reportId);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    // Include ReportData in the response
    const reportWithData = {
      ...report,
      reportData: JSON.parse(report.ReportData),  // Assuming ReportData is stored as a JSON string
    };
    
    res.json({ report: reportWithData });
  } catch (error) {
    console.error('Error getting report:', error);
    res.status(500).json({ message: 'Error fetching report' });
  }
},


  // Generate and save book inventory report
  generateBookInventoryReport: async (req, res) => {
    try {
      // Generate report data
      const reportData = await ReportModel.generateBookInventoryReport();
      
      // Save report to database
      const reportId = await ReportModel.create({
        reportType: 'Book Inventory',
        adminId: req.user.UserID,
        reportData
      });
      
      res.status(201).json({
        message: 'Book inventory report generated successfully',
        reportId,
        reportData
      });
    } catch (error) {
      console.error('Error generating book inventory report:', error);
      res.status(500).json({ message: 'Error generating report' });
    }
  },

  // Generate and save user activity report
  generateUserActivityReport: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      // Generate report data
      const reportData = await ReportModel.generateUserActivityReport(startDate, endDate);
      
      // Save report to database
      const reportId = await ReportModel.create({
        reportType: 'User Activity',
        adminId: req.user.UserID,
        reportData
      });
      
      res.status(201).json({
        message: 'User activity report generated successfully',
        reportId,
        reportData
      });
    } catch (error) {
      console.error('Error generating user activity report:', error);
      res.status(500).json({ message: 'Error generating report' });
    }
  },

  // Generate and save fine collection report
  generateFineCollectionReport: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      // Generate report data
      const reportData = await ReportModel.generateFineCollectionReport(startDate, endDate);
      
      // Save report to database
      const reportId = await ReportModel.create({
        reportType: 'Fine Collection',
        adminId: req.user.UserID,
        reportData
      });
      
      res.status(201).json({
        message: 'Fine collection report generated successfully',
        reportId,
        reportData
      });
    } catch (error) {
      console.error('Error generating fine collection report:', error);
      res.status(500).json({ message: 'Error generating report' });
    }
  },

  // Generate and save book circulation report
  generateBookCirculationReport: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      // Generate report data
      const reportData = await ReportModel.generateBookCirculationReport(startDate, endDate);
      
      // Save report to database
      const reportId = await ReportModel.create({
        reportType: 'Book Circulation',
        adminId: req.user.UserID,
        reportData
      });
      
      res.status(201).json({
        message: 'Book circulation report generated successfully',
        reportId,
        reportData
      });
    } catch (error) {
      console.error('Error generating book circulation report:', error);
      res.status(500).json({ message: 'Error generating report' });
    }
  },

  // Delete report
  deleteReport: async (req, res) => {
    try {
      const reportId = req.params.id;
      
      // Check if report exists
      const report = await ReportModel.getById(reportId);
      
      if (!report) {
        return res.status(404).json({ message: 'Report not found' });
      }
      
      // Delete report
      const deleted = await ReportModel.delete(reportId);
      
      if (!deleted) {
        return res.status(400).json({ message: 'Failed to delete report' });
      }
      
      res.json({ message: 'Report deleted successfully' });
    } catch (error) {
      console.error('Error deleting report:', error);
      res.status(500).json({ message: 'Error deleting report' });
    }
  }
};

module.exports = ReportController;