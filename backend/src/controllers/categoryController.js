// src/controllers/categoryController.js
const CategoryModel = require('../models/category');

const CategoryController = {
  // Get all categories
  getAllCategories: async (req, res) => {
    try {
      const categories = await CategoryModel.getAll();
      res.json({ categories });
    } catch (error) {
      console.error('Error getting categories:', error);
      res.status(500).json({ message: 'Error fetching categories' });
    }
  },

  // Get category by ID
  getCategoryById: async (req, res) => {
    try {
      const categoryId = req.params.id;
      const category = await CategoryModel.getById(categoryId);
      
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      
      res.json({ category });
    } catch (error) {
      console.error('Error getting category:', error);
      res.status(500).json({ message: 'Error fetching category' });
    }
  },

  // Create new category
  createCategory: async (req, res) => {
    try {
      const { categoryName, description } = req.body;
      
      if (!categoryName) {
        return res.status(400).json({ message: 'Category name is required' });
      }
      
      const categoryId = await CategoryModel.create({ categoryName, description });
      
      res.status(201).json({
        message: 'Category created successfully',
        categoryId
      });
    } catch (error) {
      console.error('Error creating category:', error);
      res.status(500).json({ message: 'Error creating category' });
    }
  },

  // Update category
  updateCategory: async (req, res) => {
    try {
      const categoryId = req.params.id;
      const { categoryName, description } = req.body;
      
      // Check if category exists
      const category = await CategoryModel.getById(categoryId);
      
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      
      const updated = await CategoryModel.update(categoryId, { categoryName, description });
      
      if (!updated) {
        return res.status(400).json({ message: 'Failed to update category' });
      }
      
      res.json({ message: 'Category updated successfully' });
    } catch (error) {
      console.error('Error updating category:', error);
      res.status(500).json({ message: 'Error updating category' });
    }
  },

  // Delete category
  deleteCategory: async (req, res) => {
    try {
      const categoryId = req.params.id;
      
      // Check if category exists
      const category = await CategoryModel.getById(categoryId);
      
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      
      // Check if category has books
      const books = await CategoryModel.getBooks(categoryId);
      
      if (books.length > 0) {
        return res.status(400).json({ 
          message: 'Cannot delete category with associated books',
          count: books.length
        });
      }
      
      const deleted = await CategoryModel.delete(categoryId);
      
      if (!deleted) {
        return res.status(400).json({ message: 'Failed to delete category' });
      }
      
      res.json({ message: 'Category deleted successfully' });
    } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({ message: 'Error deleting category' });
    }
  },

  // Get books by category
  getCategoryBooks: async (req, res) => {
    try {
      const categoryId = req.params.id;
      
      // Check if category exists
      const category = await CategoryModel.getById(categoryId);
      
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      
      const books = await CategoryModel.getBooks(categoryId);
      
      res.json({
        category,
        books
      });
    } catch (error) {
      console.error('Error getting category books:', error);
      res.status(500).json({ message: 'Error fetching category books' });
    }
  }
};

module.exports = CategoryController;