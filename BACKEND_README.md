# Backend API Documentation

## Overview
This is a Node.js + Express backend API with JWT authentication, MongoDB database, and full CRUD operations for users and products.

## Features
- 🔐 JWT-based authentication
- 👥 User registration and login
- 📦 Product management (CRUD)
- 🔍 Product search and filtering
- 📊 Pagination support
- ✅ Input validation
- 🛡️ Security middleware
- 🏗️ Clean architecture (MVC pattern)

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JSON Web Tokens (JWT)
- **Password Security**: bcryptjs
- **Validation**: express-validator
- **Environment**: dotenv

## Project Structure
```
├── controllers/          # Request handlers
│   ├── userController.js
│   └── productController.js
├── middleware/          # Custom middleware
│   ├── auth.js
│   └── validation.js
├── models/              # Database models
│   ├── User.js
│   └── Product.js
├── routes/              # API routes
│   ├── users.js
│   └── products.js
├── server.js            # Main server file
└── .env                 # Environment variables
```

## Setup Instructions

### 1. Environment Variables
Create a `.env` file in the root directory with the following variables:

```env
MONGODB_URI=mongodb://localhost:27017/fusion-app
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5000
NODE_ENV=development
```

**Important**: Change the JWT_SECRET to a strong, random string in production!

### 2. Database Setup
Make sure MongoDB is running on your system:
- Install MongoDB locally or use MongoDB Atlas
- Update the `MONGODB_URI` in your `.env` file accordingly

### 3. Running the Server
```bash
# Development mode (with nodemon)
npm run dev:server

# Production mode
npm run server
```

The server will start on port 5000 (or the port specified in your .env file).

## API Endpoints

### Authentication Endpoints

#### Register User
- **POST** `/api/users/register`
- **Body**:
  ```json
  {
    "username": "john_doe",
    "email": "john@example.com",
    "password": "Password123",
    "firstName": "John",
    "lastName": "Doe"
  }
  ```
- **Response**: User object + JWT token

#### Login User
- **POST** `/api/users/login`
- **Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "Password123"
  }
  ```
- **Response**: User object + JWT token

### User Management Endpoints

#### Get User Profile
- **GET** `/api/users/profile`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: User profile information

#### Update User Profile
- **PUT** `/api/users/profile`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "username": "updated_username",
    "email": "updated@example.com",
    "firstName": "Updated",
    "lastName": "Name",
    "avatar": "https://example.com/avatar.jpg"
  }
  ```

#### Get All Users (Admin Only)
- **GET** `/api/users?page=1&limit=10`
- **Headers**: `Authorization: Bearer <admin_token>`
- **Query Parameters**: `page`, `limit`

#### Delete User (Admin Only)
- **DELETE** `/api/users/:id`
- **Headers**: `Authorization: Bearer <admin_token>`

### Product Management Endpoints

#### Get All Products
- **GET** `/api/products`
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10, max: 100)
  - `search`: Search term for name/description
  - `category`: Filter by category
  - `minPrice`: Minimum price filter
  - `maxPrice`: Maximum price filter
  - `sort`: Sort field (name, price, createdAt, rating.average)
  - `order`: Sort order (asc, desc)

#### Get Product by ID
- **GET** `/api/products/:id`
- **Response**: Single product with creator information

#### Create Product
- **POST** `/api/products`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "name": "Product Name",
    "description": "Product description",
    "price": 29.99,
    "category": "Electronics",
    "stock": 100,
    "images": ["https://example.com/image1.jpg"],
    "brand": "Brand Name",
    "tags": ["tag1", "tag2"]
  }
  ```

#### Update Product
- **PUT** `/api/products/:id`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: Same as create product (all fields optional)
- **Note**: Only product owner or admin can update

#### Delete Product
- **DELETE** `/api/products/:id`
- **Headers**: `Authorization: Bearer <token>`
- **Note**: Only product owner or admin can delete

#### Get Products by Category
- **GET** `/api/products/category/:category`
- **Query Parameters**: `page`, `limit`

#### Get Product Categories
- **GET** `/api/products/categories`
- **Response**: Array of available categories

#### Update Product Stock
- **PATCH** `/api/products/:id/stock`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "stock": 50
  }
  ```

## Authentication

### JWT Token Usage
Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Token Expiration
Tokens expire after 7 days. Frontend should handle token refresh or re-authentication.

## Error Handling

### Standard Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // Optional validation errors array
}
```

### Common HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid/missing token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

## Data Models

### User Model
```javascript
{
  username: String,
  email: String,
  password: String, // Hashed
  role: String, // 'user' or 'admin'
  profile: {
    firstName: String,
    lastName: String,
    avatar: String
  },
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  category: String,
  stock: Number,
  images: [String],
  brand: String,
  rating: {
    average: Number,
    count: Number
  },
  tags: [String],
  isActive: Boolean,
  createdBy: ObjectId, // Reference to User
  createdAt: Date,
  updatedAt: Date
}
```

## Testing the API

### Using curl
```bash
# Register a new user
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"Test123"}'

# Login
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123"}'

# Get products
curl http://localhost:5000/api/products
```

### Using Postman
1. Import the API endpoints
2. Set up environment variables for base URL and auth token
3. Test all endpoints with various scenarios

## Security Considerations

1. **Environment Variables**: Never commit `.env` file to version control
2. **JWT Secret**: Use a strong, random secret in production
3. **Password Security**: Passwords are hashed using bcryptjs
4. **Input Validation**: All inputs are validated using express-validator
5. **CORS**: Configured to allow frontend requests
6. **Rate Limiting**: Consider adding rate limiting for production

## Deployment

### Environment Setup
1. Set up MongoDB database (local or cloud)
2. Configure environment variables
3. Install dependencies: `npm install`
4. Start the server: `npm run server`

### Production Considerations
- Use process managers like PM2
- Set up proper logging
- Configure reverse proxy (nginx)
- Set up SSL certificates
- Enable rate limiting
- Monitor server health

## Development

### Running in Development
```bash
# Install dependencies
npm install

# Start development server (with auto-reload)
npm run dev:server

# Start frontend (in separate terminal)
npm run dev
```

### Available Scripts
- `npm run server`: Start production server
- `npm run dev:server`: Start development server with nodemon
- `npm run dev`: Start frontend development server
- `npm run build`: Build frontend for production

## Health Check
- **GET** `/api/health`
- **Response**: Server status and timestamp

## Support
For issues or questions, please check the API documentation or contact the development team.