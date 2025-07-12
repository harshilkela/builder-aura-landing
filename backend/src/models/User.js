const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema for the Skill Swap Platform
 * Includes authentication, profile information, skills, and preferences
 */
const userSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  
  // Profile Information
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  
  profilePhoto: {
    type: String,
    default: null
  },
  
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    trim: true
  },
  
  // Skills Management
  skillsOffered: [{
    type: String,
    trim: true,
    required: true
  }],
  
  skillsWanted: [{
    type: String,
    trim: true,
    required: true
  }],
  
  // Availability
  availability: [{
    type: String,
    enum: ['weekdays', 'weekends', 'mornings', 'afternoons', 'evenings', 'flexible'],
    trim: true
  }],
  
  // Privacy Settings
  isPublic: {
    type: Boolean,
    default: true
  },
  
  // User Status and Roles
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  
  isBanned: {
    type: Boolean,
    default: false
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  // User Statistics
  totalSwaps: {
    type: Number,
    default: 0
  },
  
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  
  totalRatings: {
    type: Number,
    default: 0
  },
  
  // Timestamps
  lastLogin: {
    type: Date
  },
  
  passwordChangedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ skillsOffered: 1 });
userSchema.index({ skillsWanted: 1 });
userSchema.index({ location: 1 });
userSchema.index({ isPublic: 1, isBanned: 1, isActive: 1 });

// Virtual for user's full profile completion percentage
userSchema.virtual('profileCompletion').get(function() {
  let completion = 0;
  const fields = ['name', 'email', 'location', 'bio', 'profilePhoto'];
  const skillFields = ['skillsOffered', 'skillsWanted'];
  
  fields.forEach(field => {
    if (this[field]) completion += 15;
  });
  
  skillFields.forEach(field => {
    if (this[field] && this[field].length > 0) completion += 12.5;
  });
  
  return Math.min(completion, 100);
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash password if it's been modified
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    return next(error);
  }
});

// Pre-save middleware to update passwordChangedAt
userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();
  
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to check if password changed after JWT was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Instance method to update rating
userSchema.methods.updateRating = function(newRating) {
  const totalPoints = this.averageRating * this.totalRatings + newRating;
  this.totalRatings += 1;
  this.averageRating = totalPoints / this.totalRatings;
  return this.save();
};

// Static method to search users by skills
userSchema.statics.searchBySkill = function(skill, options = {}) {
  const query = {
    isPublic: true,
    isBanned: false,
    isActive: true,
    $or: [
      { skillsOffered: { $regex: skill, $options: 'i' } },
      { skillsWanted: { $regex: skill, $options: 'i' } }
    ]
  };
  
  return this.find(query)
    .select('-password')
    .limit(options.limit || 20)
    .skip(options.skip || 0)
    .sort(options.sort || { averageRating: -1, totalSwaps: -1 });
};

module.exports = mongoose.model('User', userSchema);