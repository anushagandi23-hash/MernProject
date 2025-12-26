/**
 * Authentication Middleware
 * Validates JWT tokens and extracts user information
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AuthenticationError, AuthorizationError } = require('../utils/errors');
const { asyncHandler } = require('./errorHandler');

/**
 * Verify JWT Token Middleware
 * Extracts and validates JWT token from Authorization header
 * Attaches user info to req.user
 */
const authMiddleware = asyncHandler(async (req, res, next) => {
  // const token = req.header('Authorization');

  // Check if token exists
  // if (!token) {
  //   throw new AuthenticationError('Access denied. No token provided.');
  // }
const authHeader = req.header('Authorization');
console.log("***AUTH HEADER RECEIVED:***", authHeader);
if (!authHeader || !authHeader.startsWith('Bearer ')) {
  throw new AuthenticationError('Access denied. No token provided.');
}

const token = authHeader.split(' ')[1]; 
  try {
    // Verify token
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    console.log("*DECODED TOKEN:", verified);
req.user = verified;
next();
    // const verified = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AuthenticationError('Token has expired. Please login again.');
    }
    throw new AuthenticationError('Invalid or malformed token');
  }
});

/**
 * Admin Authorization Middleware
 * Verifies that authenticated user has admin privileges
 * Must be used AFTER authMiddleware
 */
const adminAuthMiddleware = asyncHandler(async (req, res, next) => {
  // First ensure user is authenticated
  if (!req.user || !req.user.userId) {
    throw new AuthenticationError('User not authenticated');
  }

  try {
    // Fetch user from database to check role
    const user = await User.findByPk(req.user.userId);

    if (!user) {
      throw new AuthenticationError('User not found');
    }

    // Check admin status (for now, using simple check - in production use role-based approach)
    // Admin if: user ID is 1 OR email contains 'admin'
    const isAdmin = user.id === 1 || (user.email && user.email.includes('admin'));

    if (!isAdmin) {
      throw new AuthorizationError('Admin access required');
    }

    // Attach admin flag to user object
    req.user.isAdmin = true;
    next();
  } catch (error) {
    if (error instanceof AuthorizationError || error instanceof AuthenticationError) {
      throw error;
    }
    throw new AuthenticationError('Failed to verify admin status');
  }
});

/**
 * Optional Authentication Middleware
 * Attempts to extract user info but doesn't fail if token is missing
 * Useful for endpoints that work with or without auth
 */
const optionalAuthMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // No token, continue without authentication
    return next();
  }

   try {
    const token = authHeader.split(' ')[1];
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    console.log("*OPTIONAL DECODED TOKEN:", verified);
    req.user = verified;
  } catch (error) {
    console.warn('Invalid optional token');
  }

  next();
};

/**
 * Ownership Check Middleware
 * Verifies that user owns the resource they're trying to access
 * Usage: app.get('/bookings/:id', authMiddleware, ownershipCheck('booking'), handler)
 * @param {string} resourceType - Type of resource (booking, trip, user, etc.)
 * @returns {function} Middleware function
 */
const ownershipCheck = (resourceType) => {
  return asyncHandler(async (req, res, next) => {
    const userId = req.user.userId;
    const resourceId = req.params.id;

    // Fetch resource based on type
    let resource;
    switch (resourceType) {
      case 'booking':
        const { Booking } = require('../models/Booking');
        resource = await Booking.findByPk(resourceId);
        if (!resource || resource.userId !== userId) {
          throw new AuthorizationError('Not authorized to access this resource');
        }
        break;

      case 'trip':
        const Trip = require('../models/Trip');
        resource = await Trip.findByPk(resourceId);
        if (!resource || resource.createdBy !== userId) {
          throw new AuthorizationError('Not authorized to access this resource');
        }
        break;

      case 'user':
        if (parseInt(resourceId) !== userId) {
          throw new AuthorizationError('Not authorized to access this resource');
        }
        break;

      default:
        throw new Error('Invalid resource type for ownership check');
    }

    req.resource = resource;
    next();
  });
};

/**
 * Rate Limit Check Middleware
 * Verifies user hasn't exceeded rate limits
 * Implemented separately in rateLimitingMiddleware.js
 */

module.exports = {
  authMiddleware,
  adminAuthMiddleware,
  optionalAuthMiddleware,
  ownershipCheck
};
