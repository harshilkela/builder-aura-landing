const express = require('express');
const {
  register,
  login,
  getMe,
  updatePassword,
  forgotPassword,
  refreshToken,
  logout,
  deleteAccount,
  checkEmailAvailability,
  verifyAccount
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const {
  validateUserRegistration,
  validateUserLogin,
  validatePasswordChange
} = require('../middleware/validation');

const router = express.Router();

/**
 * Authentication Routes
 * All routes for user authentication and account management
 */

// Public routes
router.post('/register', validateUserRegistration, register);
router.post('/login', validateUserLogin, login);
router.post('/forgot-password', forgotPassword);
router.get('/check-email/:email', checkEmailAvailability);
router.get('/verify/:token', verifyAccount);

// Protected routes (require authentication)
router.use(authenticate); // All routes below this require authentication

router.get('/me', getMe);
router.put('/password', validatePasswordChange, updatePassword);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.delete('/account', deleteAccount);

module.exports = router;