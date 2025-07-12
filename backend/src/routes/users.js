const express = require('express');
const {
  getUserProfile,
  updateUserProfile,
  updateUserSkills,
  searchUsers,
  getUsersBySkill,
  getUserStats,
  getAllUsers,
  deleteUser,
  getUserSkillsSummary
} = require('../controllers/userController');
const { authenticate, authorize, optionalAuth, checkProfileAccess } = require('../middleware/auth');
const {
  validateUserUpdate,
  validateSkillsUpdate,
  validateObjectId,
  validatePagination,
  validateSearch
} = require('../middleware/validation');

const router = express.Router();

/**
 * User Routes
 * Routes for user profile management and user discovery
 */

// Public routes (no authentication required)
router.get('/search', validateSearch, validatePagination, optionalAuth, searchUsers);
router.get('/by-skill/:skill', validatePagination, getUsersBySkill);

// Mixed access routes (authentication optional or conditional)
router.get('/:id', validateObjectId, optionalAuth, checkProfileAccess, getUserProfile);
router.get('/:id/stats', validateObjectId, optionalAuth, getUserStats);
router.get('/:id/skills-summary', validateObjectId, optionalAuth, getUserSkillsSummary);

// Protected routes (require authentication)
router.use(authenticate); // All routes below this require authentication

// User profile management
router.put('/:id', validateObjectId, validateUserUpdate, updateUserProfile);
router.put('/:id/skills', validateObjectId, validateSkillsUpdate, updateUserSkills);

// Admin only routes
router.get('/', authorize('admin'), validatePagination, getAllUsers);
router.delete('/:id', validateObjectId, authorize('admin'), deleteUser);

module.exports = router;