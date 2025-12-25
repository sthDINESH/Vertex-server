const healthRouter = require('express').Router()

healthRouter.get('/', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()  // Returns seconds the server has been running
  })
})

module.exports = healthRouter