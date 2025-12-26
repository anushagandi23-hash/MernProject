/**
 * Logging Middleware
 * Logs incoming requests and outgoing responses
 */

const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Generate Unique Request ID
 * @returns {string} Unique request ID
 */
const generateRequestId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Request Logging Middleware
 * Logs all incoming requests with details
 */
const requestLogger = (req, res, next) => {
  // Generate unique request ID for tracing
  const requestId = generateRequestId();
  req.id = requestId;

  // Store original send method
  const originalSend = res.send;

  // Capture response data
  let responseData = '';
  res.send = function (data) {
    responseData = data;
    res.send = originalSend; // Restore original
    return res.send(data);
  };

  // Log request details
  const logEntry = {
    timestamp: new Date().toISOString(),
    requestId,
    method: req.method,
    url: req.url,
    path: req.path,
    query: req.query,
    body: req.body && Object.keys(req.body).length > 0 ? { ...req.body, password: '[REDACTED]' } : null,
    headers: {
      contentType: req.get('content-type'),
      userAgent: req.get('user-agent'),
      ip: req.ip
    },
    user: req.user ? { userId: req.user.userId, email: req.user.email } : null
  };

  // Log to console in development
  if (process.env.NODE_ENV !== 'production') {
    console.log(`📥 [${logEntry.requestId}] ${logEntry.method} ${logEntry.url}`);
  }

  // Log response
  res.on('finish', () => {
    const logEntryWithResponse = {
      ...logEntry,
      statusCode: res.statusCode,
      responseTime: `${Date.now() - parseInt(requestId.split('-')[0])}ms`,
      responseSize: res.get('content-length') || 'unknown'
    };

    // Log to file
    const logFileName = `requests-${new Date().toISOString().split('T')[0]}.log`;
    const logFilePath = path.join(logsDir, logFileName);

    fs.appendFile(
      logFilePath,
      JSON.stringify(logEntryWithResponse) + '\n',
      (err) => {
        if (err) {
          console.error('Failed to write log:', err);
        }
      }
    );

    // Console log in development
    if (process.env.NODE_ENV !== 'production') {
      const statusColor = res.statusCode >= 400 ? '❌' : '✅';
      console.log(
        `${statusColor} [${logEntryWithResponse.requestId}] ${logEntryWithResponse.method} ${logEntryWithResponse.url} - ${res.statusCode} (${logEntryWithResponse.responseTime})`
      );
    }
  });

  next();
};

/**
 * Error Logging
 * @param {Error} error - Error object
 * @param {string} requestId - Request ID for tracing
 */
const logError = (error, requestId = 'unknown') => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    requestId,
    name: error.name,
    message: error.message,
    statusCode: error.statusCode || 500,
    stack: error.stack,
    type: error.constructor.name
  };

  // Log to console
  console.error('❌ Error logged:', errorLog);

  // Log to file
  const logFileName = `errors-${new Date().toISOString().split('T')[0]}.log`;
  const logFilePath = path.join(logsDir, logFileName);

  fs.appendFile(
    logFilePath,
    JSON.stringify(errorLog) + '\n',
    (err) => {
      if (err) {
        console.error('Failed to write error log:', err);
      }
    }
  );
};

/**
 * Info Logging
 * @param {string} message - Log message
 * @param {object} data - Additional data
 */
const logInfo = (message, data = {}) => {
  const infoLog = {
    timestamp: new Date().toISOString(),
    level: 'INFO',
    message,
    data
  };

  // Log to console
  if (process.env.NODE_ENV !== 'production') {
    console.log('ℹ️ ' + message, data);
  }

  // Log to file
  const logFileName = `app-${new Date().toISOString().split('T')[0]}.log`;
  const logFilePath = path.join(logsDir, logFileName);

  fs.appendFile(
    logFilePath,
    JSON.stringify(infoLog) + '\n',
    (err) => {
      if (err) {
        console.error('Failed to write info log:', err);
      }
    }
  );
};

/**
 * Warning Logging
 * @param {string} message - Log message
 * @param {object} data - Additional data
 */
const logWarning = (message, data = {}) => {
  const warningLog = {
    timestamp: new Date().toISOString(),
    level: 'WARNING',
    message,
    data
  };

  // Log to console
  console.warn('⚠️ ' + message, data);

  // Log to file
  const logFileName = `warnings-${new Date().toISOString().split('T')[0]}.log`;
  const logFilePath = path.join(logsDir, logFileName);

  fs.appendFile(
    logFilePath,
    JSON.stringify(warningLog) + '\n',
    (err) => {
      if (err) {
        console.error('Failed to write warning log:', err);
      }
    }
  );
};

/**
 * Database Query Logging
 * @param {string} query - SQL query
 * @param {object} params - Query parameters
 * @param {number} duration - Query duration in ms
 */
const logQuery = (query, params = {}, duration = 0) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`📊 [${duration}ms] ${query}`, params);
  }

  const queryLog = {
    timestamp: new Date().toISOString(),
    query,
    params,
    duration: `${duration}ms`
  };

  const logFileName = `queries-${new Date().toISOString().split('T')[0]}.log`;
  const logFilePath = path.join(logsDir, logFileName);

  fs.appendFile(
    logFilePath,
    JSON.stringify(queryLog) + '\n',
    (err) => {
      if (err) {
        console.error('Failed to write query log:', err);
      }
    }
  );
};

module.exports = {
  requestLogger,
  logError,
  logInfo,
  logWarning,
  logQuery,
  generateRequestId
};
