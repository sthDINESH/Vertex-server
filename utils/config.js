require('dotenv').config()

const PORT = process.env.PORT || 3001

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

module.exports = {
  PORT,
  GEMINI_API_KEY,
}