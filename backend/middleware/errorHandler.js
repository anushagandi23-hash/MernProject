/**
 * Error Handler Middleware
 * Centralized error handling for all routes
 */

const { sendError } = require('../utils/responseHandler');
const { AppError, ValidationError } = require('../utils/errors');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../utils/constants');

/**
 * Global Error Handler Middleware
 * Must be registered LAST in middleware chain
 * @param {Error} err - The error object
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  // Log error
  console.error('❌ Error:', {
    name: err.name,
    message: err.message,
    statusCode: err.statusCode,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  // Handle custom application errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(
      sendError(err.statusCode, err.message, err.errors)
    );
  }

  // Handle Sequelize Validation Errors
  if (err.name === 'SequelizeValidationError') {
    const errors = {};
    err.errors.forEach(e => {
      errors[e.path] = e.message;
    });
    return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json(
      sendError(
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
        'Validation error',
        errors
      )
    );
  }

  // Handle Sequelize Unique Constraint Errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    const errors = {};
    err.errors.forEach(e => {
      errors[e.path] = `${e.path} already exists`;
    });
    return res.status(HTTP_STATUS.CONFLICT).json(
      sendError(
        HTTP_STATUS.CONFLICT,
        'Resource already exists',
        errors
      )
    );
  }

  // Handle Sequelize Foreign Key Errors
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(HTTP_STATUS.CONFLICT).json(
      sendError(
        HTTP_STATUS.CONFLICT,
        'Invalid reference to related resource',
        { error: err.message }
      )
    );
  }

  // Handle JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json(
      sendError(
        HTTP_STATUS.UNAUTHORIZED,
        'Invalid token',
        { error: 'Token validation failed' }
      )
    );
  }

  // Handle JWT Expiry
  if (err.name === 'TokenExpiredError') {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json(
      sendError(
        HTTP_STATUS.UNAUTHORIZED,
        'Token has expired',
        { error: 'Please login again' }
      )
    );
  }

  // Handle Syntax Errors (e.g., invalid JSON)
  if (err instanceof SyntaxError) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json(
      sendError(
        HTTP_STATUS.BAD_REQUEST,
        'Invalid request format',
        { error: err.message }
      )
    );
  }

  // Handle unknown errors
  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
    sendError(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.INTERNAL_ERROR,
      process.env.NODE_ENV === 'development'
        ? { error: err.message, stack: err.stack }
        : { error: 'An unexpected error occurred' }
    )
  );
};

/**
 * Async Handler Wrapper
 * Wraps async route handlers to catch errors and pass to error handler
 * @param {function} fn - Async function
 * @returns {function} Express middleware
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Not Found Handler
 * Handles 404 errors for undefined routes
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
const notFoundHandler = (req, res) => {
  res.status(HTTP_STATUS.NOT_FOUND).json(
    sendError(
      HTTP_STATUS.NOT_FOUND,
      `Route ${req.method} ${req.path} not found`,
      { path: req.path, method: req.method }
    )
  );
};

module.exports = {
  errorHandler,
  asyncHandler,
  notFoundHandler
};
