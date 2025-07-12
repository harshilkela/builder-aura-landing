const express = require('express');
const {
  getDashboardStats,
  getAllSwaps,
  banUser,
  unbanUser,
  createAdminMessage,
  getAdminMessages,
  updateAdminMessage,
  sendAdminMessage,
  generateUserActivityReport,
  generateSwapStatsReport,
  generateFeedbackReport,
  getFlaggedRatings,
  approveRating
} = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');
const {
  validateAdminMessage,
  validateObjectId,
  validatePagination
} = require('../middleware/validation');

const router = express.Router();

/**
 * Admin Routes
 * Routes for administrative functions and platform management
 */

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// Dashboard and overview
router.get('/dashboard', getDashboardStats);

// User management
router.put('/users/:id/ban', validateObjectId, banUser);
router.put('/users/:id/unban', validateObjectId, unbanUser);

// Swap management
router.get('/swaps', validatePagination, getAllSwaps);

// Platform messaging
router.post('/messages', validateAdminMessage, createAdminMessage);
router.get('/messages', validatePagination, getAdminMessages);
router.put('/messages/:id', validateObjectId, updateAdminMessage);
router.post('/messages/:id/send', validateObjectId, sendAdminMessage);

// Rating moderation
router.get('/ratings/flagged', validatePagination, getFlaggedRatings);
router.put('/ratings/:id/approve', validateObjectId, approveRating);

// Reports and analytics
router.get('/reports/user-activity', generateUserActivityReport);
router.get('/reports/swap-stats', generateSwapStatsReport);
router.get('/reports/feedback', generateFeedbackReport);

module.exports = router;