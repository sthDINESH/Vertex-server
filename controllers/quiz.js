const { generateQuiz } = require('../services/aiService')
const { retryWithBackoff } = require('../utils/helpers')

const router = require('express').Router()

router.post('/', async (req, res, next) => {
  try {
    const quiz = await retryWithBackoff(() => generateQuiz(req.body),
      2, // max retries
      1000, // initial delay 1s
    )
    res.json(quiz)
  } catch(error){
    next(error)
  }
})

module.exports = router