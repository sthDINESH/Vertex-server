const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const healthRouter = require('./controllers/health')
const middleware = require('./utils/middleware')

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
app.use(
  process.env.NODE_ENV==='test'
    ? (req, res, next) => next()
    : morgan(':date :method :url :status :res[content-length] - :response-time ms :body')
)

/**
 * Routes
 */
app.use('/api/health', healthRouter)
app.use(middleware.unknownEndpoint)

module.exports = app
