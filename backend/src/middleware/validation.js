const { body, param, query, validationResult } = require('express-validator');

/**
 * Validation middleware using express-validator
 * Provides comprehensive input validation and sanitization
 */

/**
 * Middleware to handle validation errors
 * Checks validation results and returns formatted error response
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors
    });
  }
  
  next();
};

/**
 * User registration validation
 */
const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .toLowerCase(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('skillsOffered')
    .isArray({ min: 1 })
    .withMessage('At least one skill offered is required')
    .custom((skills) => {
      if (skills.some(skill => typeof skill !== 'string' || skill.trim().length === 0)) {
        throw new Error('All skills must be non-empty strings');
      }
      if (skills.length > 10) {
        throw new Error('Maximum 10 skills allowed');
      }
      return true;
    }),
  
  body('skillsWanted')
    .isArray({ min: 1 })
    .withMessage('At least one skill wanted is required')
    .custom((skills) => {
      if (skills.some(skill => typeof skill !== 'string' || skill.trim().length === 0)) {
        throw new Error('All skills must be non-empty strings');
      }
      if (skills.length > 10) {
        throw new Error('Maximum 10 skills allowed');
      }
      return true;
    }),
  
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters'),
  
  body('availability')
    .optional()
    .isArray()
    .withMessage('Availability must be an array')
    .custom((availability) => {
      const validOptions = ['weekdays', 'weekends', 'mornings', 'afternoons', 'evenings', 'flexible'];
      if (availability.some(option => !validOptions.includes(option))) {
        throw new Error('Invalid availability option');
      }
      return true;
    }),
  
  handleValidationErrors
];

/**
 * User login validation
 */
const validateUserLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .toLowerCase(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

/**
 * User profile update validation
 */
const validateUserUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .toLowerCase(),
  
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters'),
  
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  
  body('availability')
    .optional()
    .isArray()
    .withMessage('Availability must be an array')
    .custom((availability) => {
      const validOptions = ['weekdays', 'weekends', 'mornings', 'afternoons', 'evenings', 'flexible'];
      if (availability.some(option => !validOptions.includes(option))) {
        throw new Error('Invalid availability option');
      }
      return true;
    }),
  
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
  
  handleValidationErrors
];

/**
 * Skills update validation
 */
const validateSkillsUpdate = [
  body('skillsOffered')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one skill offered is required')
    .custom((skills) => {
      if (skills.some(skill => typeof skill !== 'string' || skill.trim().length === 0)) {
        throw new Error('All skills must be non-empty strings');
      }
      if (skills.length > 10) {
        throw new Error('Maximum 10 skills allowed');
      }
      return true;
    }),
  
  body('skillsWanted')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one skill wanted is required')
    .custom((skills) => {
      if (skills.some(skill => typeof skill !== 'string' || skill.trim().length === 0)) {
        throw new Error('All skills must be non-empty strings');
      }
      if (skills.length > 10) {
        throw new Error('Maximum 10 skills allowed');
      }
      return true;
    }),
  
  handleValidationErrors
];

/**
 * Swap creation validation
 */
const validateSwapCreation = [
  body('receiver')
    .isMongoId()
    .withMessage('Valid receiver ID is required'),
  
  body('requestedSkill')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Requested skill must be between 1 and 100 characters'),
  
  body('offeredSkill')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Offered skill must be between 1 and 100 characters'),
  
  body('message')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Message cannot exceed 500 characters'),
  
  body('meetingType')
    .optional()
    .isIn(['online', 'in-person', 'hybrid'])
    .withMessage('Invalid meeting type'),
  
  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Location cannot exceed 200 characters'),
  
  body('proposedDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format')
    .custom((date) => {
      if (new Date(date) <= new Date()) {
        throw new Error('Proposed date must be in the future');
      }
      return true;
    }),
  
  handleValidationErrors
];

/**
 * Rating creation validation
 */
const validateRatingCreation = [
  body('swap')
    .isMongoId()
    .withMessage('Valid swap ID is required'),
  
  body('reviewee')
    .isMongoId()
    .withMessage('Valid reviewee ID is required'),
  
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
  
  body('feedback')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Feedback cannot exceed 1000 characters'),
  
  body('categories.communication')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Communication rating must be between 1 and 5'),
  
  body('categories.skillLevel')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Skill level rating must be between 1 and 5'),
  
  body('categories.punctuality')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Punctuality rating must be between 1 and 5'),
  
  body('categories.helpfulness')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Helpfulness rating must be between 1 and 5'),
  
  body('wouldRecommend')
    .optional()
    .isBoolean()
    .withMessage('wouldRecommend must be a boolean'),
  
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
  
  body('isAnonymous')
    .optional()
    .isBoolean()
    .withMessage('isAnonymous must be a boolean'),
  
  handleValidationErrors
];

/**
 * Admin message creation validation
 */
const validateAdminMessage = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  
  body('message')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message must be between 1 and 2000 characters'),
  
  body('type')
    .optional()
    .isIn(['announcement', 'maintenance', 'update', 'warning', 'promotion'])
    .withMessage('Invalid message type'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority level'),
  
  body('targetUserType')
    .optional()
    .isIn(['all', 'active', 'inactive', 'new', 'premium', 'specific'])
    .withMessage('Invalid target user type'),
  
  body('targetUsers')
    .optional()
    .isArray()
    .withMessage('Target users must be an array')
    .custom((users) => {
      if (users.some(userId => !userId.match(/^[0-9a-fA-F]{24}$/))) {
        throw new Error('All target user IDs must be valid MongoDB ObjectIds');
      }
      return true;
    }),
  
  body('scheduledAt')
    .optional()
    .isISO8601()
    .withMessage('Invalid scheduled date format'),
  
  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Invalid expiration date format')
    .custom((date, { req }) => {
      const scheduledAt = req.body.scheduledAt || new Date();
      if (new Date(date) <= new Date(scheduledAt)) {
        throw new Error('Expiration date must be after scheduled date');
      }
      return true;
    }),
  
  handleValidationErrors
];

/**
 * MongoDB ObjectId validation
 */
const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  
  handleValidationErrors
];

/**
 * Pagination validation
 */
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('sort')
    .optional()
    .isIn(['createdAt', '-createdAt', 'updatedAt', '-updatedAt', 'name', '-name', 'rating', '-rating'])
    .withMessage('Invalid sort option'),
  
  handleValidationErrors
];

/**
 * Search validation
 */
const validateSearch = [
  query('skill')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search skill must be between 1 and 100 characters'),
  
  query('location')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search location must be between 1 and 100 characters'),
  
  query('availability')
    .optional()
    .isIn(['weekdays', 'weekends', 'mornings', 'afternoons', 'evenings', 'flexible'])
    .withMessage('Invalid availability option'),
  
  handleValidationErrors
];

/**
 * Password change validation
 */
const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    }),
  
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validateSkillsUpdate,
  validateSwapCreation,
  validateRatingCreation,
  validateAdminMessage,
  validateObjectId,
  validatePagination,
  validateSearch,
  validatePasswordChange
};