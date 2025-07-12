const express = require('express');
const {
  createSwap,
  getUserSwaps,
  getSwapById,
  acceptSwap,
  rejectSwap,
  cancelSwap,
  completeSwap,
  getUserSwapStats,
  updateSwap
} = require('../controllers/swapController');
const { authenticate } = require('../middleware/auth');
const {
  validateSwapCreation,
  validateObjectId,
  validatePagination
} = require('../middleware/validation');

const router = express.Router();

/**
 * Swap Routes
 * Routes for managing skill swap requests and interactions
 */

// All swap routes require authentication
router.use(authenticate);

// Swap management routes
router.post('/', validateSwapCreation, createSwap);
router.get('/', validatePagination, getUserSwaps);
router.get('/stats', getUserSwapStats);
router.get('/:id', validateObjectId, getSwapById);
router.put('/:id', validateObjectId, updateSwap);
router.delete('/:id', validateObjectId, cancelSwap);

// Swap status management
router.put('/:id/accept', validateObjectId, acceptSwap);
router.put('/:id/reject', validateObjectId, rejectSwap);
router.put('/:id/complete', validateObjectId, completeSwap);

module.exports = router;