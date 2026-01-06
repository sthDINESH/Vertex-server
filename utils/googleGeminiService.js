const { GoogleGenAI } = require('@google/genai')
const config = require('./config')
const { ApiError, BadResponseError } = require('./errors')

const googleGeminiClient = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY })

/**
 * Sanitize response.text from Gemini to stringified JSON
 * @param {*} responseText : response.text from Gemini
 * @returns : sanitized stringified JSON
 */
const sanitizeResponse = (response) => {
  if (!response.text){
    throw new BadResponseError('No text content in API response')
  }

  return response.text
    .replace(/^```json\n?/,'')
    .replace(/\n?```$/, '')
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
    return sanitizeResponse(response)
  }
  catch(error){
    if (error instanceof BadResponseError) {
      throw error
    }
    // Wrap other errors as ApiError
    const apiError = new ApiError(error.message)
    apiError.code = error?.code
    throw apiError
  }
}

module.exports = {
  askGoogleGemini,
  googleGeminiClient,
}