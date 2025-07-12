const User = require('../models/User');
const Swap = require('../models/Swap');
const Rating = require('../models/Rating');
const AdminMessage = require('../models/AdminMessage');
const { catchAsync, AppError } = require('../middleware/errorHandler');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');
const fs = require('fs');

/**
 * Admin Controller
 * Handles administrative functions including user management, swap oversight, messaging, and reporting
 */

/**
 * Get admin dashboard statistics
 * @route GET /api/admin/dashboard
 * @access Private (Admin only)
 */
const getDashboardStats = catchAsync(async (req, res, next) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  // Get user statistics
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ isActive: true, isBanned: false });
  const bannedUsers = await User.countDocuments({ isBanned: true });
  const newUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
  
  // Get swap statistics
  const totalSwaps = await Swap.countDocuments();
  const pendingSwaps = await Swap.countDocuments({ status: 'pending' });
  const acceptedSwaps = await Swap.countDocuments({ status: 'accepted' });
  const completedSwaps = await Swap.countDocuments({ status: 'completed' });
  const recentSwaps = await Swap.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
  
  // Get rating statistics
  const totalRatings = await Rating.countDocuments();
  const flaggedRatings = await Rating.countDocuments({ isFlagged: true });
  const recentRatings = await Rating.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
  
  // Get average rating
  const avgRatingResult = await Rating.aggregate([
    { $group: { _id: null, avgRating: { $avg: '$rating' } } }
  ]);
  const averageRating = avgRatingResult.length > 0 ? avgRatingResult[0].avgRating : 0;
  
  res.status(200).json({
    success: true,
    data: {
      users: {
        total: totalUsers,
        active: activeUsers,
        banned: bannedUsers,
        newThisMonth: newUsers
      },
      swaps: {
        total: totalSwaps,
        pending: pendingSwaps,
        accepted: acceptedSwaps,
        completed: completedSwaps,
        recentThisMonth: recentSwaps
      },
      ratings: {
        total: totalRatings,
        flagged: flaggedRatings,
        recentThisMonth: recentRatings,
        averageRating: Math.round(averageRating * 100) / 100
      }
    }
  });
});

/**
 * Get all swaps (admin overview)
 * @route GET /api/admin/swaps
 * @access Private (Admin only)
 */
const getAllSwaps = catchAsync(async (req, res, next) => {
  const { status, page = 1, limit = 50, sort = '-createdAt' } = req.query;
  
  const query = {};
  if (status) query.status = status;
  
  const skip = (page - 1) * limit;
  
  const swaps = await Swap.find(query)
    .populate('requester', 'name email')
    .populate('receiver', 'name email')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));
  
  const totalSwaps = await Swap.countDocuments(query);
  const totalPages = Math.ceil(totalSwaps / limit);
  
  res.status(200).json({
    success: true,
    data: {
      swaps,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalSwaps,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }
  });
});

/**
 * Ban a user
 * @route PUT /api/admin/users/:id/ban
 * @access Private (Admin only)
 */
const banUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { reason } = req.body;
  
  const user = await User.findById(id);
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  
  if (user.role === 'admin') {
    return next(new AppError('Cannot ban admin users', 400));
  }
  
  user.isBanned = true;
  user.banReason = reason;
  await user.save();
  
  res.status(200).json({
    success: true,
    message: 'User banned successfully',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isBanned: user.isBanned
      }
    }
  });
});

/**
 * Unban a user
 * @route PUT /api/admin/users/:id/unban
 * @access Private (Admin only)
 */
const unbanUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  const user = await User.findById(id);
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  
  user.isBanned = false;
  user.banReason = undefined;
  await user.save();
  
  res.status(200).json({
    success: true,
    message: 'User unbanned successfully',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isBanned: user.isBanned
      }
    }
  });
});

/**
 * Create platform-wide message
 * @route POST /api/admin/messages
 * @access Private (Admin only)
 */
const createAdminMessage = catchAsync(async (req, res, next) => {
  const messageData = {
    ...req.body,
    createdBy: req.user._id
  };
  
  const message = await AdminMessage.create(messageData);
  
  // If message is set to send immediately, send it
  if (message.status === 'scheduled' && message.scheduledAt <= new Date()) {
    await message.send();
  }
  
  res.status(201).json({
    success: true,
    message: 'Admin message created successfully',
    data: {
      message
    }
  });
});

/**
 * Get all admin messages
 * @route GET /api/admin/messages
 * @access Private (Admin only)
 */
const getAdminMessages = catchAsync(async (req, res, next) => {
  const { status, page = 1, limit = 20, sort = '-createdAt' } = req.query;
  
  const query = {};
  if (status) query.status = status;
  
  const skip = (page - 1) * limit;
  
  const messages = await AdminMessage.find(query)
    .populate('createdBy', 'name email')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));
  
  const totalMessages = await AdminMessage.countDocuments(query);
  const totalPages = Math.ceil(totalMessages / limit);
  
  res.status(200).json({
    success: true,
    data: {
      messages,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalMessages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }
  });
});

/**
 * Update admin message
 * @route PUT /api/admin/messages/:id
 * @access Private (Admin only)
 */
const updateAdminMessage = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  const message = await AdminMessage.findByIdAndUpdate(
    id,
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!message) {
    return next(new AppError('Message not found', 404));
  }
  
  res.status(200).json({
    success: true,
    message: 'Admin message updated successfully',
    data: {
      message
    }
  });
});

/**
 * Send admin message
 * @route POST /api/admin/messages/:id/send
 * @access Private (Admin only)
 */
const sendAdminMessage = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  const message = await AdminMessage.findById(id);
  
  if (!message) {
    return next(new AppError('Message not found', 404));
  }
  
  if (message.status === 'sent') {
    return next(new AppError('Message has already been sent', 400));
  }
  
  await message.send();
  
  res.status(200).json({
    success: true,
    message: 'Admin message sent successfully',
    data: {
      message
    }
  });
});

/**
 * Generate user activity report
 * @route GET /api/admin/reports/user-activity
 * @access Private (Admin only)
 */
const generateUserActivityReport = catchAsync(async (req, res, next) => {
  const { startDate, endDate, format = 'json' } = req.query;
  
  const matchStage = {};
  if (startDate && endDate) {
    matchStage.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  const userActivity = await User.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: 'swaps',
        localField: '_id',
        foreignField: 'requester',
        as: 'swapsRequested'
      }
    },
    {
      $lookup: {
        from: 'swaps',
        localField: '_id',
        foreignField: 'receiver',
        as: 'swapsReceived'
      }
    },
    {
      $lookup: {
        from: 'ratings',
        localField: '_id',
        foreignField: 'reviewee',
        as: 'ratingsReceived'
      }
    },
    {
      $project: {
        name: 1,
        email: 1,
        createdAt: 1,
        totalSwaps: 1,
        averageRating: 1,
        swapsRequestedCount: { $size: '$swapsRequested' },
        swapsReceivedCount: { $size: '$swapsReceived' },
        ratingsReceivedCount: { $size: '$ratingsReceived' },
        isActive: 1,
        isBanned: 1
      }
    }
  ]);
  
  if (format === 'csv') {
    const csvWriter = createCsvWriter({
      path: path.join(__dirname, '../temp/user-activity.csv'),
      header: [
        { id: 'name', title: 'Name' },
        { id: 'email', title: 'Email' },
        { id: 'createdAt', title: 'Registration Date' },
        { id: 'totalSwaps', title: 'Total Swaps' },
        { id: 'averageRating', title: 'Average Rating' },
        { id: 'swapsRequestedCount', title: 'Swaps Requested' },
        { id: 'swapsReceivedCount', title: 'Swaps Received' },
        { id: 'ratingsReceivedCount', title: 'Ratings Received' },
        { id: 'isActive', title: 'Active' },
        { id: 'isBanned', title: 'Banned' }
      ]
    });
    
    await csvWriter.writeRecords(userActivity);
    
    res.download(path.join(__dirname, '../temp/user-activity.csv'), 'user-activity.csv', (err) => {
      if (err) {
        console.error('Error downloading file:', err);
      }
      // Clean up the file after download
      fs.unlinkSync(path.join(__dirname, '../temp/user-activity.csv'));
    });
  } else {
    res.status(200).json({
      success: true,
      data: {
        userActivity,
        reportGenerated: new Date().toISOString()
      }
    });
  }
});

/**
 * Generate swap statistics report
 * @route GET /api/admin/reports/swap-stats
 * @access Private (Admin only)
 */
const generateSwapStatsReport = catchAsync(async (req, res, next) => {
  const { startDate, endDate, format = 'json' } = req.query;
  
  const matchStage = {};
  if (startDate && endDate) {
    matchStage.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  const swapStats = await Swap.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          status: '$status',
          month: { $month: '$createdAt' },
          year: { $year: '$createdAt' }
        },
        count: { $sum: 1 },
        averageResponseTime: {
          $avg: {
            $cond: [
              { $ne: ['$acceptedAt', null] },
              { $subtract: ['$acceptedAt', '$createdAt'] },
              null
            ]
          }
        }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    }
  ]);
  
  if (format === 'csv') {
    const csvData = swapStats.map(stat => ({
      status: stat._id.status,
      month: stat._id.month,
      year: stat._id.year,
      count: stat.count,
      averageResponseTime: stat.averageResponseTime ? Math.round(stat.averageResponseTime / (1000 * 60 * 60 * 24)) : null
    }));
    
    const csvWriter = createCsvWriter({
      path: path.join(__dirname, '../temp/swap-stats.csv'),
      header: [
        { id: 'status', title: 'Status' },
        { id: 'month', title: 'Month' },
        { id: 'year', title: 'Year' },
        { id: 'count', title: 'Count' },
        { id: 'averageResponseTime', title: 'Avg Response Time (Days)' }
      ]
    });
    
    await csvWriter.writeRecords(csvData);
    
    res.download(path.join(__dirname, '../temp/swap-stats.csv'), 'swap-stats.csv', (err) => {
      if (err) {
        console.error('Error downloading file:', err);
      }
      // Clean up the file after download
      fs.unlinkSync(path.join(__dirname, '../temp/swap-stats.csv'));
    });
  } else {
    res.status(200).json({
      success: true,
      data: {
        swapStats,
        reportGenerated: new Date().toISOString()
      }
    });
  }
});

/**
 * Generate feedback report
 * @route GET /api/admin/reports/feedback
 * @access Private (Admin only)
 */
const generateFeedbackReport = catchAsync(async (req, res, next) => {
  const { startDate, endDate, format = 'json' } = req.query;
  
  const matchStage = {};
  if (startDate && endDate) {
    matchStage.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  const feedbackData = await Rating.find(matchStage)
    .populate('reviewer', 'name email')
    .populate('reviewee', 'name email')
    .populate('swap', 'requestedSkill offeredSkill')
    .select('rating feedback categories wouldRecommend isFlagged createdAt');
  
  if (format === 'csv') {
    const csvData = feedbackData.map(rating => ({
      reviewerName: rating.reviewer.name,
      reviewerEmail: rating.reviewer.email,
      revieweeName: rating.reviewee.name,
      revieweeEmail: rating.reviewee.email,
      rating: rating.rating,
      feedback: rating.feedback,
      communication: rating.categories?.communication,
      skillLevel: rating.categories?.skillLevel,
      punctuality: rating.categories?.punctuality,
      helpfulness: rating.categories?.helpfulness,
      wouldRecommend: rating.wouldRecommend,
      isFlagged: rating.isFlagged,
      createdAt: rating.createdAt
    }));
    
    const csvWriter = createCsvWriter({
      path: path.join(__dirname, '../temp/feedback-report.csv'),
      header: [
        { id: 'reviewerName', title: 'Reviewer Name' },
        { id: 'reviewerEmail', title: 'Reviewer Email' },
        { id: 'revieweeName', title: 'Reviewee Name' },
        { id: 'revieweeEmail', title: 'Reviewee Email' },
        { id: 'rating', title: 'Rating' },
        { id: 'feedback', title: 'Feedback' },
        { id: 'communication', title: 'Communication' },
        { id: 'skillLevel', title: 'Skill Level' },
        { id: 'punctuality', title: 'Punctuality' },
        { id: 'helpfulness', title: 'Helpfulness' },
        { id: 'wouldRecommend', title: 'Would Recommend' },
        { id: 'isFlagged', title: 'Flagged' },
        { id: 'createdAt', title: 'Created At' }
      ]
    });
    
    await csvWriter.writeRecords(csvData);
    
    res.download(path.join(__dirname, '../temp/feedback-report.csv'), 'feedback-report.csv', (err) => {
      if (err) {
        console.error('Error downloading file:', err);
      }
      // Clean up the file after download
      fs.unlinkSync(path.join(__dirname, '../temp/feedback-report.csv'));
    });
  } else {
    res.status(200).json({
      success: true,
      data: {
        feedbackData,
        reportGenerated: new Date().toISOString()
      }
    });
  }
});

/**
 * Get flagged ratings for review
 * @route GET /api/admin/ratings/flagged
 * @access Private (Admin only)
 */
const getFlaggedRatings = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20 } = req.query;
  
  const flaggedRatings = await Rating.getRecentRatings({
    flagged: true,
    limit: parseInt(limit),
    skip: (page - 1) * limit
  });
  
  const totalFlagged = await Rating.countDocuments({ isFlagged: true });
  const totalPages = Math.ceil(totalFlagged / limit);
  
  res.status(200).json({
    success: true,
    data: {
      ratings: flaggedRatings,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalRatings: totalFlagged,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }
  });
});

/**
 * Approve flagged rating
 * @route PUT /api/admin/ratings/:id/approve
 * @access Private (Admin only)
 */
const approveRating = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  const rating = await Rating.findById(id);
  
  if (!rating) {
    return next(new AppError('Rating not found', 404));
  }
  
  await rating.approve();
  
  res.status(200).json({
    success: true,
    message: 'Rating approved successfully'
  });
});

/**
 * Create temp directory if it doesn't exist
 */
const ensureTempDir = () => {
  const tempDir = path.join(__dirname, '../temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
};

// Ensure temp directory exists
ensureTempDir();

module.exports = {
  getDashboardStats,
  getAllSwaps,
  banUser,
  unbanUser,
  createAdminMessage,
  getAdminMessages,
  updateAdminMessage,
  sendAdminMessage,
  generateUserActivityReport,
  generateSwapStatsReport,
  generateFeedbackReport,
  getFlaggedRatings,
  approveRating
};