const { GoogleGenAI } = require('@google/genai')
const logger = require('./logger')
const config = require('./config')

const googleGemini = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY })

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
    logger.info('[Gemini Service] Fetching dependency map')
    const response = await googleGemini.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
    })
    const cleanResponse = sanitizeResponseText(response.text)
    logger.info('[Gemini Service] Return Dependency Map')
    return cleanResponse
  } catch (error){
    logger.error('[Gemini Service] Error fetching dependency map:', error)
    if(error) throw error
  }
}

module.exports = {
  askGoogleGemini,
}