const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const colors = require('colors');
require('express-async-errors');
require('dotenv').config();

// Database connection
const connectDB = require('./config/database');

// Middleware
const { globalErrorHandler, handleNotFound } = require('./middleware/errorHandler');

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const swapRoutes = require('./routes/swaps');
const ratingRoutes = require('./routes/ratings');
const adminRoutes = require('./routes/admin');

const app = express();

// Connect to database
connectDB();

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:8080', // Vite dev server
  ],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/swaps', swapRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/admin', adminRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Skill Swap Platform API',
    version: '1.0.0',
    documentation: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/me',
        updatePassword: 'PUT /api/auth/password',
        forgotPassword: 'POST /api/auth/forgot-password',
        refreshToken: 'POST /api/auth/refresh',
        logout: 'POST /api/auth/logout',
        deleteAccount: 'DELETE /api/auth/account'
      },
      users: {
        searchUsers: 'GET /api/users/search',
        getUserProfile: 'GET /api/users/:id',
        updateProfile: 'PUT /api/users/:id',
        updateSkills: 'PUT /api/users/:id/skills',
        getUserStats: 'GET /api/users/:id/stats'
      },
      swaps: {
        createSwap: 'POST /api/swaps',
        getUserSwaps: 'GET /api/swaps',
        getSwapById: 'GET /api/swaps/:id',
        acceptSwap: 'PUT /api/swaps/:id/accept',
        rejectSwap: 'PUT /api/swaps/:id/reject',
        cancelSwap: 'DELETE /api/swaps/:id',
        completeSwap: 'PUT /api/swaps/:id/complete'
      },
      ratings: {
        createRating: 'POST /api/ratings',
        getUserRatings: 'GET /api/ratings/user/:userId',
        getRatingsGiven: 'GET /api/ratings/given',
        getRatingsReceived: 'GET /api/ratings/received',
        flagRating: 'POST /api/ratings/:id/flag'
      },
      admin: {
        dashboard: 'GET /api/admin/dashboard',
        banUser: 'PUT /api/admin/users/:id/ban',
        unbanUser: 'PUT /api/admin/users/:id/unban',
        createMessage: 'POST /api/admin/messages',
        getSwaps: 'GET /api/admin/swaps',
        reports: 'GET /api/admin/reports/*'
      }
    }
  });
});

// Handle 404 errors
app.use(handleNotFound);

// Global error handler
app.use(globalErrorHandler);

// Start server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  );
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

// Handle SIGINT
process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = app;