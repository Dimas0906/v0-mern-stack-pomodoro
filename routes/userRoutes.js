const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all routes
router.use(protect);

// Update profile
router.put(
  '/profile',
  [
    body('name').notEmpty().withMessage('Nama harus diisi'),
    body('email').isEmail().withMessage('Email tidak valid')
  ],
  userController.updateProfile
);

// Change password
router.put(
  '/change-password',
  [
    body('currentPassword').notEmpty().withMessage('Password saat ini harus diisi'),
    body('newPassword').isLength({ min: 6 }).withMessage('Password baru minimal 6 karakter')
  ],
  userController.changePassword
);

module.exports = router;