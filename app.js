const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const middleware = require('./utils/middleware')
const healthRouter = require('./controllers/health')
const mapRouter = require('./controllers/dependencyMap')

const app = express()

/**
 * Middlewares
 * */
const corsOptions = {
  origin:[
    /localhost/,
  ]
}
app.use(cors(corsOptions))
app.use(express.json())
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
app.use('/api/generate-map', mapRouter)
app.use(middleware.unknownEndpoint)

module.exports = app
