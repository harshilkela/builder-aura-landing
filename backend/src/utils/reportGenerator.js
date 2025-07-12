const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');
const fs = require('fs');

/**
 * Report Generator Utility
 * Helper functions for generating CSV reports and analytics
 */

/**
 * Ensure temporary directory exists
 */
const ensureTempDir = () => {
  const tempDir = path.join(__dirname, '../temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  return tempDir;
};

/**
 * Generate CSV file from data
 * @param {Array} data - Array of objects to convert to CSV
 * @param {Array} headers - Array of header objects with id and title
 * @param {string} filename - Name of the CSV file
 * @returns {string} - Path to the generated CSV file
 */
const generateCSV = async (data, headers, filename) => {
  const tempDir = ensureTempDir();
  const filePath = path.join(tempDir, filename);
  
  const csvWriter = createCsvWriter({
    path: filePath,
    header: headers
  });
  
  await csvWriter.writeRecords(data);
  return filePath;
};

/**
 * Clean up temporary files
 * @param {string} filePath - Path to the file to clean up
 */
const cleanupFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error cleaning up file:', error);
  }
};

/**
 * Format user data for CSV export
 * @param {Array} users - Array of user objects
 * @returns {Array} - Formatted data for CSV
 */
const formatUserDataForCSV = (users) => {
  return users.map(user => ({
    id: user._id,
    name: user.name,
    email: user.email,
    location: user.location || 'Not specified',
    skillsOffered: user.skillsOffered.join(', '),
    skillsWanted: user.skillsWanted.join(', '),
    totalSwaps: user.totalSwaps,
    averageRating: user.averageRating,
    totalRatings: user.totalRatings,
    isActive: user.isActive ? 'Yes' : 'No',
    isBanned: user.isBanned ? 'Yes' : 'No',
    createdAt: user.createdAt.toISOString(),
    lastLogin: user.lastLogin ? user.lastLogin.toISOString() : 'Never'
  }));
};

/**
 * Format swap data for CSV export
 * @param {Array} swaps - Array of swap objects
 * @returns {Array} - Formatted data for CSV
 */
const formatSwapDataForCSV = (swaps) => {
  return swaps.map(swap => ({
    id: swap._id,
    requesterName: swap.requester.name,
    requesterEmail: swap.requester.email,
    receiverName: swap.receiver.name,
    receiverEmail: swap.receiver.email,
    requestedSkill: swap.requestedSkill,
    offeredSkill: swap.offeredSkill,
    status: swap.status,
    meetingType: swap.meetingType,
    location: swap.location || 'Not specified',
    message: swap.message || 'No message',
    createdAt: swap.createdAt.toISOString(),
    acceptedAt: swap.acceptedAt ? swap.acceptedAt.toISOString() : 'Not accepted',
    rejectedAt: swap.rejectedAt ? swap.rejectedAt.toISOString() : 'Not rejected',
    completedAt: swap.completedAt ? swap.completedAt.toISOString() : 'Not completed',
    responseTime: swap.acceptedAt ? 
      Math.round((swap.acceptedAt - swap.createdAt) / (1000 * 60 * 60 * 24)) : 
      'No response'
  }));
};

/**
 * Format rating data for CSV export
 * @param {Array} ratings - Array of rating objects
 * @returns {Array} - Formatted data for CSV
 */
const formatRatingDataForCSV = (ratings) => {
  return ratings.map(rating => ({
    id: rating._id,
    reviewerName: rating.reviewer.name,
    reviewerEmail: rating.reviewer.email,
    revieweeName: rating.reviewee.name,
    revieweeEmail: rating.reviewee.email,
    rating: rating.rating,
    feedback: rating.feedback || 'No feedback',
    communication: rating.categories?.communication || 'Not rated',
    skillLevel: rating.categories?.skillLevel || 'Not rated',
    punctuality: rating.categories?.punctuality || 'Not rated',
    helpfulness: rating.categories?.helpfulness || 'Not rated',
    wouldRecommend: rating.wouldRecommend ? 'Yes' : 'No',
    isPublic: rating.isPublic ? 'Yes' : 'No',
    isAnonymous: rating.isAnonymous ? 'Yes' : 'No',
    isFlagged: rating.isFlagged ? 'Yes' : 'No',
    flagReason: rating.flagReason || 'Not flagged',
    createdAt: rating.createdAt.toISOString()
  }));
};

/**
 * Get standard CSV headers for different report types
 */
const getCSVHeaders = {
  users: [
    { id: 'id', title: 'ID' },
    { id: 'name', title: 'Name' },
    { id: 'email', title: 'Email' },
    { id: 'location', title: 'Location' },
    { id: 'skillsOffered', title: 'Skills Offered' },
    { id: 'skillsWanted', title: 'Skills Wanted' },
    { id: 'totalSwaps', title: 'Total Swaps' },
    { id: 'averageRating', title: 'Average Rating' },
    { id: 'totalRatings', title: 'Total Ratings' },
    { id: 'isActive', title: 'Active' },
    { id: 'isBanned', title: 'Banned' },
    { id: 'createdAt', title: 'Registration Date' },
    { id: 'lastLogin', title: 'Last Login' }
  ],
  
  swaps: [
    { id: 'id', title: 'ID' },
    { id: 'requesterName', title: 'Requester Name' },
    { id: 'requesterEmail', title: 'Requester Email' },
    { id: 'receiverName', title: 'Receiver Name' },
    { id: 'receiverEmail', title: 'Receiver Email' },
    { id: 'requestedSkill', title: 'Requested Skill' },
    { id: 'offeredSkill', title: 'Offered Skill' },
    { id: 'status', title: 'Status' },
    { id: 'meetingType', title: 'Meeting Type' },
    { id: 'location', title: 'Location' },
    { id: 'message', title: 'Message' },
    { id: 'createdAt', title: 'Created At' },
    { id: 'acceptedAt', title: 'Accepted At' },
    { id: 'rejectedAt', title: 'Rejected At' },
    { id: 'completedAt', title: 'Completed At' },
    { id: 'responseTime', title: 'Response Time (Days)' }
  ],
  
  ratings: [
    { id: 'id', title: 'ID' },
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
    { id: 'isPublic', title: 'Public' },
    { id: 'isAnonymous', title: 'Anonymous' },
    { id: 'isFlagged', title: 'Flagged' },
    { id: 'flagReason', title: 'Flag Reason' },
    { id: 'createdAt', title: 'Created At' }
  ]
};

module.exports = {
  generateCSV,
  cleanupFile,
  formatUserDataForCSV,
  formatSwapDataForCSV,
  formatRatingDataForCSV,
  getCSVHeaders,
  ensureTempDir
};