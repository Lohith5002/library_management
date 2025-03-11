// src/controllers/userController.js
const UserModel = require('../models/user');

const UserController = {
  // Get all users
  getAllUsers: async (req, res) => {
    try {
      const users = await UserModel.getAll();
      res.json({ users });
    } catch (error) {
      console.error('Error getting users:', error);
      res.status(500).json({ message: 'Error fetching users' });
    }
  },

  // Get user by ID
  getUserById: async (req, res) => {
    try {
      const userId = req.params.id;
      const user = await UserModel.getById(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json({ user });
    } catch (error) {
      console.error('Error getting user:', error);
      res.status(500).json({ message: 'Error fetching user' });
    }
  },

  // Update user
  updateUser: async (req, res) => {
    try {
      const userId = req.params.id;
      const { name, email, role } = req.body;
      
      // Check if user exists
      const user = await UserModel.getById(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Check if user is updating their own data or is an admin
      if (req.user.UserID !== parseInt(userId) && req.user.Role !== 'Admin') {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const updated = await UserModel.update(userId, { name, email, role });
      
      if (!updated) {
        return res.status(400).json({ message: 'Failed to update user' });
      }
      
      res.json({ message: 'User updated successfully' });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Error updating user' });
    }
  },

  // Delete user
  deleteUser: async (req, res) => {
    try {
      const userId = req.params.id;
      
      // Check if user exists
      const user = await UserModel.getById(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const deleted = await UserModel.delete(userId);
      
      if (!deleted) {
        return res.status(400).json({ message: 'Failed to delete user' });
      }
      
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Error deleting user' });
    }
  }
};

module.exports = UserController;