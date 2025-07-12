const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication middleware for protecting routes
 * Verifies JWT tokens and adds user information to request
 */

/**
 * Main authentication middleware
 * Verifies JWT token and adds user to request object
 */
const authenticate = async (req, res, next) => {
  try {
    let token;
    
    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    // Check for token in cookies (if using cookie-based auth)
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from database
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Token is valid but user not found'
        });
      }
      
      // Check if user is banned
      if (user.isBanned) {
        return res.status(403).json({
          success: false,
          message: 'Your account has been banned'
        });
      }
      
      // Check if user is active
      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Your account is inactive'
        });
      }
      
      // Check if password was changed after token was issued
      if (user.changedPasswordAfter(decoded.iat)) {
        return res.status(401).json({
          success: false,
          message: 'Password was changed recently. Please login again.'
        });
      }
      
      // Add user to request object
      req.user = user;
      next();
      
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expired. Please login again.'
        });
      } else if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token format'
        });
      } else {
        return res.status(401).json({
          success: false,
          message: 'Token verification failed'
        });
      }
    }
    
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication'
    });
  }
};

/**
 * Authorization middleware for role-based access control
 * Checks if user has required role(s)
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }
    
    next();
  };
};

/**
 * Optional authentication middleware
 * Adds user to request if token is valid, but doesn't require authentication
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    
    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    // Check for token in cookies
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (user && !user.isBanned && user.isActive && !user.changedPasswordAfter(decoded.iat)) {
          req.user = user;
        }
      } catch (error) {
        // Token is invalid, but we don't return an error
        // Just continue without setting req.user
      }
    }
    
    next();
  } catch (error) {
    console.error('Optional authentication error:', error);
    next();
  }
};

/**
 * Middleware to check if user owns the resource
 * Compares user ID with resource owner ID
 */
const checkOwnership = (resourceUserField = 'user') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Get resource ID from params or body
    const resourceId = req.params.id || req.body.id;
    
    if (!resourceId) {
      return res.status(400).json({
        success: false,
        message: 'Resource ID is required'
      });
    }
    
    // For direct user resource access (like /users/:id)
    if (req.route.path.includes('/users/') && resourceId === req.user._id.toString()) {
      return next();
    }
    
    // For other resources, check ownership in the route handler
    // This middleware just ensures user is authenticated
    next();
  };
};

/**
 * Middleware to check if user can access another user's profile
 * Considers privacy settings and admin permissions
 */
const checkProfileAccess = async (req, res, next) => {
  try {
    const targetUserId = req.params.id || req.params.userId;
    
    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    // Get target user
    const targetUser = await User.findById(targetUserId);
    
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if target user is banned or inactive
    if (targetUser.isBanned || !targetUser.isActive) {
      return res.status(403).json({
        success: false,
        message: 'User profile is not accessible'
      });
    }
    
    // Allow access if:
    // 1. User is viewing their own profile
    // 2. Target user's profile is public
    // 3. Current user is admin
    if (req.user && 
        (req.user._id.toString() === targetUserId || 
         targetUser.isPublic || 
         req.user.role === 'admin')) {
      req.targetUser = targetUser;
      return next();
    }
    
    // If no user is authenticated and profile is private
    if (!req.user && !targetUser.isPublic) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to view private profiles'
      });
    }
    
    // If user is authenticated but profile is private
    if (req.user && !targetUser.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'This profile is private'
      });
    }
    
    req.targetUser = targetUser;
    next();
    
  } catch (error) {
    console.error('Profile access check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Middleware to generate JWT token
 * Utility function for creating tokens
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

/**
 * Middleware to handle token refresh
 * Generates new token if current token is close to expiration
 */
const refreshToken = (req, res, next) => {
  if (req.user) {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const now = Date.now() / 1000;
        const tokenAge = now - decoded.iat;
        const tokenLifetime = decoded.exp - decoded.iat;
        
        // If token is more than 80% expired, generate new one
        if (tokenAge > tokenLifetime * 0.8) {
          const newToken = generateToken(req.user._id);
          res.set('X-New-Token', newToken);
        }
      } catch (error) {
        // Token verification failed, handled by main auth middleware
      }
    }
  }
  
  next();
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth,
  checkOwnership,
  checkProfileAccess,
  generateToken,
  refreshToken
};