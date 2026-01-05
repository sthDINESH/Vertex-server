const logger = require('./logger')
const rateLimit = require('express-rate-limit')

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, req, res, next) => {
  logger.error('Error:', error.message)

  // API errors
  if (error.name === 'ApiError') {
    return res.status(503).json({ error: 'AI Service temporarily unavailable' })
  }

  // Syntax errors
  if (error.name === 'SyntaxError') {
    return res.status(502).json({ error: 'Invalid response from AI service' })
  }

  // Validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }

  // Rate limiting errors
  if (error.status === 429) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' })
  }

  next(error)
}

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  handler: (req, res) => {
    res.status(429).json({ error: 'Too many requests from this IP, please try again later.' })
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Stricter limiter for AI service (expensive API calls)
const aiServiceLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // limit each IP to 20 requests per hour
  handler: (req, res) => {
    res.status(429).json({ error: 'Too many concept map requests, please try again later.' })
  },
  standardHeaders: true,
  legacyHeaders: false,
})

module.exports = {
  unknownEndpoint,
  errorHandler,
  apiLimiter,
  aiServiceLimiter,
}