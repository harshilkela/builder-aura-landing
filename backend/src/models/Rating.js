const mongoose = require('mongoose');

/**
 * Rating Schema for user feedback and ratings
 * Allows users to rate and provide feedback after completed swaps
 */
const ratingSchema = new mongoose.Schema({
  // Relationship to swap
  swap: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Swap',
    required: [true, 'Swap reference is required']
  },
  
  // Rating participants
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reviewer is required']
  },
  
  reviewee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reviewee is required']
  },
  
  // Rating details
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
    validate: {
      validator: function(value) {
        return Number.isInteger(value);
      },
      message: 'Rating must be a whole number'
    }
  },
  
  feedback: {
    type: String,
    trim: true,
    maxlength: [1000, 'Feedback cannot exceed 1000 characters']
  },
  
  // Rating categories for detailed feedback
  categories: {
    communication: {
      type: Number,
      min: 1,
      max: 5
    },
    skillLevel: {
      type: Number,
      min: 1,
      max: 5
    },
    punctuality: {
      type: Number,
      min: 1,
      max: 5
    },
    helpfulness: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  
  // Skill-specific feedback
  skillTaught: {
    type: String,
    trim: true,
    maxlength: [100, 'Skill taught cannot exceed 100 characters']
  },
  
  skillLearned: {
    type: String,
    trim: true,
    maxlength: [100, 'Skill learned cannot exceed 100 characters']
  },
  
  // Recommendation
  wouldRecommend: {
    type: Boolean,
    default: true
  },
  
  // Privacy settings
  isPublic: {
    type: Boolean,
    default: true
  },
  
  isAnonymous: {
    type: Boolean,
    default: false
  },
  
  // Moderation
  isApproved: {
    type: Boolean,
    default: true
  },
  
  isFlagged: {
    type: Boolean,
    default: false
  },
  
  flagReason: {
    type: String,
    trim: true
  },
  
  // Admin review
  adminReviewed: {
    type: Boolean,
    default: false
  },
  
  adminNotes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
ratingSchema.index({ swap: 1 });
ratingSchema.index({ reviewer: 1 });
ratingSchema.index({ reviewee: 1 });
ratingSchema.index({ rating: 1 });
ratingSchema.index({ isPublic: 1, isApproved: 1 });
ratingSchema.index({ createdAt: -1 });

// Compound indexes
ratingSchema.index({ reviewee: 1, isPublic: 1, isApproved: 1 });
ratingSchema.index({ swap: 1, reviewer: 1 }, { unique: true }); // Prevent duplicate ratings

// Virtual for overall category average
ratingSchema.virtual('categoryAverage').get(function() {
  if (!this.categories) return null;
  
  const categories = this.categories;
  const validRatings = Object.values(categories).filter(rating => rating && rating > 0);
  
  if (validRatings.length === 0) return null;
  
  const sum = validRatings.reduce((acc, rating) => acc + rating, 0);
  return (sum / validRatings.length).toFixed(1);
});

// Virtual to check if rating is recent
ratingSchema.virtual('isRecent').get(function() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return this.createdAt > thirtyDaysAgo;
});

// Validation to prevent self-rating
ratingSchema.pre('save', function(next) {
  if (this.reviewer.toString() === this.reviewee.toString()) {
    const error = new Error('Cannot rate yourself');
    error.statusCode = 400;
    return next(error);
  }
  next();
});

// Pre-save middleware to validate swap completion
ratingSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const Swap = mongoose.model('Swap');
      const swap = await Swap.findById(this.swap);
      
      if (!swap) {
        const error = new Error('Swap not found');
        error.statusCode = 404;
        return next(error);
      }
      
      if (swap.status !== 'completed') {
        const error = new Error('Can only rate completed swaps');
        error.statusCode = 400;
        return next(error);
      }
      
      // Verify that reviewer is part of the swap
      const isParticipant = swap.requester.toString() === this.reviewer.toString() || 
                           swap.receiver.toString() === this.reviewer.toString();
      
      if (!isParticipant) {
        const error = new Error('Only swap participants can leave ratings');
        error.statusCode = 403;
        return next(error);
      }
      
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// Post-save middleware to update user's average rating
ratingSchema.post('save', async function() {
  try {
    const User = mongoose.model('User');
    const user = await User.findById(this.reviewee);
    
    if (user) {
      await user.updateRating(this.rating);
    }
  } catch (error) {
    console.error('Error updating user rating:', error);
  }
});

// Instance method to approve rating
ratingSchema.methods.approve = function() {
  this.isApproved = true;
  this.adminReviewed = true;
  return this.save();
};

// Instance method to flag rating
ratingSchema.methods.flag = function(reason) {
  this.isFlagged = true;
  this.flagReason = reason;
  this.isApproved = false;
  return this.save();
};

// Static method to get ratings for a user
ratingSchema.statics.getUserRatings = function(userId, options = {}) {
  const query = {
    reviewee: userId,
    isPublic: true,
    isApproved: true
  };
  
  return this.find(query)
    .populate('reviewer', 'name profilePhoto')
    .populate('swap', 'requestedSkill offeredSkill completedAt')
    .sort({ createdAt: -1 })
    .limit(options.limit || 20)
    .skip(options.skip || 0);
};

// Static method to get rating statistics for a user
ratingSchema.statics.getUserRatingStats = function(userId) {
  return this.aggregate([
    {
      $match: {
        reviewee: mongoose.Types.ObjectId(userId),
        isPublic: true,
        isApproved: true
      }
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalRatings: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        },
        averageCommunication: { $avg: '$categories.communication' },
        averageSkillLevel: { $avg: '$categories.skillLevel' },
        averagePunctuality: { $avg: '$categories.punctuality' },
        averageHelpfulness: { $avg: '$categories.helpfulness' },
        recommendationRate: {
          $avg: {
            $cond: ['$wouldRecommend', 1, 0]
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        averageRating: { $round: ['$averageRating', 2] },
        totalRatings: 1,
        ratingDistribution: 1,
        categoryAverages: {
          communication: { $round: ['$averageCommunication', 2] },
          skillLevel: { $round: ['$averageSkillLevel', 2] },
          punctuality: { $round: ['$averagePunctuality', 2] },
          helpfulness: { $round: ['$averageHelpfulness', 2] }
        },
        recommendationRate: { $round: ['$recommendationRate', 2] }
      }
    }
  ]);
};

// Static method to get recent ratings for admin review
ratingSchema.statics.getRecentRatings = function(options = {}) {
  const query = {};
  
  if (options.flagged) {
    query.isFlagged = true;
  }
  
  if (options.unreviewed) {
    query.adminReviewed = false;
  }
  
  return this.find(query)
    .populate('reviewer', 'name email')
    .populate('reviewee', 'name email')
    .populate('swap', 'requestedSkill offeredSkill')
    .sort({ createdAt: -1 })
    .limit(options.limit || 50);
};

// Static method to get rating trends
ratingSchema.statics.getRatingTrends = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        },
        isApproved: true
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        averageRating: { $avg: '$rating' },
        totalRatings: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
    }
  ]);
};

module.exports = mongoose.model('Rating', ratingSchema);