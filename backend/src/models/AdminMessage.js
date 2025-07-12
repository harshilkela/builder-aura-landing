const mongoose = require('mongoose');

/**
 * AdminMessage Schema for platform-wide messages and announcements
 * Allows admins to send messages to users and track message delivery
 */
const adminMessageSchema = new mongoose.Schema({
  // Message content
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  
  // Message type and priority
  type: {
    type: String,
    enum: ['announcement', 'maintenance', 'update', 'warning', 'promotion'],
    default: 'announcement'
  },
  
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Targeting
  targetUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  targetUserType: {
    type: String,
    enum: ['all', 'active', 'inactive', 'new', 'premium', 'specific'],
    default: 'all'
  },
  
  // Scheduling
  scheduledAt: {
    type: Date,
    default: Date.now
  },
  
  expiresAt: {
    type: Date
  },
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sent', 'cancelled'],
    default: 'draft'
  },
  
  // Delivery tracking
  totalRecipients: {
    type: Number,
    default: 0
  },
  
  deliveredTo: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    deliveredAt: {
      type: Date,
      default: Date.now
    },
    readAt: {
      type: Date
    },
    isRead: {
      type: Boolean,
      default: false
    }
  }],
  
  // Engagement metrics
  totalViews: {
    type: Number,
    default: 0
  },
  
  totalClicks: {
    type: Number,
    default: 0
  },
  
  // Admin information
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required']
  },
  
  // Additional settings
  isSticky: {
    type: Boolean,
    default: false
  },
  
  allowReplies: {
    type: Boolean,
    default: false
  },
  
  includeInEmail: {
    type: Boolean,
    default: false
  },
  
  includeInNotification: {
    type: Boolean,
    default: true
  },
  
  // Styling and display
  backgroundColor: {
    type: String,
    default: '#f8f9fa'
  },
  
  textColor: {
    type: String,
    default: '#333333'
  },
  
  icon: {
    type: String
  },
  
  // Action buttons
  actionButtons: [{
    label: {
      type: String,
      maxlength: [50, 'Button label cannot exceed 50 characters']
    },
    url: {
      type: String,
      maxlength: [500, 'URL cannot exceed 500 characters']
    },
    style: {
      type: String,
      enum: ['primary', 'secondary', 'success', 'danger', 'warning', 'info'],
      default: 'primary'
    }
  }],
  
  // Metadata
  tags: [{
    type: String,
    trim: true
  }],
  
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
adminMessageSchema.index({ status: 1, scheduledAt: 1 });
adminMessageSchema.index({ createdBy: 1 });
adminMessageSchema.index({ type: 1, priority: 1 });
adminMessageSchema.index({ targetUserType: 1 });
adminMessageSchema.index({ expiresAt: 1 });
adminMessageSchema.index({ isSticky: 1, status: 1 });

// Virtual for delivery rate
adminMessageSchema.virtual('deliveryRate').get(function() {
  if (this.totalRecipients === 0) return 0;
  return ((this.deliveredTo.length / this.totalRecipients) * 100).toFixed(2);
});

// Virtual for read rate
adminMessageSchema.virtual('readRate').get(function() {
  if (this.deliveredTo.length === 0) return 0;
  const readCount = this.deliveredTo.filter(delivery => delivery.isRead).length;
  return ((readCount / this.deliveredTo.length) * 100).toFixed(2);
});

// Virtual for click-through rate
adminMessageSchema.virtual('clickThroughRate').get(function() {
  if (this.totalViews === 0) return 0;
  return ((this.totalClicks / this.totalViews) * 100).toFixed(2);
});

// Virtual to check if message is expired
adminMessageSchema.virtual('isExpired').get(function() {
  return this.expiresAt && this.expiresAt < new Date();
});

// Virtual to check if message is active
adminMessageSchema.virtual('isActive').get(function() {
  return this.status === 'sent' && !this.isExpired && !this.isArchived;
});

// Pre-save middleware to set total recipients
adminMessageSchema.pre('save', async function(next) {
  if (this.isModified('targetUsers') || this.isModified('targetUserType')) {
    try {
      const User = mongoose.model('User');
      let recipientCount = 0;
      
      switch (this.targetUserType) {
        case 'all':
          recipientCount = await User.countDocuments({ isActive: true, isBanned: false });
          break;
        case 'active':
          recipientCount = await User.countDocuments({ 
            isActive: true, 
            isBanned: false,
            lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          });
          break;
        case 'inactive':
          recipientCount = await User.countDocuments({ 
            isActive: true, 
            isBanned: false,
            lastLogin: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          });
          break;
        case 'new':
          recipientCount = await User.countDocuments({ 
            isActive: true, 
            isBanned: false,
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
          });
          break;
        case 'specific':
          recipientCount = this.targetUsers.length;
          break;
        default:
          recipientCount = await User.countDocuments({ isActive: true, isBanned: false });
      }
      
      this.totalRecipients = recipientCount;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// Instance method to mark as read by user
adminMessageSchema.methods.markAsRead = function(userId) {
  const delivery = this.deliveredTo.find(d => d.user.toString() === userId.toString());
  if (delivery && !delivery.isRead) {
    delivery.isRead = true;
    delivery.readAt = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

// Instance method to increment view count
adminMessageSchema.methods.incrementViews = function() {
  this.totalViews += 1;
  return this.save();
};

// Instance method to increment click count
adminMessageSchema.methods.incrementClicks = function() {
  this.totalClicks += 1;
  return this.save();
};

// Instance method to send message
adminMessageSchema.methods.send = async function() {
  try {
    const User = mongoose.model('User');
    let recipients = [];
    
    switch (this.targetUserType) {
      case 'all':
        recipients = await User.find({ isActive: true, isBanned: false }, '_id');
        break;
      case 'active':
        recipients = await User.find({ 
          isActive: true, 
          isBanned: false,
          lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }, '_id');
        break;
      case 'inactive':
        recipients = await User.find({ 
          isActive: true, 
          isBanned: false,
          lastLogin: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }, '_id');
        break;
      case 'new':
        recipients = await User.find({ 
          isActive: true, 
          isBanned: false,
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }, '_id');
        break;
      case 'specific':
        recipients = this.targetUsers.map(id => ({ _id: id }));
        break;
      default:
        recipients = await User.find({ isActive: true, isBanned: false }, '_id');
    }
    
    // Create delivery entries
    this.deliveredTo = recipients.map(user => ({
      user: user._id,
      deliveredAt: new Date(),
      isRead: false
    }));
    
    this.status = 'sent';
    this.totalRecipients = recipients.length;
    
    return this.save();
  } catch (error) {
    throw error;
  }
};

// Static method to get active messages for user
adminMessageSchema.statics.getActiveMessagesForUser = function(userId) {
  return this.find({
    status: 'sent',
    $or: [
      { expiresAt: { $gt: new Date() } },
      { expiresAt: { $exists: false } }
    ],
    isArchived: false,
    $or: [
      { targetUserType: { $in: ['all', 'active'] } },
      { targetUsers: userId }
    ]
  }).sort({ isSticky: -1, createdAt: -1 });
};

// Static method to get unread messages for user
adminMessageSchema.statics.getUnreadMessagesForUser = function(userId) {
  return this.find({
    status: 'sent',
    $or: [
      { expiresAt: { $gt: new Date() } },
      { expiresAt: { $exists: false } }
    ],
    isArchived: false,
    $or: [
      { targetUserType: { $in: ['all', 'active'] } },
      { targetUsers: userId }
    ],
    'deliveredTo.user': userId,
    'deliveredTo.isRead': false
  }).sort({ createdAt: -1 });
};

// Static method to get message statistics
adminMessageSchema.statics.getMessageStats = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalRecipients: { $sum: '$totalRecipients' },
        totalViews: { $sum: '$totalViews' },
        totalClicks: { $sum: '$totalClicks' },
        avgDeliveryRate: { $avg: '$deliveryRate' }
      }
    }
  ]);
};

// Static method to clean up expired messages
adminMessageSchema.statics.cleanupExpiredMessages = function() {
  return this.updateMany(
    {
      expiresAt: { $lt: new Date() },
      status: 'sent'
    },
    {
      $set: { isArchived: true }
    }
  );
};

module.exports = mongoose.model('AdminMessage', adminMessageSchema);