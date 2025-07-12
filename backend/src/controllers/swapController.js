const Swap = require('../models/Swap');
const User = require('../models/User');
const { catchAsync, AppError } = require('../middleware/errorHandler');

/**
 * Swap Controller
 * Handles all swap-related operations including creation, management, and status updates
 */

/**
 * Create a new swap request
 * @route POST /api/swaps
 * @access Private
 */
const createSwap = catchAsync(async (req, res, next) => {
  const { receiver, requestedSkill, offeredSkill, message, meetingType, location, proposedDate } = req.body;
  
  // Check if receiver exists and is active
  const receiverUser = await User.findById(receiver);
  if (!receiverUser) {
    return next(new AppError('Receiver not found', 404));
  }
  
  if (receiverUser.isBanned || !receiverUser.isActive) {
    return next(new AppError('Cannot create swap with inactive user', 400));
  }
  
  // Check if user is trying to swap with themselves
  if (req.user._id.toString() === receiver) {
    return next(new AppError('Cannot create swap with yourself', 400));
  }
  
  // Check if receiver has the requested skill
  const hasRequestedSkill = receiverUser.skillsOffered.some(skill => 
    skill.toLowerCase().includes(requestedSkill.toLowerCase())
  );
  
  if (!hasRequestedSkill) {
    return next(new AppError('Receiver does not offer the requested skill', 400));
  }
  
  // Check if requester has the offered skill
  const hasOfferedSkill = req.user.skillsOffered.some(skill => 
    skill.toLowerCase().includes(offeredSkill.toLowerCase())
  );
  
  if (!hasOfferedSkill) {
    return next(new AppError('You do not offer the specified skill', 400));
  }
  
  // Check for existing pending swap between these users
  const existingSwap = await Swap.findOne({
    $or: [
      { requester: req.user._id, receiver: receiver, status: 'pending' },
      { requester: receiver, receiver: req.user._id, status: 'pending' }
    ]
  });
  
  if (existingSwap) {
    return next(new AppError('A pending swap already exists between you and this user', 400));
  }
  
  // Create the swap
  const swap = await Swap.create({
    requester: req.user._id,
    receiver,
    requestedSkill,
    offeredSkill,
    message,
    meetingType,
    location,
    proposedDate
  });
  
  // Populate the swap with user details
  await swap.populate([
    { path: 'requester', select: 'name email profilePhoto' },
    { path: 'receiver', select: 'name email profilePhoto' }
  ]);
  
  res.status(201).json({
    success: true,
    message: 'Swap request created successfully',
    data: {
      swap
    }
  });
});

/**
 * Get all swaps for the current user
 * @route GET /api/swaps
 * @access Private
 */
const getUserSwaps = catchAsync(async (req, res, next) => {
  const { status, page = 1, limit = 20, sort = '-createdAt' } = req.query;
  
  const options = {
    status,
    skip: (page - 1) * limit,
    limit: parseInt(limit)
  };
  
  const swaps = await Swap.getSwapsByUser(req.user._id, options);
  
  const totalSwaps = await Swap.countDocuments({
    $or: [
      { requester: req.user._id },
      { receiver: req.user._id }
    ],
    ...(status && { status })
  });
  
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
 * Get a specific swap by ID
 * @route GET /api/swaps/:id
 * @access Private
 */
const getSwapById = catchAsync(async (req, res, next) => {
  const swapId = req.params.id;
  
  const swap = await Swap.findById(swapId)
    .populate('requester', 'name email profilePhoto averageRating')
    .populate('receiver', 'name email profilePhoto averageRating');
  
  if (!swap) {
    return next(new AppError('Swap not found', 404));
  }
  
  // Check if user is part of this swap
  const isParticipant = swap.requester._id.toString() === req.user._id.toString() ||
                       swap.receiver._id.toString() === req.user._id.toString();
  
  if (!isParticipant && req.user.role !== 'admin') {
    return next(new AppError('You do not have permission to view this swap', 403));
  }
  
  res.status(200).json({
    success: true,
    data: {
      swap
    }
  });
});

/**
 * Accept a swap request
 * @route PUT /api/swaps/:id/accept
 * @access Private
 */
const acceptSwap = catchAsync(async (req, res, next) => {
  const swapId = req.params.id;
  
  const swap = await Swap.findById(swapId);
  
  if (!swap) {
    return next(new AppError('Swap not found', 404));
  }
  
  // Check if user is the receiver
  if (swap.receiver.toString() !== req.user._id.toString()) {
    return next(new AppError('Only the receiver can accept the swap', 403));
  }
  
  // Check if swap is still pending
  if (swap.status !== 'pending') {
    return next(new AppError('This swap is no longer pending', 400));
  }
  
  // Accept the swap
  await swap.accept();
  
  // Populate the swap with user details
  await swap.populate([
    { path: 'requester', select: 'name email profilePhoto' },
    { path: 'receiver', select: 'name email profilePhoto' }
  ]);
  
  res.status(200).json({
    success: true,
    message: 'Swap accepted successfully',
    data: {
      swap
    }
  });
});

/**
 * Reject a swap request
 * @route PUT /api/swaps/:id/reject
 * @access Private
 */
const rejectSwap = catchAsync(async (req, res, next) => {
  const swapId = req.params.id;
  
  const swap = await Swap.findById(swapId);
  
  if (!swap) {
    return next(new AppError('Swap not found', 404));
  }
  
  // Check if user is the receiver
  if (swap.receiver.toString() !== req.user._id.toString()) {
    return next(new AppError('Only the receiver can reject the swap', 403));
  }
  
  // Check if swap is still pending
  if (swap.status !== 'pending') {
    return next(new AppError('This swap is no longer pending', 400));
  }
  
  // Reject the swap
  await swap.reject();
  
  // Populate the swap with user details
  await swap.populate([
    { path: 'requester', select: 'name email profilePhoto' },
    { path: 'receiver', select: 'name email profilePhoto' }
  ]);
  
  res.status(200).json({
    success: true,
    message: 'Swap rejected successfully',
    data: {
      swap
    }
  });
});

/**
 * Cancel a swap request
 * @route DELETE /api/swaps/:id
 * @access Private
 */
const cancelSwap = catchAsync(async (req, res, next) => {
  const swapId = req.params.id;
  
  const swap = await Swap.findById(swapId);
  
  if (!swap) {
    return next(new AppError('Swap not found', 404));
  }
  
  // Check if user is the requester
  if (swap.requester.toString() !== req.user._id.toString()) {
    return next(new AppError('Only the requester can cancel the swap', 403));
  }
  
  // Check if swap can be cancelled
  if (swap.status === 'completed') {
    return next(new AppError('Cannot cancel completed swap', 400));
  }
  
  // Cancel the swap
  await swap.cancel();
  
  res.status(200).json({
    success: true,
    message: 'Swap cancelled successfully'
  });
});

/**
 * Mark swap as completed
 * @route PUT /api/swaps/:id/complete
 * @access Private
 */
const completeSwap = catchAsync(async (req, res, next) => {
  const swapId = req.params.id;
  
  const swap = await Swap.findById(swapId);
  
  if (!swap) {
    return next(new AppError('Swap not found', 404));
  }
  
  // Check if user is part of this swap
  const isParticipant = swap.requester.toString() === req.user._id.toString() ||
                       swap.receiver.toString() === req.user._id.toString();
  
  if (!isParticipant) {
    return next(new AppError('You do not have permission to complete this swap', 403));
  }
  
  // Check if swap is accepted
  if (swap.status !== 'accepted') {
    return next(new AppError('Swap must be accepted before it can be completed', 400));
  }
  
  // Complete the swap
  await swap.complete();
  
  // Update user swap counts
  await User.findByIdAndUpdate(swap.requester, { $inc: { totalSwaps: 1 } });
  await User.findByIdAndUpdate(swap.receiver, { $inc: { totalSwaps: 1 } });
  
  // Populate the swap with user details
  await swap.populate([
    { path: 'requester', select: 'name email profilePhoto' },
    { path: 'receiver', select: 'name email profilePhoto' }
  ]);
  
  res.status(200).json({
    success: true,
    message: 'Swap completed successfully',
    data: {
      swap
    }
  });
});

/**
 * Get swap statistics for user
 * @route GET /api/swaps/stats
 * @access Private
 */
const getUserSwapStats = catchAsync(async (req, res, next) => {
  const stats = await Swap.getSwapStats(req.user._id);
  
  // Convert array to object for easier access
  const statusCounts = stats.reduce((acc, stat) => {
    acc[stat._id] = stat.count;
    return acc;
  }, {});
  
  const totalSwaps = stats.reduce((acc, stat) => acc + stat.count, 0);
  
  res.status(200).json({
    success: true,
    data: {
      stats: {
        total: totalSwaps,
        pending: statusCounts.pending || 0,
        accepted: statusCounts.accepted || 0,
        rejected: statusCounts.rejected || 0,
        cancelled: statusCounts.cancelled || 0,
        completed: statusCounts.completed || 0
      }
    }
  });
});

/**
 * Update swap details
 * @route PUT /api/swaps/:id
 * @access Private
 */
const updateSwap = catchAsync(async (req, res, next) => {
  const swapId = req.params.id;
  const { message, meetingType, location, proposedDate } = req.body;
  
  const swap = await Swap.findById(swapId);
  
  if (!swap) {
    return next(new AppError('Swap not found', 404));
  }
  
  // Check if user is the requester
  if (swap.requester.toString() !== req.user._id.toString()) {
    return next(new AppError('Only the requester can update swap details', 403));
  }
  
  // Check if swap is still pending
  if (swap.status !== 'pending') {
    return next(new AppError('Cannot update swap details after it has been responded to', 400));
  }
  
  // Update allowed fields
  const updates = {};
  if (message !== undefined) updates.message = message;
  if (meetingType) updates.meetingType = meetingType;
  if (location !== undefined) updates.location = location;
  if (proposedDate) updates.proposedDate = proposedDate;
  
  const updatedSwap = await Swap.findByIdAndUpdate(
    swapId,
    updates,
    { new: true, runValidators: true }
  ).populate([
    { path: 'requester', select: 'name email profilePhoto' },
    { path: 'receiver', select: 'name email profilePhoto' }
  ]);
  
  res.status(200).json({
    success: true,
    message: 'Swap updated successfully',
    data: {
      swap: updatedSwap
    }
  });
});

module.exports = {
  createSwap,
  getUserSwaps,
  getSwapById,
  acceptSwap,
  rejectSwap,
  cancelSwap,
  completeSwap,
  getUserSwapStats,
  updateSwap
};