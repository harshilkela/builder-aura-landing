/**
 * Error handling middleware for the Skill Swap Platform
 * Handles various types of errors and provides consistent error responses
 */

/**
 * Custom error class for application-specific errors
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handle duplicate key errors from MongoDB
 */
const handleDuplicateKeyError = (error) => {
  const field = Object.keys(error.keyValue)[0];
  const message = `${field} already exists. Please use a different ${field}.`;
  return new AppError(message, 400);
};

/**
 * Handle validation errors from MongoDB
 */
const handleValidationError = (error) => {
  const errors = Object.values(error.errors).map(err => ({
    field: err.path,
    message: err.message,
    value: err.value
  }));
  
  return {
    statusCode: 400,
    status: 'fail',
    message: 'Validation failed',
    errors: errors
  };
};

/**
 * Handle cast errors from MongoDB (invalid ObjectId)
 */
const handleCastError = (error) => {
  const message = `Invalid ${error.path}: ${error.value}`;
  return new AppError(message, 400);
};

/**
 * Handle JWT errors
 */
const handleJWTError = () => {
  return new AppError('Invalid token. Please log in again.', 401);
};

/**
 * Handle JWT expired errors
 */
const handleJWTExpiredError = () => {
  return new AppError('Your token has expired. Please log in again.', 401);
};

/**
 * Send error response in development mode
 */
const sendErrorDev = (err, req, res) => {
  // API errors
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode || 500).json({
      success: false,
      status: err.status || 'error',
      message: err.message,
      stack: err.stack,
      error: err
    });
  }
  
  // Render error page for non-API requests
  console.error('ERROR:', err);
  
  res.status(err.statusCode || 500).json({
    success: false,
    message: 'Something went wrong!'
  });
};

/**
 * Send error response in production mode
 */
const sendErrorProd = (err, req, res) => {
  // API errors
  if (req.originalUrl.startsWith('/api')) {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        success: false,
        status: err.status,
        message: err.message,
        ...(err.errors && { errors: err.errors })
      });
    }
    
    // Programming or other unknown error: don't leak error details
    console.error('ERROR:', err);
    
    return res.status(500).json({
      success: false,
      status: 'error',
      message: 'Something went wrong!'
    });
  }
  
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  }
  
  // Programming or other unknown error: don't leak error details
  console.error('ERROR:', err);
  
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
};

/**
 * Handle async errors
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

/**
 * Handle 404 errors for unmatched routes
 */
const handleNotFound = (req, res, next) => {
  const message = `Can't find ${req.originalUrl} on this server!`;
  const error = new AppError(message, 404);
  next(error);
};

/**
 * Global error handling middleware
 */
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else {
    let error = { ...err };
    error.message = err.message;
    
    // Handle specific error types
    if (error.code === 11000) {
      error = handleDuplicateKeyError(error);
    }
    
    if (error.name === 'ValidationError') {
      error = handleValidationError(error);
    }
    
    if (error.name === 'CastError') {
      error = handleCastError(error);
    }
    
    if (error.name === 'JsonWebTokenError') {
      error = handleJWTError();
    }
    
    if (error.name === 'TokenExpiredError') {
      error = handleJWTExpiredError();
    }
    
    sendErrorProd(error, req, res);
  }
};

/**
 * Rate limiting error handler
 */
const handleRateLimitError = (req, res) => {
  return res.status(429).json({
    success: false,
    status: 'error',
    message: 'Too many requests from this IP. Please try again later.',
    retryAfter: req.rateLimit.resetTime
  });
};

/**
 * Handle file upload errors
 */
const handleFileUploadError = (err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File too large. Maximum size is 5MB.'
    });
  }
  
  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      success: false,
      message: 'Too many files. Maximum 5 files allowed.'
    });
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      message: 'Unexpected file field.'
    });
  }
  
  if (err.message === 'INVALID_FILE_TYPE') {
    return res.status(400).json({
      success: false,
      message: 'Invalid file type. Only images are allowed.'
    });
  }
  
  next(err);
};

/**
 * Handle database connection errors
 */
const handleDatabaseError = (err, req, res, next) => {
  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    console.error('Database Error:', err);
    
    return res.status(500).json({
      success: false,
      message: 'Database connection error. Please try again later.'
    });
  }
  
  if (err.name === 'MongoNetworkError') {
    console.error('Database Network Error:', err);
    
    return res.status(503).json({
      success: false,
      message: 'Database is temporarily unavailable. Please try again later.'
    });
  }
  
  next(err);
};

/**
 * Validation error formatter
 */
const formatValidationError = (errors) => {
  return errors.map(error => ({
    field: error.path || error.param,
    message: error.msg || error.message,
    value: error.value
  }));
};

/**
 * Log errors for monitoring
 */
const logError = (error, req) => {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    statusCode: error.statusCode,
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user ? req.user._id : null
  };
  
  console.error('Error logged:', JSON.stringify(errorInfo, null, 2));
  
  // In production, you might want to send this to a logging service
  // like Winston, Sentry, or CloudWatch
};

/**
 * Handle uncaught exceptions
 */
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message);
  console.error(err.stack);
  
  process.exit(1);
});

/**
 * Handle unhandled promise rejections
 */
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  
  // Give the server time to finish ongoing requests
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

module.exports = {
  AppError,
  catchAsync,
  handleNotFound,
  globalErrorHandler,
  handleRateLimitError,
  handleFileUploadError,
  handleDatabaseError,
  formatValidationError,
  logError
};