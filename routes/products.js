import express from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getProductCategories,
  updateProductStock
} from '../controllers/productController.js';
import { authenticateToken } from '../middleware/auth.js';
import {
  validateProductCreation,
  validateProductUpdate,
  validateObjectId,
  validatePagination,
  validateProductFilters
} from '../middleware/validation.js';

const router = express.Router();

// @route   GET /api/products/categories
// @desc    Get all product categories
// @access  Public
router.get('/categories', getProductCategories);

// @route   GET /api/products/category/:category
// @desc    Get products by category
// @access  Public
router.get('/category/:category', validatePagination, getProductsByCategory);

// @route   GET /api/products
// @desc    Get all products with optional filters
// @access  Public
router.get('/', validatePagination, validateProductFilters, getAllProducts);

// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Public
router.get('/:id', validateObjectId, getProductById);

// @route   POST /api/products
// @desc    Create new product
// @access  Private
router.post('/', authenticateToken, validateProductCreation, createProduct);

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private
router.put('/:id', authenticateToken, validateObjectId, validateProductUpdate, updateProduct);

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private
router.delete('/:id', authenticateToken, validateObjectId, deleteProduct);

// @route   PATCH /api/products/:id/stock
// @desc    Update product stock
// @access  Private
router.patch('/:id/stock', authenticateToken, validateObjectId, updateProductStock);

export default router;