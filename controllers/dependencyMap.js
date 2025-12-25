const { generateDependencyMap } = require('../utils/aiService')
const router = require('express').Router()


router.post('/', async (req, res, next) => {
  try{
    const map = await generateDependencyMap(req.body)
    res.json(map)
  }
  catch(error) {
    next(error)
  }
})

module.exports = router