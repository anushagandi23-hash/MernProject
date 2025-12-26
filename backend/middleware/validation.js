/**
 * Input Validation Middleware
 * Validates and sanitizes request data
 */

const validators = require('../utils/validators');
const { ValidationError } = require('../utils/errors');
const { asyncHandler } = require('./errorHandler');

/**
 * Validate Signup Request
 */
const validateSignupRequest = asyncHandler(async (req, res, next) => {
  try {
    const validatedData = validators.validateSignup(req.body);
    req.validatedBody = validatedData;
    next();
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: error.message,
        data: null,
        errors: error.errors,
        timestamp: new Date().toISOString()
      });
    }
    next(error);
  }
});

/**
 * Validate Login Request
 */
const validateLoginRequest = asyncHandler(async (req, res, next) => {
  try {
    const validatedData = validators.validateLogin(req.body);
    req.validatedBody = validatedData;
    next();
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: error.message,
        data: null,
        errors: error.errors,
        timestamp: new Date().toISOString()
      });
    }
    next(error);
  }
});

/**
 * Validate Bus Creation Request
 */
const validateBusCreationRequest = asyncHandler(async (req, res, next) => {
  try {
    const validatedData = validators.validateBusCreation(req.body);
    req.validatedBody = validatedData;
    next();
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: error.message,
        data: null,
        errors: error.errors,
        timestamp: new Date().toISOString()
      });
    }
    next(error);
  }
});

/**
 * Validate Trip Creation Request
 */
const validateTripCreationRequest = asyncHandler(async (req, res, next) => {
  try {
    const validatedData = validators.validateTripCreation(req.body);
    req.validatedBody = validatedData;
    next();
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: error.message,
        data: null,
        errors: error.errors,
        timestamp: new Date().toISOString()
      });
    }
    next(error);
  }
});

/**
 * Validate Booking Request
 */
const validateBookingRequest = asyncHandler(async (req, res, next) => {
  try {
    const validatedData = validators.validateBooking(req.body);
    req.validatedBody = validatedData;
    next();
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: error.message,
        data: null,
        errors: error.errors,
        timestamp: new Date().toISOString()
      });
    }
    next(error);
  }
});

/**
 * Generic Validation Middleware Factory
 * @param {function} validatorFn - Validator function from validators.js
 * @returns {function} Express middleware
 */
const createValidationMiddleware = (validatorFn) => {
  return asyncHandler(async (req, res, next) => {
    try {
      const validatedData = validatorFn(req.body);
      req.validatedBody = validatedData;
      next();
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: error.message,
          data: null,
          errors: error.errors,
          timestamp: new Date().toISOString()
        });
      }
      next(error);
    }
  });
};

/**
 * Validate Request Headers
 * Ensures required headers are present and valid
 */
const validateHeaders = (requiredHeaders = []) => {
  return (req, res, next) => {
    const missingHeaders = requiredHeaders.filter(
      header => !req.get(header)
    );

    if (missingHeaders.length > 0) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Missing required headers',
        data: null,
        errors: { headers: `Required headers: ${missingHeaders.join(', ')}` },
        timestamp: new Date().toISOString()
      });
    }

    next();
  };
};

/**
 * Validate Content-Type
 * Ensures request content-type matches expected type
 */
const validateContentType = (expectedType = 'application/json') => {
  return (req, res, next) => {
    const contentType = req.get('content-type');

    if (!contentType || !contentType.includes(expectedType)) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: `Content-Type must be ${expectedType}`,
        data: null,
        errors: { contentType: `Expected ${expectedType}, got ${contentType}` },
        timestamp: new Date().toISOString()
      });
    }

    next();
  };
};

/**
 * Validate Query Parameters
 * @param {object} schema - Query parameter validation schema
 * @returns {function} Express middleware
 */
const validateQueryParams = (schema = {}) => {
  return (req, res, next) => {
    const errors = {};

    for (const [key, rule] of Object.entries(schema)) {
      const value = req.query[key];

      // Check if required
      if (rule.required && !value) {
        errors[key] = `${key} is required`;
        continue;
      }

      // Validate type
      if (value && rule.type) {
        if (rule.type === 'integer' && isNaN(parseInt(value))) {
          errors[key] = `${key} must be an integer`;
        } else if (rule.type === 'string' && typeof value !== 'string') {
          errors[key] = `${key} must be a string`;
        }
      }

      // Validate enum values
      if (value && rule.enum && !rule.enum.includes(value)) {
        errors[key] = `${key} must be one of: ${rule.enum.join(', ')}`;
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Query parameter validation failed',
        data: null,
        errors,
        timestamp: new Date().toISOString()
      });
    }

    next();
  };
};

/**
 * Sanitize Request Body
 * Removes malicious content from request body
 */
const sanitizeRequestBody = (req, res, next) => {
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      return validators.sanitizeString(obj);
    } else if (typeof obj === 'object' && obj !== null) {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        // Don't sanitize password field
        if (key === 'password') {
          sanitized[key] = value;
        } else if (typeof value === 'string') {
          sanitized[key] = validators.sanitizeString(value);
        } else if (typeof value === 'object') {
          sanitized[key] = sanitize(value);
        } else {
          sanitized[key] = value;
        }
      }
      return sanitized;
    }
    return obj;
  };

  if (req.body && typeof req.body === 'object') {
    req.body = sanitize(req.body);
  }

  next();
};

module.exports = {
  validateSignupRequest,
  validateLoginRequest,
  validateBusCreationRequest,
  validateTripCreationRequest,
  validateBookingRequest,
  createValidationMiddleware,
  validateHeaders,
  validateContentType,
  validateQueryParams,
  sanitizeRequestBody
};
