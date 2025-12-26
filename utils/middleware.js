const logger = require('./logger')
const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, req, res, next) => {
  logger.error('Error:', error)

  // API errors
  // Network/timeout errors
  // Rate limiting
  if (error.name === 'ApiError'){
    return res.status(503).json({ error: 'AI Service temporarily unavailable' })
  }

  // Syntax errors
  if (error.name === 'SyntaxError') {
    return res.status(502).json({ error: 'Invalid response from AI service' })
  }

  // if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
  //   return res.status(503).json({ error: 'Service temporarily unavailable' })
  // }

  // // Rate limiting
  // if (error.status === 429) {
  //   return res.status(429).json({ error: 'Too many requests. Please try again later' })
  // }

  // Custom validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }

  next(error)
}

module.exports = {
  unknownEndpoint,
  errorHandler
}