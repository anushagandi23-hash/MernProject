/**
 * Validation Schemas - Input validation for all endpoints
 * Using simple regex and custom validators (Joi can be integrated later)
 */

const { ValidationError } = require('./errors');

/**
 * Validation Rules
 */
const rules = {
  // Email validation
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

  // Strong password (min 8 chars, 1 uppercase, 1 number, 1 special char)
  strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,

  // Basic password (min 6 chars)
  basicPassword: /^.{6,}$/,

  // Phone number (basic format)
  phone: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,

  // URL
  url: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,

  // Alphanumeric
  alphanumeric: /^[a-zA-Z0-9]+$/,

  // Date (YYYY-MM-DD or ISO)
  date: /^\d{4}-\d{2}-\d{2}/
};

/**
 * Validate Email
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
const isValidEmail = (email) => {
  return typeof email === 'string' && rules.email.test(email.toLowerCase());
};

/**
 * Validate Password Strength
 * @param {string} password - Password to validate
 * @param {boolean} strict - Use strong password rules (default: false)
 * @returns {boolean} True if valid
 */
const isValidPassword = (password, strict = false) => {
  if (typeof password !== 'string') return false;
  const rule = strict ? rules.strongPassword : rules.basicPassword;
  return rule.test(password);
};

/**
 * Validate Phone Number
 * @param {string} phone - Phone to validate
 * @returns {boolean} True if valid
 */
const isValidPhone = (phone) => {
  return typeof phone === 'string' && rules.phone.test(phone);
};

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid
 */
const isValidUrl = (url) => {
  return typeof url === 'string' && rules.url.test(url);
};

/**
 * Validate Date
 * @param {string|Date} date - Date to validate
 * @returns {boolean} True if valid
 */
const isValidDate = (date) => {
  const d = new Date(date);
  return d instanceof Date && !isNaN(d);
};

/**
 * Validate Integer
 * @param {*} value - Value to validate
 * @param {number} min - Minimum value (optional)
 * @param {number} max - Maximum value (optional)
 * @returns {boolean} True if valid
 */
const isValidInteger = (value, min = null, max = null) => {
  if (!Number.isInteger(value)) return false;
  if (min !== null && value < min) return false;
  if (max !== null && value > max) return false;
  return true;
};

/**
 * Validate Decimal
 * @param {*} value - Value to validate
 * @param {number} min - Minimum value (optional)
 * @param {number} max - Maximum value (optional)
 * @returns {boolean} True if valid
 */
const isValidDecimal = (value, min = null, max = null) => {
  const num = parseFloat(value);
  if (isNaN(num)) return false;
  if (min !== null && num < min) return false;
  if (max !== null && num > max) return false;
  return true;
};

/**
 * Validate String
 * @param {*} value - Value to validate
 * @param {number} minLength - Minimum length (optional)
 * @param {number} maxLength - Maximum length (optional)
 * @returns {boolean} True if valid
 */
const isValidString = (value, minLength = null, maxLength = null) => {
  if (typeof value !== 'string') return false;
  if (minLength !== null && value.length < minLength) return false;
  if (maxLength !== null && value.length > maxLength) return false;
  return true;
};

/**
 * Validate Array
 * @param {*} value - Value to validate
 * @param {number} minItems - Minimum items (optional)
 * @param {number} maxItems - Maximum items (optional)
 * @returns {boolean} True if valid
 */
const isValidArray = (value, minItems = null, maxItems = null) => {
  if (!Array.isArray(value)) return false;
  if (minItems !== null && value.length < minItems) return false;
  if (maxItems !== null && value.length > maxItems) return false;
  return true;
};

/**
 * Validate Enum
 * @param {*} value - Value to validate
 * @param {array} allowedValues - Allowed values
 * @returns {boolean} True if valid
 */
const isValidEnum = (value, allowedValues = []) => {
  return allowedValues.includes(value);
};

/**
 * Sanitize String (Remove HTML tags, trim whitespace)
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  // Remove HTML tags
  str = str.replace(/<[^>]*>/g, '');
  // Trim whitespace
  str = str.trim();
  // Escape special characters
  str = str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
  return str;
};

/**
 * Sanitize Email
 * @param {string} email - Email to sanitize
 * @returns {string} Sanitized email
 */
const sanitizeEmail = (email) => {
  if (typeof email !== 'string') return '';
  return email.toLowerCase().trim();
};

/**
 * Sanitize Number
 * @param {*} num - Number to sanitize
 * @returns {number} Sanitized number
 */
const sanitizeNumber = (num) => {
  const parsed = parseFloat(num);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Validate Signup Input
 * @param {object} data - Input data
 * @throws {ValidationError} If validation fails
 * @returns {object} Validated data
 */
const validateSignup = (data) => {
  const errors = {};

  // Name validation
  if (!data.name || !isValidString(data.name, 2, 50)) {
    errors.name = 'Name must be between 2 and 50 characters';
  }

  // Email validation
  if (!data.email || !isValidEmail(data.email)) {
    errors.email = 'Please provide a valid email address';
  }

  // Password validation
  if (!data.password || !isValidPassword(data.password)) {
    errors.password = 'Password must be at least 6 characters';
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Signup validation failed', errors);
  }

  return {
    name: sanitizeString(data.name),
    email: sanitizeEmail(data.email),
    password: data.password // Password not sanitized - keep as is
  };
};

/**
 * Validate Login Input
 * @param {object} data - Input data
 * @throws {ValidationError} If validation fails
 * @returns {object} Validated data
 */
const validateLogin = (data) => {
  const errors = {};

  // Email validation
  if (!data.email || !isValidEmail(data.email)) {
    errors.email = 'Please provide a valid email address';
  }

  // Password validation
  if (!data.password || typeof data.password !== 'string') {
    errors.password = 'Password is required';
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Login validation failed', errors);
  }

  return {
    email: sanitizeEmail(data.email),
    password: data.password
  };
};

/**
 * Validate Bus Creation
 * @param {object} data - Input data
 * @throws {ValidationError} If validation fails
 * @returns {object} Validated data
 */
const validateBusCreation = (data) => {
  const errors = {};

  // Bus Number validation
  if (!data.busNumber || !isValidString(data.busNumber, 2, 20)) {
    errors.busNumber = 'Bus number must be between 2 and 20 characters';
  }

  // From validation
  if (!data.from || !isValidString(data.from, 2, 50)) {
    errors.from = 'From location must be between 2 and 50 characters';
  }

  // To validation
  if (!data.to || !isValidString(data.to, 2, 50)) {
    errors.to = 'To location must be between 2 and 50 characters';
  }

  // Departure time validation
  if (!data.departureTime || !isValidDate(data.departureTime)) {
    errors.departureTime = 'Valid departure time is required';
  }

  // Arrival time validation
  if (!data.arrivalTime || !isValidDate(data.arrivalTime)) {
    errors.arrivalTime = 'Valid arrival time is required';
  }

  // Price validation
  if (!isValidDecimal(data.price, 0, 10000)) {
    errors.price = 'Price must be between 0 and 10000';
  }

  // Total seats validation
  const seats = sanitizeNumber(data.totalSeats) || 40;
  if (!isValidInteger(seats, 1, 200)) {
    errors.totalSeats = 'Total seats must be between 1 and 200';
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Bus creation validation failed', errors);
  }

  return {
    busNumber: sanitizeString(data.busNumber),
    from: sanitizeString(data.from),
    to: sanitizeString(data.to),
    departureTime: new Date(data.departureTime),
    arrivalTime: new Date(data.arrivalTime),
    price: sanitizeNumber(data.price),
    totalSeats: seats
  };
};

/**
 * Validate Trip Creation
 * @param {object} data - Input data
 * @throws {ValidationError} If validation fails
 * @returns {object} Validated data
 */
const validateTripCreation = (data) => {
  const errors = {};

  // Bus ID validation
  if (!isValidInteger(data.busId, 1)) {
    errors.busId = 'Valid bus ID is required';
  }

  // Bus Name validation
  if (!data.busName || !isValidString(data.busName, 2, 50)) {
    errors.busName = 'Bus name must be between 2 and 50 characters';
  }

  // From validation
  if (!data.from || !isValidString(data.from, 2, 50)) {
    errors.from = 'From location must be between 2 and 50 characters';
  }

  // To validation
  if (!data.to || !isValidString(data.to, 2, 50)) {
    errors.to = 'To location must be between 2 and 50 characters';
  }

  // Start time validation
  if (!data.startTime || !isValidDate(data.startTime)) {
    errors.startTime = 'Valid start time is required';
  }

  // End time validation (optional but if provided, must be valid)
  if (data.endTime && !isValidDate(data.endTime)) {
    errors.endTime = 'Valid end time is required if provided';
  }

  // Total seats validation
  const seats = sanitizeNumber(data.totalSeats) || 40;
  if (!isValidInteger(seats, 1, 200)) {
    errors.totalSeats = 'Total seats must be between 1 and 200';
  }

  // Price validation
  if (!isValidDecimal(data.pricePerSeat, 0, 10000)) {
    errors.pricePerSeat = 'Price per seat must be between 0 and 10000';
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Trip creation validation failed', errors);
  }

  return {
    busId: sanitizeNumber(data.busId),
    busName: sanitizeString(data.busName),
    from: sanitizeString(data.from),
    to: sanitizeString(data.to),
    startTime: new Date(data.startTime),
    endTime: data.endTime ? new Date(data.endTime) : null,
    totalSeats: seats,
    pricePerSeat: sanitizeNumber(data.pricePerSeat),
    availableSeats: seats
  };
};

/**
 * Validate Booking Creation
 * @param {object} data - Input data
 * @throws {ValidationError} If validation fails
 * @returns {object} Validated data
 */
const validateBooking = (data) => {
  const errors = {};

  // Seats validation
  if (!isValidArray(data.seats, 1, 10)) {
    errors.seats = 'Select 1 to 10 seats';
  }

  // Verify all items in seats array are valid integers
  if (Array.isArray(data.seats)) {
    const invalidSeats = data.seats.filter(s => !isValidInteger(s, 1));
    if (invalidSeats.length > 0) {
      errors.seats = 'Seat numbers must be positive integers';
    }

    // Check for duplicates
    if (new Set(data.seats).size !== data.seats.length) {
      errors.seats = 'Duplicate seat numbers are not allowed';
    }
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Booking validation failed', errors);
  }

  return {
    seats: data.seats.sort((a, b) => a - b)
  };
};

module.exports = {
  // Validation functions
  isValidEmail,
  isValidPassword,
  isValidPhone,
  isValidUrl,
  isValidDate,
  isValidInteger,
  isValidDecimal,
  isValidString,
  isValidArray,
  isValidEnum,

  // Sanitization functions
  sanitizeString,
  sanitizeEmail,
  sanitizeNumber,

  // Schema validators
  validateSignup,
  validateLogin,
  validateBusCreation,
  validateTripCreation,
  validateBooking,

  // Validation rules
  rules
};
