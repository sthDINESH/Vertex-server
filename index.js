const config = require('./utils/config')
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const healthRouter = require('./controllers/health')

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

// Routes
app.use('/api/health', healthRouter)

// Morgan
morgan.token('body', (req) => JSON.stringify(req.body))
app.use(morgan(':date :method :url :status :res[content-length] - :response-time ms :body'))

app.get('/', (req, res) => {
  res.send('<h1>Hello from server</h1>')
})

const PORT = config.PORT
app.listen(PORT, () => {
  console.log(`Starting Express server on ${PORT}...`)
})