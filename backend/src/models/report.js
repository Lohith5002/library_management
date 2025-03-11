// src/models/report.js
const { pool } = require('../config/db');

const ReportModel = {
  // Get all reports
  getAll: async (filters = {}) => {
    let query = `
      SELECT r.*, u.Name as AdminName
      FROM reports r
      JOIN users u ON r.AdminID = u.UserID
      WHERE 1=1
    `;
    
    const queryParams = [];
    
    // Apply filters
    if (filters.reportType) {
      query += ' AND r.ReportType = ?';
      queryParams.push(filters.reportType);
    }
    
    if (filters.adminId) {
      query += ' AND r.AdminID = ?';
      queryParams.push(filters.adminId);
    }
    
    if (filters.startDate && filters.endDate) {
      query += ' AND r.GeneratedDate BETWEEN ? AND ?';
      queryParams.push(filters.startDate, filters.endDate);
    }
    
    // Order by most recent first
    query += ' ORDER BY r.GeneratedDate DESC';
    
    const [rows] = await pool.query(query, queryParams);
    return rows;
  },

  // Get report by ID
  getById: async (id) => {
    const [rows] = await pool.query(
      `SELECT r.*, u.Name as AdminName
       FROM reports r
       JOIN users u ON r.AdminID = u.UserID
       WHERE r.ReportID = ?`,
      [id]
    );
    return rows[0];
  },

  // Create new report
  create: async (reportData) => {
    const { reportType, adminId, reportData: data } = reportData;
    
    const [result] = await pool.query(
      `INSERT INTO reports (ReportType, AdminID, ReportData)
       VALUES (?, ?, ?)`,
      [reportType, adminId, JSON.stringify(data)]
    );
    
    return result.insertId;
  },

  // Update report
  update: async (id, reportData) => {
    const { reportData: data } = reportData;
    
    const [result] = await pool.query(
      `UPDATE reports SET ReportData = ?, UpdatedAt = CURRENT_TIMESTAMP
       WHERE ReportID = ?`,
      [JSON.stringify(data), id]
    );
    
    return result.affectedRows > 0;
  },

  // Delete report
  delete: async (id) => {
    const [result] = await pool.query('DELETE FROM reports WHERE ReportID = ?', [id]);
    return result.affectedRows > 0;
  },

  // Generate book inventory report
  generateBookInventoryReport: async () => {
    const [books] = await pool.query(`
      SELECT b.*, c.CategoryName,
             (b.TotalCopies - b.AvailableCopies) as CheckedOutCopies
      FROM books b
      LEFT JOIN categories c ON b.CategoryID = c.CategoryID
      ORDER BY b.Title
    `);
    
    // Get category statistics
    const [categoryStats] = await pool.query(`
      SELECT c.CategoryName, 
             COUNT(b.BookID) as TotalBooks,
             SUM(b.TotalCopies) as TotalCopies,
             SUM(b.AvailableCopies) as AvailableCopies
      FROM categories c
      LEFT JOIN books b ON c.CategoryID = b.CategoryID
      GROUP BY c.CategoryID
      ORDER BY c.CategoryName
    `);
    
    // Get overall statistics
    const [overallStats] = await pool.query(`
      SELECT COUNT(*) as TotalBooks,
             SUM(TotalCopies) as TotalCopies,
             SUM(AvailableCopies) as AvailableCopies,
             SUM(TotalCopies - AvailableCopies) as CheckedOutCopies
      FROM books
    `);
    
    return {
      books,
      categoryStats,
      overallStats: overallStats[0],
      generatedAt: new Date()
    };
  },

  // Generate user activity report
  generateUserActivityReport: async (startDate, endDate) => {
    const dateFilter = startDate && endDate 
      ? `AND (t.BorrowDate BETWEEN ? AND ? OR t.ReturnDate BETWEEN ? AND ?)`
      : '';
    
    const params = startDate && endDate 
      ? [startDate, endDate, startDate, endDate]
      : [];
    
    // Get transactions data
    const [transactions] = await pool.query(`
      SELECT t.*, b.Title as BookTitle, u.Name as UserName, u.Role as UserRole
      FROM transactions t
      JOIN books b ON t.BookID = b.BookID
      JOIN users u ON t.UserID = u.UserID
      WHERE 1=1 ${dateFilter}
      ORDER BY t.BorrowDate DESC
    `, params);
    
    // Get top active users
    const [activeUsers] = await pool.query(`
      SELECT u.UserID, u.Name, u.Role, COUNT(t.TransactionID) as TransactionCount
      FROM users u
      LEFT JOIN transactions t ON u.UserID = t.UserID
      ${startDate && endDate ? `WHERE (t.BorrowDate BETWEEN ? AND ? OR t.ReturnDate BETWEEN ? AND ?)` : ''}
      GROUP BY u.UserID
      ORDER BY TransactionCount DESC
      LIMIT 10
    `, params);
    
    // Get most borrowed books
    const [popularBooks] = await pool.query(`
      SELECT b.BookID, b.Title, b.Author, COUNT(t.TransactionID) as BorrowCount
      FROM books b
      LEFT JOIN transactions t ON b.BookID = t.BookID
      ${startDate && endDate ? `WHERE (t.BorrowDate BETWEEN ? AND ? OR t.ReturnDate BETWEEN ? AND ?)` : ''}
      GROUP BY b.BookID
      ORDER BY BorrowCount DESC
      LIMIT 10
    `, params);
    
    return {
      transactions,
      activeUsers,
      popularBooks,
      period: { startDate, endDate },
      generatedAt: new Date()
    };
  },

  // Generate fine collection report
  generateFineCollectionReport: async (startDate, endDate) => {
    const dateFilter = startDate && endDate 
      ? `WHERE p.PaymentDate BETWEEN ? AND ?`
      : '';
    
    const params = startDate && endDate 
      ? [startDate, endDate]
      : [];
    
    // Get fine payments
    const [payments] = await pool.query(`
      SELECT p.*, u.Name as UserName, t.TransactionID,
             b.Title as BookTitle
      FROM payments p
      JOIN users u ON p.UserID = u.UserID
      LEFT JOIN transactions t ON p.TransactionID = t.TransactionID
      LEFT JOIN books b ON t.BookID = b.BookID
      ${dateFilter}
      ORDER BY p.PaymentDate DESC
    `, params);
    
    // Get summary statistics
    const [summary] = await pool.query(`
      SELECT COUNT(*) as TotalPayments,
             SUM(AmountPaid) as TotalCollected,
             AVG(AmountPaid) as AveragePayment,
             MAX(AmountPaid) as LargestPayment
      FROM payments
      ${dateFilter}
    `, params);
    
    // Get payment method breakdown
    const [paymentMethods] = await pool.query(`
      SELECT PaymentMethod, COUNT(*) as Count, SUM(AmountPaid) as TotalAmount
      FROM payments
      ${dateFilter}
      GROUP BY PaymentMethod
    `, params);
    
    // Get pending fines data
    const [pendingFines] = await pool.query(`
      SELECT f.*, u.Name as UserName, t.TransactionID,
             b.Title as BookTitle
      FROM fines f
      JOIN users u ON f.UserID = u.UserID
      JOIN transactions t ON f.TransactionID = t.TransactionID
      JOIN books b ON t.BookID = b.BookID
      WHERE f.Status = 'Unpaid'
      ORDER BY f.Amount DESC
    `);
    
    return {
      payments,
      summary: summary[0],
      paymentMethods,
      pendingFines,
      period: { startDate, endDate },
      generatedAt: new Date()
    };
  },

  // Generate book circulation report
  generateBookCirculationReport: async (startDate, endDate) => {
    const dateFilter = startDate && endDate 
      ? `WHERE t.BorrowDate BETWEEN ? AND ?`
      : '';
    
    const params = startDate && endDate 
      ? [startDate, endDate]
      : [];
    
    // Get circulation by day
    const [dailyCirculation] = await pool.query(`
      SELECT DATE(t.BorrowDate) as Date, COUNT(*) as CheckoutCount
      FROM transactions t
      ${dateFilter}
      GROUP BY DATE(t.BorrowDate)
      ORDER BY Date
    `, params);
    
    // Get circulation by category
    const [categoryCirculation] = await pool.query(`
      SELECT c.CategoryName, COUNT(t.TransactionID) as CheckoutCount
      FROM categories c
      LEFT JOIN books b ON c.CategoryID = b.CategoryID
      LEFT JOIN transactions t ON b.BookID = t.BookID
      ${dateFilter ? `AND ${dateFilter.substring(6)}` : ''}
      GROUP BY c.CategoryID
      ORDER BY CheckoutCount DESC
    `, params);
    
    // Get average checkout duration
    const [avgDuration] = await pool.query(`
      SELECT AVG(DATEDIFF(IFNULL(t.ReturnDate, CURRENT_TIMESTAMP), t.BorrowDate)) as AvgDays
      FROM transactions t
      ${dateFilter}
    `, params);
    
    // Get overdue books statistics
    const [overdueStats] = await pool.query(`
      SELECT COUNT(*) as OverdueCount,
             AVG(DATEDIFF(CURRENT_TIMESTAMP, t.DueDate)) as AvgDaysOverdue
      FROM transactions t
      WHERE t.Status = 'Overdue' OR (t.DueDate < CURRENT_TIMESTAMP AND t.ReturnDate IS NULL)
      ${startDate && endDate ? `AND t.BorrowDate BETWEEN ? AND ?` : ''}
    `, params);
    
    return {
      dailyCirculation,
      categoryCirculation,
      avgDuration: avgDuration[0],
      overdueStats: overdueStats[0],
      period: { startDate, endDate },
      generatedAt: new Date()
    };
  }
};

module.exports = ReportModel;