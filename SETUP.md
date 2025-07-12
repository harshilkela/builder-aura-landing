# Frontend-Backend Connection Setup Guide

This guide will help you connect your React frontend with the Node.js/Express backend for the Skill Swap Platform.

## 🔧 Current Setup

### Frontend
- **Framework**: React + TypeScript + Vite
- **Port**: 8080 (configured in vite.config.ts)
- **Features**: React Router, Tailwind CSS, Radix UI, React Query
- **API Client**: Custom API client (`src/lib/api.ts`)

### Backend
- **Framework**: Node.js + Express + MongoDB
- **Port**: 5000 (configured in backend/src/server.js)
- **Features**: JWT Authentication, CORS, Rate Limiting, Comprehensive REST API

## 🚀 Quick Start

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file with your configuration:
# PORT=5000
# NODE_ENV=development
# MONGODB_URI=mongodb://localhost:27017/skill-swap-db
# JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
# JWT_EXPIRES_IN=7d
# FRONTEND_URL=http://localhost:8080

# Start MongoDB (if not already running)
# mongod

# Start the backend server
npm run dev
```

### 2. Frontend Setup

```bash
# Navigate to root directory (where package.json is)
cd ..

# Install dependencies
npm install

# Start the frontend development server
npm run dev
```

### 3. Access the Application

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:5000/api
- **API Documentation**: http://localhost:5000/api

## 📡 API Integration

### Current API Client Features

The `src/lib/api.ts` file provides a comprehensive API client with:

- **Authentication**: Login, Register, Logout, Password Updates
- **User Management**: Profile CRUD, User Search, Statistics
- **Swap Management**: Create, Accept, Reject, Complete Swaps
- **Rating System**: Create and Retrieve Ratings
- **Admin Functions**: Dashboard, User Management, Messaging

### Authentication Flow

1. User logs in → API returns JWT token
2. Token stored in localStorage as 'skillswap-token'
3. All subsequent API requests include token in Authorization header
4. AuthContext manages user state across the app

### Custom Hooks (src/hooks/useApi.ts)

Custom React Query hooks for:
- `useUsers()` - Search and fetch users
- `useSwaps()` - Manage swap requests
- `useRatings()` - Handle rating operations
- `useAdminDashboard()` - Admin functionality

## 🔄 Data Flow

```
Frontend (React) ↔ API Client (api.ts) ↔ Backend (Express) ↔ Database (MongoDB)
```

### Example API Usage

```typescript
// In a React component
import { useAuth } from '@/contexts/AuthContext';
import { useUsers } from '@/hooks/useApi';

const BrowseUsers = () => {
  const { user } = useAuth();
  const { data: users, isLoading } = useUsers({ skill: 'JavaScript' });
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      {users?.users.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
};
```

## 🛠️ Configuration Files

### Environment Variables

**Frontend (.env.local)**:
```env
VITE_API_URL=http://localhost:5000/api
```

**Backend (.env)**:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/skill-swap-db
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=http://localhost:8080
```

### Vite Proxy Configuration

The `vite.config.ts` includes a proxy configuration:

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
      secure: false,
    },
  },
}
```

This allows frontend requests to `/api/*` to be proxied to the backend.

### CORS Configuration

Backend CORS is configured to allow requests from:
- `http://localhost:3000` (original setting)
- `http://localhost:8080` (Vite dev server)

## 📋 Next Steps

### 1. Update Contexts to Use API

Replace mock data in contexts with API calls:

**AuthContext** ✅ Already updated to use API
**SkillSwapContext** - Needs updating to use custom hooks

### 2. Update Components

Update React components to use the new API hooks:

```typescript
// Replace direct context usage with custom hooks
const { data: swaps } = useSwaps({ status: 'pending' });
const createSwap = useCreateSwap();
```

### 3. Error Handling

Add proper error handling throughout the app:

```typescript
const { data, isLoading, error } = useUsers(filters);

if (error) {
  return <div>Error: {error.message}</div>;
}
```

### 4. Loading States

Add loading indicators for better UX:

```typescript
if (isLoading) {
  return <LoadingSpinner />;
}
```

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend allows requests from `http://localhost:8080`
2. **MongoDB Connection**: Check if MongoDB is running locally
3. **Port Conflicts**: Ensure ports 5000 and 8080 are available
4. **JWT Errors**: Check JWT_SECRET is set in backend .env

### Development Commands

```bash
# Start both frontend and backend concurrently
npm run dev        # Frontend (from root)
npm run dev        # Backend (from backend/)

# Or create a script to start both:
# package.json scripts section:
"dev:all": "concurrently \"npm run dev\" \"cd backend && npm run dev\""
```

## 📚 API Endpoints Reference

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users/search` - Search users by skills
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile

### Swaps
- `POST /api/swaps` - Create swap request
- `GET /api/swaps` - Get user's swaps
- `PUT /api/swaps/:id/accept` - Accept swap
- `PUT /api/swaps/:id/reject` - Reject swap

### Ratings
- `POST /api/ratings` - Create rating
- `GET /api/ratings/user/:userId` - Get user ratings

### Admin
- `GET /api/admin/dashboard` - Admin dashboard
- `PUT /api/admin/users/:id/ban` - Ban user

For complete API documentation, visit: http://localhost:5000/api

## 🎯 Implementation Priority

1. ✅ **API Client** - Created comprehensive API client
2. ✅ **Environment Setup** - Configured CORS and proxy
3. ✅ **AuthContext Update** - Connected to real authentication
4. 🔄 **Custom Hooks** - Created React Query hooks (needs TypeScript fix)
5. ⏳ **Update Components** - Replace mock data usage
6. ⏳ **Error Handling** - Add comprehensive error handling
7. ⏳ **Loading States** - Improve UX with loading indicators

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Check the backend logs for API errors
3. Verify all environment variables are set correctly
4. Ensure MongoDB is running and accessible