const express = require('express');
const {
  createRating,
  getUserRatings,
  getUserRatingStats,
  getRatingsGiven,
  getRatingsReceived,
  getRatingById,
  updateRating,
  deleteRating,
  flagRating,
  getRatingTrends
} = require('../controllers/ratingController');
const { authenticate, authorize } = require('../middleware/auth');
const {
  validateRatingCreation,
  validateObjectId,
  validatePagination
} = require('../middleware/validation');

const router = express.Router();

/**
 * Rating Routes
 * Routes for managing user ratings and feedback
 */

// Public routes (no authentication required)
router.get('/user/:userId', validateObjectId, validatePagination, getUserRatings);
router.get('/user/:userId/stats', validateObjectId, getUserRatingStats);

// Protected routes (require authentication)
router.use(authenticate);

// Rating management
router.post('/', validateRatingCreation, createRating);
router.get('/given', validatePagination, getRatingsGiven);
router.get('/received', validatePagination, getRatingsReceived);
router.get('/:id', validateObjectId, getRatingById);
router.put('/:id', validateObjectId, updateRating);
router.delete('/:id', validateObjectId, deleteRating);

// Rating moderation
router.post('/:id/flag', validateObjectId, flagRating);

// Admin only routes
router.get('/trends', authorize('admin'), getRatingTrends);

module.exports = router;