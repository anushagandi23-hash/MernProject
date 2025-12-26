/**
 * Application Constants
 */

/**
 * Database Models
 */
const DB_MODELS = {
  USER: 'User',
  BUS: 'Bus',
  TRIP: 'Trip',
  BOOKING: 'Booking',
  SEAT: 'Seat'
};

/**
 * Booking Status
 */
const BOOKING_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED'
};

/**
 * Seat Status
 */
const SEAT_STATUS = {
  AVAILABLE: 'AVAILABLE',
  BOOKED: 'BOOKED',
  RESERVED: 'RESERVED'
};

/**
 * Trip Status
 */
const TRIP_STATUS = {
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

/**
 * Bus Types
 */
const BUS_TYPES = {
  AC: 'AC',
  NON_AC: 'NON_AC',
  SLEEPER: 'SLEEPER',
  SEATER: 'SEATER'
};

/**
 * User Roles
 */
const USER_ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN'
};

/**
 * HTTP Status Codes
 */
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,

  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,

  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503
};

/**
 * Error Messages
 */
const ERROR_MESSAGES = {
  // Authentication
  INVALID_CREDENTIALS: 'Invalid email or password',
  TOKEN_EXPIRED: 'Token has expired',
  TOKEN_INVALID: 'Invalid token',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Forbidden',

  // Validation
  INVALID_EMAIL: 'Please provide a valid email address',
  INVALID_PASSWORD: 'Password must be at least 6 characters',
  INVALID_INPUT: 'Invalid input provided',
  MISSING_FIELDS: 'Required fields are missing',

  // Resources
  NOT_FOUND: 'Resource not found',
  ALREADY_EXISTS: 'Resource already exists',

  // Business Logic
  INSUFFICIENT_SEATS: 'Insufficient seats available',
  SEATS_ALREADY_BOOKED: 'Some seats are already booked',
  INVALID_SEAT_NUMBERS: 'Invalid seat numbers provided',
  BOOKING_EXPIRED: 'Booking has expired',
  BOOKING_CANCELLED: 'Booking has been cancelled',

  // Database
  DB_ERROR: 'Database operation failed',
  TRANSACTION_FAILED: 'Transaction failed',

  // Rate Limiting
  TOO_MANY_REQUESTS: 'Too many requests, please try again later',

  // Server
  INTERNAL_ERROR: 'Internal server error',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable'
};

/**
 * Success Messages
 */
const SUCCESS_MESSAGES = {
  SIGNUP_SUCCESS: 'User registered successfully',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logged out successfully',
  PASSWORD_RESET: 'Password reset successfully',

  BUS_CREATED: 'Bus created successfully',
  BUS_UPDATED: 'Bus updated successfully',
  BUS_DELETED: 'Bus deleted successfully',

  TRIP_CREATED: 'Trip created successfully',
  TRIP_UPDATED: 'Trip updated successfully',
  TRIP_DELETED: 'Trip deleted successfully',
  TRIP_CANCELLED: 'Trip cancelled successfully',

  BOOKING_CREATED: 'Booking created successfully',
  BOOKING_CONFIRMED: 'Booking confirmed successfully',
  BOOKING_CANCELLED: 'Booking cancelled successfully',
  BOOKING_MODIFIED: 'Booking modified successfully',

  SEATS_BOOKED: 'Seats booked successfully',
  SEATS_RELEASED: 'Seats released successfully'
};

/**
 * Timeout Values (in milliseconds)
 */
const TIMEOUT = {
  BOOKING_EXPIRY: 2 * 60 * 1000, // 2 minutes
  BOOKING_EXPIRY_CHECK: 60 * 1000, // Check every 1 minute
  REQUEST_TIMEOUT: 30 * 1000, // 30 seconds
  DB_POOL_TIMEOUT: 30 * 1000 // 30 seconds
};

/**
 * Limits
 */
const LIMITS = {
  MIN_SEATS: 1,
  MAX_SEATS: 10, // Max seats per booking
  MAX_TOTAL_SEATS: 200, // Max seats in a bus
  MIN_PASSWORD_LENGTH: 6,
  MAX_PASSWORD_LENGTH: 128,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 50,
  MIN_LOCATION_LENGTH: 2,
  MAX_LOCATION_LENGTH: 50,
  MAX_BUS_NUMBER_LENGTH: 20
};

/**
 * Regex Patterns
 */
const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^.{6,}$/,
  PHONE: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
  URL: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  DATE: /^\d{4}-\d{2}-\d{2}/
};

/**
 * Pagination
 */
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
};

/**
 * API Response Codes
 */
const API_CODES = {
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL_ERROR: 'INTERNAL_ERROR'
};

/**
 * Cache Keys
 */
const CACHE_KEYS = {
  BUSES: 'buses',
  TRIPS: 'trips',
  TRIP: (tripId) => `trip:${tripId}`,
  BUS: (busId) => `bus:${busId}`,
  SEATS: (busId) => `seats:${busId}`,
  USER: (userId) => `user:${userId}`,
  BOOKING: (bookingId) => `booking:${bookingId}`
};

/**
 * Email Templates
 */
const EMAIL_TEMPLATES = {
  BOOKING_CONFIRMATION: 'booking_confirmation',
  BOOKING_REMINDER: 'booking_reminder',
  BOOKING_CANCELLED: 'booking_cancelled',
  PASSWORD_RESET: 'password_reset',
  WELCOME: 'welcome'
};

module.exports = {
  DB_MODELS,
  BOOKING_STATUS,
  SEAT_STATUS,
  TRIP_STATUS,
  BUS_TYPES,
  USER_ROLES,
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  TIMEOUT,
  LIMITS,
  REGEX,
  PAGINATION,
  API_CODES,
  CACHE_KEYS,
  EMAIL_TEMPLATES
};
