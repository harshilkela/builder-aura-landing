# Skill Swap Platform Backend

A comprehensive Node.js + Express backend with MongoDB for a Skill Swap Platform. This backend provides a complete API for user management, skill swapping, ratings, and administrative functions.

## 🚀 Features

- **User Authentication & Authorization** - JWT-based authentication with role-based access control
- **User Profile Management** - Complete user profiles with skills, availability, and privacy settings
- **Skill Swap System** - Create, manage, and track skill exchange requests
- **Rating & Feedback System** - Rate users after completed swaps with detailed feedback
- **Admin Panel** - Comprehensive admin features for platform management
- **Real-time Notifications** - Platform-wide messaging system
- **Analytics & Reporting** - CSV exports and detailed analytics
- **Security & Rate Limiting** - Comprehensive security measures and API rate limiting

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd skill-swap-platform/backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Configure your environment variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/skill-swap-db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_EXPIRES_IN=7d

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# File Upload Configuration
MAX_FILE_SIZE=5000000
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

### 4. Database Setup

Ensure MongoDB is running on your system:

```bash
# For MongoDB Community Edition
mongod

# Or if using MongoDB service
sudo systemctl start mongod
```

### 5. Start the Server

```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## 🔧 Available Scripts

- `npm start` - Start the server in production mode
- `npm run dev` - Start the server in development mode with nodemon
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## 📚 API Documentation

### Base URL

```
http://localhost:5000/api
```

### Response Format

All API responses follow this format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response Format

```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

## 🔐 Authentication Endpoints

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "skillsOffered": ["JavaScript", "React", "Node.js"],
  "skillsWanted": ["Python", "Machine Learning"],
  "location": "New York",
  "availability": ["evenings", "weekends"]
}
```

### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <jwt-token>
```

### Update Password
```http
PUT /api/auth/password
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword123",
  "confirmPassword": "NewPassword123"
}
```

### Logout
```http
POST /api/auth/logout
Authorization: Bearer <jwt-token>
```

## 👥 User Management Endpoints

### Search Users
```http
GET /api/users/search?skill=JavaScript&location=New York&page=1&limit=20
```

### Get User Profile
```http
GET /api/users/:id
```

### Update User Profile
```http
PUT /api/users/:id
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "name": "Jane Doe",
  "location": "San Francisco",
  "bio": "Full-stack developer passionate about learning new technologies",
  "availability": ["weekdays", "evenings"]
}
```

### Update User Skills
```http
PUT /api/users/:id/skills
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "skillsOffered": ["JavaScript", "React", "Node.js", "Python"],
  "skillsWanted": ["Machine Learning", "Data Science", "AWS"]
}
```

### Get User Statistics
```http
GET /api/users/:id/stats
```

## 🔄 Swap Management Endpoints

### Create Swap Request
```http
POST /api/swaps
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "receiver": "605c72ef1d2d8b001f8b4567",
  "requestedSkill": "Python",
  "offeredSkill": "JavaScript",
  "message": "I'd love to learn Python from you while teaching JavaScript!",
  "meetingType": "online",
  "proposedDate": "2024-02-15T14:00:00Z"
}
```

### Get User Swaps
```http
GET /api/swaps?status=pending&page=1&limit=10
Authorization: Bearer <jwt-token>
```

### Get Swap Details
```http
GET /api/swaps/:id
Authorization: Bearer <jwt-token>
```

### Accept Swap
```http
PUT /api/swaps/:id/accept
Authorization: Bearer <jwt-token>
```

### Reject Swap
```http
PUT /api/swaps/:id/reject
Authorization: Bearer <jwt-token>
```

### Cancel Swap
```http
DELETE /api/swaps/:id
Authorization: Bearer <jwt-token>
```

### Complete Swap
```http
PUT /api/swaps/:id/complete
Authorization: Bearer <jwt-token>
```

## ⭐ Rating & Feedback Endpoints

### Create Rating
```http
POST /api/ratings
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "swap": "605c72ef1d2d8b001f8b4567",
  "reviewee": "605c72ef1d2d8b001f8b4568",
  "rating": 5,
  "feedback": "Excellent teacher! Very patient and knowledgeable.",
  "categories": {
    "communication": 5,
    "skillLevel": 5,
    "punctuality": 5,
    "helpfulness": 5
  },
  "wouldRecommend": true,
  "isPublic": true
}
```

### Get User Ratings
```http
GET /api/ratings/user/:userId?page=1&limit=20
```

### Get Rating Statistics
```http
GET /api/ratings/user/:userId/stats
```

### Get Ratings Given
```http
GET /api/ratings/given?page=1&limit=20
Authorization: Bearer <jwt-token>
```

### Get Ratings Received
```http
GET /api/ratings/received?page=1&limit=20
Authorization: Bearer <jwt-token>
```

### Flag Rating
```http
POST /api/ratings/:id/flag
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "reason": "Inappropriate content"
}
```

## 👨‍💼 Admin Endpoints

### Get Dashboard Statistics
```http
GET /api/admin/dashboard
Authorization: Bearer <admin-jwt-token>
```

### Ban User
```http
PUT /api/admin/users/:id/ban
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

{
  "reason": "Violation of community guidelines"
}
```

### Unban User
```http
PUT /api/admin/users/:id/unban
Authorization: Bearer <admin-jwt-token>
```

### Get All Swaps
```http
GET /api/admin/swaps?status=pending&page=1&limit=50
Authorization: Bearer <admin-jwt-token>
```

### Create Platform Message
```http
POST /api/admin/messages
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

{
  "title": "Platform Maintenance",
  "message": "We'll be performing maintenance on Sunday from 2-4 AM EST.",
  "type": "maintenance",
  "priority": "high",
  "targetUserType": "all"
}
```

### Generate Reports
```http
GET /api/admin/reports/user-activity?startDate=2024-01-01&endDate=2024-02-01&format=csv
Authorization: Bearer <admin-jwt-token>
```

## 🔒 Security Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (user, admin)
- Password hashing with bcrypt
- Token expiration and refresh

### Input Validation
- Comprehensive request validation using express-validator
- SQL injection prevention
- XSS protection
- Rate limiting per IP

### Security Headers
- Helmet.js for security headers
- CORS configuration
- Request size limits

## 📊 Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  location: String,
  bio: String,
  profilePhoto: String,
  skillsOffered: [String],
  skillsWanted: [String],
  availability: [String],
  isPublic: Boolean,
  role: String (user/admin),
  isBanned: Boolean,
  isActive: Boolean,
  totalSwaps: Number,
  averageRating: Number,
  totalRatings: Number,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Swap Model
```javascript
{
  requester: ObjectId (User),
  receiver: ObjectId (User),
  requestedSkill: String,
  offeredSkill: String,
  message: String,
  status: String (pending/accepted/rejected/cancelled/completed),
  meetingType: String (online/in-person/hybrid),
  location: String,
  proposedDate: Date,
  confirmedDate: Date,
  acceptedAt: Date,
  rejectedAt: Date,
  completedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Rating Model
```javascript
{
  swap: ObjectId (Swap),
  reviewer: ObjectId (User),
  reviewee: ObjectId (User),
  rating: Number (1-5),
  feedback: String,
  categories: {
    communication: Number (1-5),
    skillLevel: Number (1-5),
    punctuality: Number (1-5),
    helpfulness: Number (1-5)
  },
  wouldRecommend: Boolean,
  isPublic: Boolean,
  isAnonymous: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## 🚦 Error Handling

The API uses standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## 📈 Performance & Scaling

### Database Indexes
- User email (unique)
- Skills offered and wanted
- Swap status and participants
- Rating relationships

### Caching Strategy
- Consider implementing Redis for session management
- Cache frequently accessed user profiles
- Cache search results

### Rate Limiting
- 100 requests per 15 minutes per IP
- Configurable via environment variables

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test -- --grep "User Authentication"

# Run with coverage
npm run test:coverage
```

## 📝 Development Guidelines

### Code Style
- Use ES6+ features
- Follow async/await pattern
- Implement proper error handling
- Add comprehensive comments

### Git Workflow
1. Create feature branch
2. Make changes
3. Add tests
4. Submit pull request

### Database Best Practices
- Use transactions for critical operations
- Implement proper indexing
- Validate data at model level

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Error**
   ```
   Error: MongoNetworkError: failed to connect to server
   ```
   - Ensure MongoDB is running
   - Check connection string in .env

2. **JWT Token Error**
   ```
   Error: JsonWebTokenError: invalid signature
   ```
   - Verify JWT_SECRET in .env
   - Check token format in Authorization header

3. **Rate Limit Exceeded**
   ```
   Error: Too many requests
   ```
   - Wait for rate limit window to reset
   - Implement exponential backoff

### Debug Mode

Enable debug logging:
```bash
DEBUG=skill-swap:* npm run dev
```

## 🚀 Deployment

### Production Checklist
- [ ] Set NODE_ENV=production
- [ ] Configure secure JWT_SECRET
- [ ] Set up MongoDB replica set
- [ ] Configure SSL/TLS
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy

### Docker Support
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For questions or support:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

## 🎯 Quick Start Example

Here's a complete example of registering a user and creating a swap:

```javascript
// Register a new user
const registerResponse = await fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'SecurePass123',
    skillsOffered: ['JavaScript', 'React'],
    skillsWanted: ['Python', 'Django'],
    location: 'New York'
  })
});

const { token } = await registerResponse.json();

// Create a swap request
const swapResponse = await fetch('http://localhost:5000/api/swaps', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    receiver: '605c72ef1d2d8b001f8b4567',
    requestedSkill: 'Python',
    offeredSkill: 'JavaScript',
    message: 'I would love to learn Python from you!',
    meetingType: 'online'
  })
});

const swapData = await swapResponse.json();
console.log('Swap created:', swapData);
```

This backend provides a complete, production-ready API for a skill swap platform with all the features needed for a modern web application.