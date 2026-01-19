const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const middleware = require('./utils/middleware')
const healthRouter = require('./controllers/health')
const mapRouter = require('./controllers/dependencyMap')

const app = express()

/**
 * Security & Proxy Configuration
 */
app.set('trust proxy', 1) //single reverse proxy

/**
 * Middlewares
 * */
const corsOptions = {
  origin: [
    /localhost/,
    /https:\/\/vertex[a-zA-Z0-9-]*\.vercel\.app/,
  ]
}
app.use(cors(corsOptions))
app.use(express.json())

// Apply general rate limiter for all routes
app.use(middleware.apiLimiter)
// Morgan
morgan.token('body', (req) => JSON.stringify(req.body))
// Log incoming request immediately
app.use(
  process.env.NODE_ENV === 'test'
    ? (req, res, next) => next()
    : morgan(':date [INCOMING] :method :url :body', { immediate: true })
)
// Log response after it's sent
app.use(
  process.env.NODE_ENV === 'test'
    ? (req, res, next) => next()
    : morgan(':date [RESPONSE] :method :url :body :status :res[content-length] - :response-time ms')
)

/**
 * Routes
 */
app.use('/api/health', healthRouter)
app.use('/api/generate-map', middleware.aiServiceLimiter, mapRouter) // Stricter limit for AI Service
app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
