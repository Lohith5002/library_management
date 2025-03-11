// src/controllers/bookController.js
const BookModel = require('../models/book');

const BookController = {
  // Get all books
  getAllBooks: async (req, res) => {
    try {
      // Extract filter parameters from query
      const { title, author, category, available } = req.query;
      const filters = { title, author, category, available: available === 'true' };
      
      const books = await BookModel.getAll(filters);
      res.json({ books });
    } catch (error) {
      console.error('Error getting books:', error);
      res.status(500).json({ message: 'Error fetching books' });
    }
  },

  // Get book by ID
  getBookById: async (req, res) => {
    try {
      const bookId = req.params.id;
      const book = await BookModel.getById(bookId);
      
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }
      
      res.json({ book });
    } catch (error) {
      console.error('Error getting book:', error);
      res.status(500).json({ message: 'Error fetching book' });
    }
  },

  // Create new book
  createBook: async (req, res) => {
    try {
      const {
        title,
        author,
        isbn,
        publicationYear,
        publisher,
        totalCopies,
        categoryId
      } = req.body;
      
      // Validate required fields
      if (!title || !author) {
        return res.status(400).json({ message: 'Title and author are required' });
      }
      
      const bookId = await BookModel.create({
        title,
        author,
        isbn,
        publicationYear,
        publisher,
        totalCopies: totalCopies || 1,
        categoryId
      });
      
      res.status(201).json({
        message: 'Book created successfully',
        bookId
      });
    } catch (error) {
      console.error('Error creating book:', error);
      res.status(500).json({ message: 'Error creating book' });
    }
  },

  // Update book
  updateBook: async (req, res) => {
    try {
      const bookId = req.params.id;
      const {
        title,
        author,
        isbn,
        publicationYear,
        publisher,
        totalCopies,
        availableCopies,
        categoryId
      } = req.body;
      
      // Check if book exists
      const book = await BookModel.getById(bookId);
      
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }
      
      const updated = await BookModel.update(bookId, {
        title,
        author,
        isbn,
        publicationYear,
        publisher,
        totalCopies,
        availableCopies,
        categoryId
      });
      
      if (!updated) {
        return res.status(400).json({ message: 'Failed to update book' });
      }
      
      res.json({ message: 'Book updated successfully' });
    } catch (error) {
      console.error('Error updating book:', error);
      res.status(500).json({ message: 'Error updating book' });
    }
  },

  // Delete book
  deleteBook: async (req, res) => {
    try {
      const bookId = req.params.id;
      
      // Check if book exists
      const book = await BookModel.getById(bookId);
      
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }
      
      const deleted = await BookModel.delete(bookId);
      
      if (!deleted) {
        return res.status(400).json({ message: 'Failed to delete book' });
      }
      
      res.json({ message: 'Book deleted successfully' });
    } catch (error) {
      console.error('Error deleting book:', error);
      res.status(500).json({ message: 'Error deleting book' });
    }
  }
};

module.exports = BookController;