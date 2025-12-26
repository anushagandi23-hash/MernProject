/**
 * Response Handler - Standardizes all API responses
 * Ensures consistency across all endpoints
 */

/**
 * Success Response Format
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Response message
 * @param {object|array|null} data - Response data
 * @param {object|null} errors - Error details (if any)
 * @returns {object} Formatted response
 */
const sendSuccess = (statusCode = 200, message = 'Success', data = null, errors = null) => {
  return {
    success: true,
    statusCode,
    message,
    data,
    errors,
    timestamp: new Date().toISOString()
  };
};

/**
 * Error Response Format
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {object|null} errors - Detailed error information
 * @returns {object} Formatted error response
 */
const sendError = (statusCode = 500, message = 'Internal Server Error', errors = null) => {
  return {
    success: false,
    statusCode,
    message,
    data: null,
    errors,
    timestamp: new Date().toISOString()
  };
};

/**
 * Validation Error Response
 * @param {array} validationErrors - Array of validation errors
 * @returns {object} Formatted validation error response
 */
const sendValidationError = (validationErrors = []) => {
  const errors = {};
  validationErrors.forEach(error => {
    errors[error.field] = error.message;
  });

  return {
    success: false,
    statusCode: 400,
    message: 'Validation error',
    data: null,
    errors,
    timestamp: new Date().toISOString()
  };
};

/**
 * Pagination Response
 * @param {array} data - Array of items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items
 * @param {string} message - Response message
 * @returns {object} Paginated response
 */
const sendPaginated = (data = [], page = 1, limit = 10, total = 0, message = 'Success') => {
  const totalPages = Math.ceil(total / limit);

  return {
    success: true,
    statusCode: 200,
    message,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    },
    timestamp: new Date().toISOString()
  };
};

module.exports = {
  sendSuccess,
  sendError,
  sendValidationError,
  sendPaginated
};
