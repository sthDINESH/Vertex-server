require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')

/**
 * Middlewares
 * */
app.use(express.json())

// Morgan
morgan.token('body', (req) => JSON.stringify(req.body))
app.use(morgan(':date :method :url :status :res[content-length] - :response-time ms :body'))

app.get('/', (req, res) => {
  res.send('<h1>Hello from server</h1>')
})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Starting Express server on ${PORT}...`)
})