const mongoose = require('mongoose');

/**
 * Swap Schema for managing skill exchange requests
 * Handles the complete lifecycle of skill swaps between users
 */
const swapSchema = new mongoose.Schema({
  // Participants
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Requester is required']
  },
  
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Receiver is required']
  },
  
  // Skill Details
  requestedSkill: {
    type: String,
    required: [true, 'Requested skill is required'],
    trim: true,
    maxlength: [100, 'Requested skill cannot exceed 100 characters']
  },
  
  offeredSkill: {
    type: String,
    required: [true, 'Offered skill is required'],
    trim: true,
    maxlength: [100, 'Offered skill cannot exceed 100 characters']
  },
  
  // Communication
  message: {
    type: String,
    trim: true,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  
  // Swap Status
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'cancelled', 'completed'],
    default: 'pending'
  },
  
  // Timestamps for status changes
  acceptedAt: {
    type: Date
  },
  
  rejectedAt: {
    type: Date
  },
  
  cancelledAt: {
    type: Date
  },
  
  completedAt: {
    type: Date
  },
  
  // Additional Details
  duration: {
    type: String,
    trim: true
  },
  
  meetingType: {
    type: String,
    enum: ['online', 'in-person', 'hybrid'],
    default: 'online'
  },
  
  location: {
    type: String,
    trim: true,
    maxlength: [200, 'Location cannot exceed 200 characters']
  },
  
  // Scheduling
  proposedDate: {
    type: Date
  },
  
  confirmedDate: {
    type: Date
  },
  
  // Metadata
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  
  isArchived: {
    type: Boolean,
    default: false
  },
  
  // Admin notes (for moderation)
  adminNotes: {
    type: String,
    trim: true
  },
  
  // Response deadline
  responseDeadline: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
swapSchema.index({ requester: 1, status: 1 });
swapSchema.index({ receiver: 1, status: 1 });
swapSchema.index({ status: 1, createdAt: -1 });
swapSchema.index({ requestedSkill: 1 });
swapSchema.index({ offeredSkill: 1 });
swapSchema.index({ responseDeadline: 1 });

// Compound index for efficient queries
swapSchema.index({ requester: 1, receiver: 1, status: 1 });

// Virtual to check if swap is expired
swapSchema.virtual('isExpired').get(function() {
  return this.status === 'pending' && this.responseDeadline < new Date();
});

// Virtual to get swap duration in days
swapSchema.virtual('daysSinceCreated').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Validation to prevent self-swaps
swapSchema.pre('save', function(next) {
  if (this.requester.toString() === this.receiver.toString()) {
    const error = new Error('Cannot create swap with yourself');
    error.statusCode = 400;
    return next(error);
  }
  next();
});

// Pre-save middleware to set timestamp based on status
swapSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    const now = new Date();
    
    switch (this.status) {
      case 'accepted':
        if (!this.acceptedAt) this.acceptedAt = now;
        break;
      case 'rejected':
        if (!this.rejectedAt) this.rejectedAt = now;
        break;
      case 'cancelled':
        if (!this.cancelledAt) this.cancelledAt = now;
        break;
      case 'completed':
        if (!this.completedAt) this.completedAt = now;
        break;
    }
  }
  next();
});

// Instance method to accept swap
swapSchema.methods.accept = function() {
  this.status = 'accepted';
  this.acceptedAt = new Date();
  return this.save();
};

// Instance method to reject swap
swapSchema.methods.reject = function() {
  this.status = 'rejected';
  this.rejectedAt = new Date();
  return this.save();
};

// Instance method to cancel swap
swapSchema.methods.cancel = function() {
  this.status = 'cancelled';
  this.cancelledAt = new Date();
  return this.save();
};

// Instance method to complete swap
swapSchema.methods.complete = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

// Static method to get swaps by user
swapSchema.statics.getSwapsByUser = function(userId, options = {}) {
  const query = {
    $or: [
      { requester: userId },
      { receiver: userId }
    ]
  };
  
  if (options.status) {
    query.status = options.status;
  }
  
  return this.find(query)
    .populate('requester', 'name email profilePhoto averageRating')
    .populate('receiver', 'name email profilePhoto averageRating')
    .sort({ createdAt: -1 })
    .limit(options.limit || 50)
    .skip(options.skip || 0);
};

// Static method to get swap statistics
swapSchema.statics.getSwapStats = function(userId) {
  return this.aggregate([
    {
      $match: {
        $or: [
          { requester: mongoose.Types.ObjectId(userId) },
          { receiver: mongoose.Types.ObjectId(userId) }
        ]
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

// Static method to find expired swaps
swapSchema.statics.findExpiredSwaps = function() {
  return this.find({
    status: 'pending',
    responseDeadline: { $lt: new Date() }
  });
};

// Static method to get admin swap overview
swapSchema.statics.getAdminOverview = function(options = {}) {
  const matchStage = {};
  
  if (options.startDate && options.endDate) {
    matchStage.createdAt = {
      $gte: new Date(options.startDate),
      $lte: new Date(options.endDate)
    };
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        averageResponseTime: {
          $avg: {
            $subtract: ['$acceptedAt', '$createdAt']
          }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Swap', swapSchema);