import { body, param, query } from 'express-validator';

// User validation rules
export const validateUserRegistration = [
  body('username')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('firstName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters')
    .trim(),
  
  body('lastName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters')
    .trim()
];

export const validateUserLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

export const validateUserUpdate = [
  body('username')
    .optional()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('firstName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters')
    .trim(),
  
  body('lastName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters')
    .trim(),
  
  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar must be a valid URL')
];

// Product validation rules
export const validateProductCreation = [
  body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage('Product name is required and cannot exceed 100 characters')
    .trim(),
  
  body('description')
    .isLength({ min: 1, max: 500 })
    .withMessage('Description is required and cannot exceed 500 characters')
    .trim(),
  
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('category')
    .isLength({ min: 1 })
    .withMessage('Category is required')
    .trim(),
  
  body('stock')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  
  body('images.*')
    .optional()
    .isURL()
    .withMessage('Each image must be a valid URL'),
  
  body('brand')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Brand name cannot exceed 50 characters')
    .trim(),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .isString()
    .withMessage('Each tag must be a string')
    .trim()
];

export const validateProductUpdate = [
  body('name')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Product name cannot exceed 100 characters')
    .trim(),
  
  body('description')
    .optional()
    .isLength({ min: 1, max: 500 })
    .withMessage('Description cannot exceed 500 characters')
    .trim(),
  
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('category')
    .optional()
    .isLength({ min: 1 })
    .withMessage('Category cannot be empty')
    .trim(),
  
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  
  body('images.*')
    .optional()
    .isURL()
    .withMessage('Each image must be a valid URL'),
  
  body('brand')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Brand name cannot exceed 50 characters')
    .trim(),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .isString()
    .withMessage('Each tag must be a string')
    .trim(),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

// Parameter validation
export const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format')
];

// Query validation
export const validatePagination = [
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
    .isIn(['name', 'price', 'createdAt', 'rating.average'])
    .withMessage('Sort field must be one of: name, price, createdAt, rating.average'),
  
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Order must be either asc or desc')
];

export const validateProductFilters = [
  query('category')
    .optional()
    .isLength({ min: 1 })
    .withMessage('Category cannot be empty')
    .trim(),
  
  query('search')
    .optional()
    .isLength({ min: 1 })
    .withMessage('Search term cannot be empty')
    .trim(),
  
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a non-negative number'),
  
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a non-negative number')
];