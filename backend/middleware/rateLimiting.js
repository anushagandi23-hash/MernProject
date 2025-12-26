/**
 * Rate Limiting Middleware
 * Prevents abuse by limiting number of requests per time period
 */

/**
 * Simple In-Memory Rate Limiter
 * Note: For production, use redis-based rate limiting
 */
class RateLimiter {
  constructor() {
    this.requests = {}; // Store: { key: [timestamps] }
  }

  /**
   * Check if request is allowed
   * @param {string} key - Rate limit key (IP, user ID, etc.)
   * @param {number} maxRequests - Max requests allowed
   * @param {number} windowMs - Time window in milliseconds
   * @returns {object} { allowed: boolean, remaining: number, resetTime: Date }
   */
  check(key, maxRequests, windowMs) {
    const now = Date.now();
    const windowStart = now - windowMs;

    // Initialize or get existing requests
    if (!this.requests[key]) {
      this.requests[key] = [];
    }

    // Remove old requests outside window
    this.requests[key] = this.requests[key].filter(time => time > windowStart);

    // Check if allowed
    const allowed = this.requests[key].length < maxRequests;

    if (allowed) {
      // Add current request
      this.requests[key].push(now);
    }

    return {
      allowed,
      current: this.requests[key].length,
      remaining: Math.max(0, maxRequests - this.requests[key].length),
      resetTime: new Date(windowStart + windowMs)
    };
  }

  /**
   * Clear all rate limit data
   */
  clear() {
    this.requests = {};
  }
}

// Create global rate limiter instance
const limiter = new RateLimiter();

/**
 * General Rate Limiter Middleware
 * Limits all requests by IP address
 * Default: 100 requests per 15 minutes
 */
const generalRateLimiter = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  return (req, res, next) => {
    const key = `ip:${req.ip}`;
    const result = limiter.check(key, maxRequests, windowMs);

    // Add rate limit headers
    res.set('X-RateLimit-Limit', maxRequests);
    res.set('X-RateLimit-Remaining', result.remaining);
    res.set('X-RateLimit-Reset', Math.ceil(result.resetTime.getTime() / 1000));

    if (!result.allowed) {
      return res.status(429).json({
        success: false,
        statusCode: 429,
        message: 'Too many requests. Please try again later.',
        error: {
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
          resetTime: result.resetTime.toISOString()
        },
        timestamp: new Date().toISOString()
      });
    }

    next();
  };
};

/**
 * Authentication Rate Limiter
 * Limits login/signup attempts by IP
 * Default: 5 failed attempts per 15 minutes
 */
const authRateLimiter = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  return (req, res, next) => {
    const key = `auth:${req.ip}:${req.body?.email || 'unknown'}`;
    const result = limiter.check(key, maxAttempts, windowMs);

    res.set('X-RateLimit-Limit', maxAttempts);
    res.set('X-RateLimit-Remaining', result.remaining);
    res.set('X-RateLimit-Reset', Math.ceil(result.resetTime.getTime() / 1000));

    if (!result.allowed) {
      return res.status(429).json({
        success: false,
        statusCode: 429,
        message: 'Too many login attempts. Please try again later.',
        error: {
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
          resetTime: result.resetTime.toISOString()
        },
        timestamp: new Date().toISOString()
      });
    }

    next();
  };
};

/**
 * Booking Rate Limiter
 * Limits booking attempts per user
 * Default: 10 bookings per minute (prevent spam)
 */
const bookingRateLimiter = (maxBookings = 10, windowMs = 60 * 1000) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(); // Skip if not authenticated
    }

    const key = `booking:${req.user.userId}`;
    const result = limiter.check(key, maxBookings, windowMs);

    res.set('X-RateLimit-Limit', maxBookings);
    res.set('X-RateLimit-Remaining', result.remaining);
    res.set('X-RateLimit-Reset', Math.ceil(result.resetTime.getTime() / 1000));

    if (!result.allowed) {
      return res.status(429).json({
        success: false,
        statusCode: 429,
        message: 'Booking limit exceeded. Please try again later.',
        error: {
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
          resetTime: result.resetTime.toISOString()
        },
        timestamp: new Date().toISOString()
      });
    }

    next();
  };
};

/**
 * API Endpoint Rate Limiter
 * Generic rate limiter for specific endpoints
 * @param {number} maxRequests - Max requests allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {function} Middleware function
 */
const createRateLimiter = (maxRequests = 10, windowMs = 60 * 1000) => {
  return (req, res, next) => {
    // Use user ID if authenticated, otherwise use IP
    const key = req.user ? `user:${req.user.userId}` : `ip:${req.ip}`;
    const result = limiter.check(key, maxRequests, windowMs);

    res.set('X-RateLimit-Limit', maxRequests);
    res.set('X-RateLimit-Remaining', result.remaining);
    res.set('X-RateLimit-Reset', Math.ceil(result.resetTime.getTime() / 1000));

    if (!result.allowed) {
      return res.status(429).json({
        success: false,
        statusCode: 429,
        message: 'Rate limit exceeded. Please try again later.',
        error: {
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
          resetTime: result.resetTime.toISOString()
        },
        timestamp: new Date().toISOString()
      });
    }

    next();
  };
};

/**
 * Cleanup Old Rate Limit Data
 * Run periodically (e.g., every hour) to clean up old entries
 */
const cleanupRateLimitData = () => {
  const now = Date.now();
  for (const key in limiter.requests) {
    // If no requests in last 24 hours, remove the key
    const hasRecentRequests = limiter.requests[key].some(time => now - time < 24 * 60 * 60 * 1000);
    if (!hasRecentRequests) {
      delete limiter.requests[key];
    }
  }
};

// Run cleanup every hour
if (process.env.NODE_ENV === 'production') {
  setInterval(cleanupRateLimitData, 60 * 60 * 1000);
}

module.exports = {
  generalRateLimiter,
  authRateLimiter,
  bookingRateLimiter,
  createRateLimiter,
  cleanupRateLimitData,
  RateLimiter
};
