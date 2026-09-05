const rateLimit = require('express-rate-limit');

// Rate limiter for authentication endpoints (login, register)
// Max 10 requests per 15-minute window per IP
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: 429,
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes'
  }
});

// General rate limiter for protected API endpoints
// Max 100 requests per 15-minute window per IP
const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Too many API requests from this IP, please try again later'
  }
});

module.exports = {
  authRateLimiter,
  apiRateLimiter
};
