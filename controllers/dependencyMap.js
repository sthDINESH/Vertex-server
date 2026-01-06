const { generateDependencyMap } = require('../utils/aiService')
const { retryWithBackoff } = require('../utils/helpers')
const router = require('express').Router()


router.post('/', async (req, res, next) => {
  try {
    const map = await retryWithBackoff(() => generateDependencyMap(req.body),
      2, //max retries
      1000, // initial delay 1s
    )
    res.json(map)
  } catch(error) {
    next(error)
  }
})

module.exports = router