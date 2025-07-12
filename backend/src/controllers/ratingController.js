const Rating = require('../models/Rating');
const Swap = require('../models/Swap');
const User = require('../models/User');
const { catchAsync, AppError } = require('../middleware/errorHandler');

/**
 * Rating Controller
 * Handles user ratings and feedback after completed swaps
 */

/**
 * Create a new rating
 * @route POST /api/ratings
 * @access Private
 */
const createRating = catchAsync(async (req, res, next) => {
  const { 
    swap, 
    reviewee, 
    rating, 
    feedback, 
    categories, 
    skillTaught, 
    skillLearned, 
    wouldRecommend, 
    isPublic, 
    isAnonymous 
  } = req.body;
  
  // Check if swap exists and is completed
  const swapDoc = await Swap.findById(swap);
  if (!swapDoc) {
    return next(new AppError('Swap not found', 404));
  }
  
  if (swapDoc.status !== 'completed') {
    return next(new AppError('Can only rate completed swaps', 400));
  }
  
  // Check if user is part of the swap
  const isParticipant = swapDoc.requester.toString() === req.user._id.toString() ||
                       swapDoc.receiver.toString() === req.user._id.toString();
  
  if (!isParticipant) {
    return next(new AppError('You can only rate swaps you participated in', 403));
  }
  
  // Check if reviewee is the other participant
  const otherParticipant = swapDoc.requester.toString() === req.user._id.toString() 
    ? swapDoc.receiver.toString() 
    : swapDoc.requester.toString();
  
  if (reviewee !== otherParticipant) {
    return next(new AppError('You can only rate the other participant in the swap', 400));
  }
  
  // Check if rating already exists
  const existingRating = await Rating.findOne({
    swap: swap,
    reviewer: req.user._id
  });
  
  if (existingRating) {
    return next(new AppError('You have already rated this swap', 400));
  }
  
  // Create the rating
  const newRating = await Rating.create({
    swap,
    reviewer: req.user._id,
    reviewee,
    rating,
    feedback,
    categories,
    skillTaught,
    skillLearned,
    wouldRecommend,
    isPublic,
    isAnonymous
  });
  
  // Populate the rating with user and swap details
  await newRating.populate([
    { path: 'reviewer', select: 'name profilePhoto' },
    { path: 'reviewee', select: 'name profilePhoto' },
    { path: 'swap', select: 'requestedSkill offeredSkill completedAt' }
  ]);
  
  res.status(201).json({
    success: true,
    message: 'Rating created successfully',
    data: {
      rating: newRating
    }
  });
});

/**
 * Get ratings for a user
 * @route GET /api/ratings/user/:userId
 * @access Public
 */
const getUserRatings = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { page = 1, limit = 20 } = req.query;
  
  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  
  const ratings = await Rating.getUserRatings(userId, {
    skip: (page - 1) * limit,
    limit: parseInt(limit)
  });
  
  const totalRatings = await Rating.countDocuments({
    reviewee: userId,
    isPublic: true,
    isApproved: true
  });
  
  const totalPages = Math.ceil(totalRatings / limit);
  
  res.status(200).json({
    success: true,
    data: {
      ratings,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalRatings,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }
  });
});

/**
 * Get user rating statistics
 * @route GET /api/ratings/user/:userId/stats
 * @access Public
 */
const getUserRatingStats = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  
  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  
  const stats = await Rating.getUserRatingStats(userId);
  
  res.status(200).json({
    success: true,
    data: {
      stats: stats[0] || {
        averageRating: 0,
        totalRatings: 0,
        ratingDistribution: [],
        categoryAverages: {
          communication: 0,
          skillLevel: 0,
          punctuality: 0,
          helpfulness: 0
        },
        recommendationRate: 0
      }
    }
  });
});

/**
 * Get ratings given by a user
 * @route GET /api/ratings/given
 * @access Private
 */
const getRatingsGiven = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20 } = req.query;
  
  const skip = (page - 1) * limit;
  
  const ratings = await Rating.find({ reviewer: req.user._id })
    .populate('reviewee', 'name profilePhoto')
    .populate('swap', 'requestedSkill offeredSkill completedAt')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));
  
  const totalRatings = await Rating.countDocuments({ reviewer: req.user._id });
  const totalPages = Math.ceil(totalRatings / limit);
  
  res.status(200).json({
    success: true,
    data: {
      ratings,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalRatings,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }
  });
});

/**
 * Get ratings received by a user
 * @route GET /api/ratings/received
 * @access Private
 */
const getRatingsReceived = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20 } = req.query;
  
  const skip = (page - 1) * limit;
  
  const ratings = await Rating.find({ reviewee: req.user._id })
    .populate('reviewer', 'name profilePhoto')
    .populate('swap', 'requestedSkill offeredSkill completedAt')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));
  
  const totalRatings = await Rating.countDocuments({ reviewee: req.user._id });
  const totalPages = Math.ceil(totalRatings / limit);
  
  res.status(200).json({
    success: true,
    data: {
      ratings,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalRatings,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }
  });
});

/**
 * Get a specific rating
 * @route GET /api/ratings/:id
 * @access Private
 */
const getRatingById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  const rating = await Rating.findById(id)
    .populate('reviewer', 'name profilePhoto')
    .populate('reviewee', 'name profilePhoto')
    .populate('swap', 'requestedSkill offeredSkill completedAt');
  
  if (!rating) {
    return next(new AppError('Rating not found', 404));
  }
  
  // Check if user has permission to view this rating
  const canView = rating.isPublic || 
                 rating.reviewer.toString() === req.user._id.toString() ||
                 rating.reviewee.toString() === req.user._id.toString() ||
                 req.user.role === 'admin';
  
  if (!canView) {
    return next(new AppError('You do not have permission to view this rating', 403));
  }
  
  res.status(200).json({
    success: true,
    data: {
      rating
    }
  });
});

/**
 * Update a rating
 * @route PUT /api/ratings/:id
 * @access Private
 */
const updateRating = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { rating, feedback, categories, wouldRecommend, isPublic, isAnonymous } = req.body;
  
  const existingRating = await Rating.findById(id);
  
  if (!existingRating) {
    return next(new AppError('Rating not found', 404));
  }
  
  // Check if user is the reviewer
  if (existingRating.reviewer.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only update your own ratings', 403));
  }
  
  // Check if rating is still editable (within 24 hours)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  if (existingRating.createdAt < oneDayAgo) {
    return next(new AppError('Ratings can only be edited within 24 hours of creation', 400));
  }
  
  // Update the rating
  const updatedRating = await Rating.findByIdAndUpdate(
    id,
    { rating, feedback, categories, wouldRecommend, isPublic, isAnonymous },
    { new: true, runValidators: true }
  ).populate([
    { path: 'reviewer', select: 'name profilePhoto' },
    { path: 'reviewee', select: 'name profilePhoto' },
    { path: 'swap', select: 'requestedSkill offeredSkill completedAt' }
  ]);
  
  res.status(200).json({
    success: true,
    message: 'Rating updated successfully',
    data: {
      rating: updatedRating
    }
  });
});

/**
 * Delete a rating
 * @route DELETE /api/ratings/:id
 * @access Private
 */
const deleteRating = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  const rating = await Rating.findById(id);
  
  if (!rating) {
    return next(new AppError('Rating not found', 404));
  }
  
  // Check if user is the reviewer or admin
  if (rating.reviewer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('You can only delete your own ratings', 403));
  }
  
  // Check if rating is still deletable (within 24 hours for regular users)
  if (req.user.role !== 'admin') {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if (rating.createdAt < oneDayAgo) {
      return next(new AppError('Ratings can only be deleted within 24 hours of creation', 400));
    }
  }
  
  await Rating.findByIdAndDelete(id);
  
  res.status(200).json({
    success: true,
    message: 'Rating deleted successfully'
  });
});

/**
 * Flag a rating as inappropriate
 * @route POST /api/ratings/:id/flag
 * @access Private
 */
const flagRating = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { reason } = req.body;
  
  const rating = await Rating.findById(id);
  
  if (!rating) {
    return next(new AppError('Rating not found', 404));
  }
  
  // Check if user is not the reviewer (can't flag own rating)
  if (rating.reviewer.toString() === req.user._id.toString()) {
    return next(new AppError('You cannot flag your own rating', 400));
  }
  
  // Flag the rating
  await rating.flag(reason);
  
  res.status(200).json({
    success: true,
    message: 'Rating flagged successfully'
  });
});

/**
 * Get rating trends (admin only)
 * @route GET /api/ratings/trends
 * @access Private (Admin only)
 */
const getRatingTrends = catchAsync(async (req, res, next) => {
  const { startDate, endDate } = req.query;
  
  if (!startDate || !endDate) {
    return next(new AppError('Start date and end date are required', 400));
  }
  
  const trends = await Rating.getRatingTrends(startDate, endDate);
  
  res.status(200).json({
    success: true,
    data: {
      trends
    }
  });
});

module.exports = {
  createRating,
  getUserRatings,
  getUserRatingStats,
  getRatingsGiven,
  getRatingsReceived,
  getRatingById,
  updateRating,
  deleteRating,
  flagRating,
  getRatingTrends
};