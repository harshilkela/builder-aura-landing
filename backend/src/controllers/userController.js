const User = require('../models/User');
const { catchAsync, AppError } = require('../middleware/errorHandler');

/**
 * User Controller
 * Handles user profile operations, skills management, and user search
 */

/**
 * Get user profile by ID
 * @route GET /api/users/:id
 * @access Public/Private (depends on privacy settings)
 */
const getUserProfile = catchAsync(async (req, res, next) => {
  const userId = req.params.id;
  
  // Use the targetUser from checkProfileAccess middleware
  const user = req.targetUser;
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  
  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.isPublic ? user.email : undefined,
        skillsOffered: user.skillsOffered,
        skillsWanted: user.skillsWanted,
        location: user.location,
        bio: user.bio,
        availability: user.availability,
        profilePhoto: user.profilePhoto,
        averageRating: user.averageRating,
        totalRatings: user.totalRatings,
        totalSwaps: user.totalSwaps,
        profileCompletion: user.profileCompletion,
        createdAt: user.createdAt
      }
    }
  });
});

/**
 * Update user profile
 * @route PUT /api/users/:id
 * @access Private (own profile only)
 */
const updateUserProfile = catchAsync(async (req, res, next) => {
  const userId = req.params.id;
  const updates = req.body;
  
  // Check if user is updating their own profile
  if (req.user._id.toString() !== userId) {
    return next(new AppError('You can only update your own profile', 403));
  }
  
  // Remove fields that shouldn't be updated directly
  const allowedFields = ['name', 'email', 'location', 'bio', 'availability', 'profilePhoto', 'isPublic'];
  const filteredUpdates = {};
  
  Object.keys(updates).forEach(key => {
    if (allowedFields.includes(key)) {
      filteredUpdates[key] = updates[key];
    }
  });
  
  // If email is being updated, check if it's already taken
  if (filteredUpdates.email && filteredUpdates.email !== req.user.email) {
    const existingUser = await User.findOne({ email: filteredUpdates.email.toLowerCase() });
    if (existingUser) {
      return next(new AppError('Email is already taken', 400));
    }
    filteredUpdates.email = filteredUpdates.email.toLowerCase();
  }
  
  const user = await User.findByIdAndUpdate(
    userId,
    filteredUpdates,
    { new: true, runValidators: true }
  );
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  
  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        skillsOffered: user.skillsOffered,
        skillsWanted: user.skillsWanted,
        location: user.location,
        bio: user.bio,
        availability: user.availability,
        profilePhoto: user.profilePhoto,
        isPublic: user.isPublic,
        profileCompletion: user.profileCompletion,
        updatedAt: user.updatedAt
      }
    }
  });
});

/**
 * Update user skills
 * @route PUT /api/users/:id/skills
 * @access Private (own profile only)
 */
const updateUserSkills = catchAsync(async (req, res, next) => {
  const userId = req.params.id;
  const { skillsOffered, skillsWanted } = req.body;
  
  // Check if user is updating their own skills
  if (req.user._id.toString() !== userId) {
    return next(new AppError('You can only update your own skills', 403));
  }
  
  const updateData = {};
  if (skillsOffered) updateData.skillsOffered = skillsOffered;
  if (skillsWanted) updateData.skillsWanted = skillsWanted;
  
  const user = await User.findByIdAndUpdate(
    userId,
    updateData,
    { new: true, runValidators: true }
  );
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  
  res.status(200).json({
    success: true,
    message: 'Skills updated successfully',
    data: {
      user: {
        id: user._id,
        skillsOffered: user.skillsOffered,
        skillsWanted: user.skillsWanted,
        updatedAt: user.updatedAt
      }
    }
  });
});

/**
 * Search users by skills
 * @route GET /api/users/search
 * @access Public
 */
const searchUsers = catchAsync(async (req, res, next) => {
  const { skill, location, availability, page = 1, limit = 20, sort = '-averageRating' } = req.query;
  
  const query = {
    isPublic: true,
    isBanned: false,
    isActive: true
  };
  
  // Build search query
  if (skill) {
    query.$or = [
      { skillsOffered: { $regex: skill, $options: 'i' } },
      { skillsWanted: { $regex: skill, $options: 'i' } }
    ];
  }
  
  if (location) {
    query.location = { $regex: location, $options: 'i' };
  }
  
  if (availability) {
    query.availability = availability;
  }
  
  const skip = (page - 1) * limit;
  
  // Execute search
  const users = await User.find(query)
    .select('-password -email')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));
  
  const totalUsers = await User.countDocuments(query);
  const totalPages = Math.ceil(totalUsers / limit);
  
  res.status(200).json({
    success: true,
    data: {
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalUsers,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }
  });
});

/**
 * Get users by skill (specific endpoint)
 * @route GET /api/users/by-skill/:skill
 * @access Public
 */
const getUsersBySkill = catchAsync(async (req, res, next) => {
  const { skill } = req.params;
  const { page = 1, limit = 20 } = req.query;
  
  const users = await User.searchBySkill(skill, {
    skip: (page - 1) * limit,
    limit: parseInt(limit)
  });
  
  const totalUsers = await User.countDocuments({
    isPublic: true,
    isBanned: false,
    isActive: true,
    $or: [
      { skillsOffered: { $regex: skill, $options: 'i' } },
      { skillsWanted: { $regex: skill, $options: 'i' } }
    ]
  });
  
  res.status(200).json({
    success: true,
    data: {
      users,
      pagination: {
        currentPage: parseInt(page),
        totalUsers,
        searchTerm: skill
      }
    }
  });
});

/**
 * Get user statistics
 * @route GET /api/users/:id/stats
 * @access Public (for public profiles)
 */
const getUserStats = catchAsync(async (req, res, next) => {
  const userId = req.params.id;
  
  const user = await User.findById(userId);
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  
  // Check if profile is public or user is viewing their own profile
  if (!user.isPublic && req.user?._id.toString() !== userId) {
    return next(new AppError('This profile is private', 403));
  }
  
  const stats = {
    totalSwaps: user.totalSwaps,
    averageRating: user.averageRating,
    totalRatings: user.totalRatings,
    profileCompletion: user.profileCompletion,
    skillsOfferedCount: user.skillsOffered.length,
    skillsWantedCount: user.skillsWanted.length,
    memberSince: user.createdAt
  };
  
  res.status(200).json({
    success: true,
    data: {
      stats
    }
  });
});

/**
 * Get all users (admin only)
 * @route GET /api/users
 * @access Private (Admin only)
 */
const getAllUsers = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 50, sort = '-createdAt', status, search } = req.query;
  
  const query = {};
  
  // Filter by status
  if (status === 'active') query.isActive = true;
  if (status === 'inactive') query.isActive = false;
  if (status === 'banned') query.isBanned = true;
  
  // Search functionality
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }
  
  const skip = (page - 1) * limit;
  
  const users = await User.find(query)
    .select('-password')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));
  
  const totalUsers = await User.countDocuments(query);
  const totalPages = Math.ceil(totalUsers / limit);
  
  res.status(200).json({
    success: true,
    data: {
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalUsers,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }
  });
});

/**
 * Delete user (admin only)
 * @route DELETE /api/users/:id
 * @access Private (Admin only)
 */
const deleteUser = catchAsync(async (req, res, next) => {
  const userId = req.params.id;
  
  // Prevent admin from deleting themselves
  if (req.user._id.toString() === userId) {
    return next(new AppError('You cannot delete your own account', 400));
  }
  
  const user = await User.findByIdAndUpdate(
    userId,
    { isActive: false },
    { new: true }
  );
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  
  res.status(200).json({
    success: true,
    message: 'User deleted successfully'
  });
});

/**
 * Get user's skills summary
 * @route GET /api/users/:id/skills-summary
 * @access Public
 */
const getUserSkillsSummary = catchAsync(async (req, res, next) => {
  const userId = req.params.id;
  
  const user = await User.findById(userId);
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  
  // Check privacy settings
  if (!user.isPublic && req.user?._id.toString() !== userId) {
    return next(new AppError('This profile is private', 403));
  }
  
  res.status(200).json({
    success: true,
    data: {
      skillsOffered: user.skillsOffered,
      skillsWanted: user.skillsWanted,
      skillsSummary: {
        totalSkillsOffered: user.skillsOffered.length,
        totalSkillsWanted: user.skillsWanted.length,
        availability: user.availability,
        location: user.location
      }
    }
  });
});

module.exports = {
  getUserProfile,
  updateUserProfile,
  updateUserSkills,
  searchUsers,
  getUsersBySkill,
  getUserStats,
  getAllUsers,
  deleteUser,
  getUserSkillsSummary
};