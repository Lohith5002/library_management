// src/routes/users.js
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { auth, isAdmin } = require('../middleware/auth');

// Get all users - admin only
router.get('/', auth, isAdmin, UserController.getAllUsers);

// Get user by ID - auth required
router.get('/:id', auth, UserController.getUserById);

// Update user - auth required
router.put('/:id', auth, UserController.updateUser);

// Delete user - admin only
router.delete('/:id', auth, isAdmin, UserController.deleteUser);

module.exports = router;