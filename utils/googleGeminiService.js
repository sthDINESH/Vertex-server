const { GoogleGenAI } = require('@google/genai')
const config = require('./config')
const { ApiError, ValidationError } = require('./errors')

const googleGeminiClient = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY })

/**
 * Sanitize response.text from Gemini to stringified JSON
 * @param {*} responseText : response.text from Gemini
 * @returns : sanitized stringified JSON
 */
const sanitizeResponseText = (responseText) => {
  return (
    responseText
      .replace(/^```json\n?/,'')
      .replace(/\n?```$/, '')
  )
}

/**
  * Use Gemini Generative AI
  * @param {*} contents: prompt for Gemini
  * @returns : sanitized response.text
  */
const askGoogleGemini = async (contents) => {
  try {
    const response = await googleGeminiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
    })

    if (!response?.text){
      throw new SyntaxError('No text content in API response')
    }

    return sanitizeResponseText(response.text)
  }
  catch(error){
    if (error.name === 'SyntaxError') {throw error}
    throw new ApiError(error.message)
  }
}

module.exports = {
  askGoogleGemini,
  googleGeminiClient,
}