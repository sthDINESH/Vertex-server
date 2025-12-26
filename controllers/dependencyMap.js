const { generateDependencyMap } = require('../utils/aiService')
const router = require('express').Router()


router.post('/', async (req, res, next) => {
  const map = await generateDependencyMap(req.body)
  res.json(map)
})

module.exports = router