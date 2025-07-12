import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware to authenticate JWT token
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by ID
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - user not found'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Attach user info to request
    req.user = {
      userId: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

// Middleware to check if user is admin
export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

// Middleware to check if user owns the resource or is admin
export const requireOwnershipOrAdmin = (resourceIdField = 'id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[resourceIdField];
      const userId = req.user.userId;
      const userRole = req.user.role;

      // Allow if user is admin
      if (userRole === 'admin') {
        return next();
      }

      // Check ownership based on the resource
      // This is a generic middleware, specific ownership checks 
      // should be done in the controllers
      req.checkOwnership = {
        resourceId,
        userId,
        isAdmin: userRole === 'admin'
      };

      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error in ownership check'
      });
    }
  };
};