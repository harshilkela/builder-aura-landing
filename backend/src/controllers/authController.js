const User = require('../models/User');
const { catchAsync, AppError } = require('../middleware/errorHandler');
const { generateToken } = require('../middleware/auth');

/**
 * Authentication Controller
 * Handles user registration, login, and authentication-related operations
 */

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
const register = catchAsync(async (req, res, next) => {
  const { name, email, password, skillsOffered, skillsWanted, location, availability } = req.body;
  
  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return next(new AppError('User with this email already exists', 400));
  }
  
  // Create new user
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    skillsOffered,
    skillsWanted,
    location,
    availability
  });
  
  // Generate JWT token
  const token = generateToken(user._id);
  
  // Remove password from response
  user.password = undefined;
  
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    token,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        skillsOffered: user.skillsOffered,
        skillsWanted: user.skillsWanted,
        location: user.location,
        availability: user.availability,
        isPublic: user.isPublic,
        profileCompletion: user.profileCompletion,
        createdAt: user.createdAt
      }
    }
  });
});

/**
 * Login user
 * @route POST /api/auth/login
 * @access Public
 */
const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  
  // Check if user exists and get password
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  
  if (!user) {
    return next(new AppError('Invalid email or password', 401));
  }
  
  // Check if password is correct
  const isPasswordCorrect = await user.comparePassword(password);
  
  if (!isPasswordCorrect) {
    return next(new AppError('Invalid email or password', 401));
  }
  
  // Check if user is banned
  if (user.isBanned) {
    return next(new AppError('Your account has been banned. Please contact support.', 403));
  }
  
  // Check if user is active
  if (!user.isActive) {
    return next(new AppError('Your account is inactive. Please contact support.', 403));
  }
  
  // Update last login
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });
  
  // Generate JWT token
  const token = generateToken(user._id);
  
  // Remove password from response
  user.password = undefined;
  
  res.status(200).json({
    success: true,
    message: 'Login successful',
    token,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        skillsOffered: user.skillsOffered,
        skillsWanted: user.skillsWanted,
        location: user.location,
        availability: user.availability,
        isPublic: user.isPublic,
        role: user.role,
        profileCompletion: user.profileCompletion,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    }
  });
});

/**
 * Get current logged-in user
 * @route GET /api/auth/me
 * @access Private
 */
const getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  
  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        skillsOffered: user.skillsOffered,
        skillsWanted: user.skillsWanted,
        location: user.location,
        availability: user.availability,
        isPublic: user.isPublic,
        role: user.role,
        profileCompletion: user.profileCompletion,
        averageRating: user.averageRating,
        totalRatings: user.totalRatings,
        totalSwaps: user.totalSwaps,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    }
  });
});

/**
 * Update password
 * @route PUT /api/auth/password
 * @access Private
 */
const updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  
  // Get user with password
  const user = await User.findById(req.user._id).select('+password');
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  
  // Check if current password is correct
  const isCurrentPasswordCorrect = await user.comparePassword(currentPassword);
  
  if (!isCurrentPasswordCorrect) {
    return next(new AppError('Current password is incorrect', 400));
  }
  
  // Update password
  user.password = newPassword;
  await user.save();
  
  // Generate new JWT token
  const token = generateToken(user._id);
  
  res.status(200).json({
    success: true,
    message: 'Password updated successfully',
    token
  });
});

/**
 * Forgot password (basic implementation)
 * @route POST /api/auth/forgot-password
 * @access Public
 */
const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  
  // Check if user exists
  const user = await User.findOne({ email: email.toLowerCase() });
  
  if (!user) {
    return next(new AppError('User with this email does not exist', 404));
  }
  
  // For now, just return success message
  // In a real application, you would:
  // 1. Generate a reset token
  // 2. Save it to the database with expiration
  // 3. Send email with reset link
  
  res.status(200).json({
    success: true,
    message: 'Password reset instructions sent to email'
  });
});

/**
 * Refresh token
 * @route POST /api/auth/refresh
 * @access Private
 */
const refreshToken = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  
  // Check if user is still active and not banned
  if (user.isBanned) {
    return next(new AppError('Your account has been banned', 403));
  }
  
  if (!user.isActive) {
    return next(new AppError('Your account is inactive', 403));
  }
  
  // Generate new token
  const token = generateToken(user._id);
  
  res.status(200).json({
    success: true,
    message: 'Token refreshed successfully',
    token
  });
});

/**
 * Logout user (client-side implementation)
 * @route POST /api/auth/logout
 * @access Private
 */
const logout = catchAsync(async (req, res, next) => {
  // In a JWT-based system, logout is typically handled on the client side
  // by removing the token from storage
  // Here we just return a success message
  
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

/**
 * Delete account (soft delete)
 * @route DELETE /api/auth/account
 * @access Private
 */
const deleteAccount = catchAsync(async (req, res, next) => {
  const { password } = req.body;
  
  // Get user with password
  const user = await User.findById(req.user._id).select('+password');
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  
  // Verify password
  const isPasswordCorrect = await user.comparePassword(password);
  
  if (!isPasswordCorrect) {
    return next(new AppError('Password is incorrect', 400));
  }
  
  // Soft delete by setting isActive to false
  user.isActive = false;
  await user.save();
  
  res.status(200).json({
    success: true,
    message: 'Account deleted successfully'
  });
});

/**
 * Check if email is available
 * @route GET /api/auth/check-email/:email
 * @access Public
 */
const checkEmailAvailability = catchAsync(async (req, res, next) => {
  const { email } = req.params;
  
  const user = await User.findOne({ email: email.toLowerCase() });
  
  res.status(200).json({
    success: true,
    data: {
      available: !user,
      email: email.toLowerCase()
    }
  });
});

/**
 * Verify user account (for future email verification)
 * @route GET /api/auth/verify/:token
 * @access Public
 */
const verifyAccount = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  
  // For now, just return success
  // In a real application, you would:
  // 1. Verify the token
  // 2. Update user's email verification status
  
  res.status(200).json({
    success: true,
    message: 'Account verified successfully'
  });
});

module.exports = {
  register,
  login,
  getMe,
  updatePassword,
  forgotPassword,
  refreshToken,
  logout,
  deleteAccount,
  checkEmailAvailability,
  verifyAccount
};