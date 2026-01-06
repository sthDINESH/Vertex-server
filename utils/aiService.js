const { dependencyPrompt } = require('./prompt')
const { askGoogleGemini } = require('./googleGeminiService')
const { BadResponseError } = require('./errors')
const { validateConceptMap, validateTreeStructure } = require('./validators')
const logger = require('./logger')

/**
 * Calls AI service to generate dependency maps
 * Returns: dependency map as json
 */
const generateDependencyMap = async ({ concept, level, subject }) => {
  const response = await askGoogleGemini(dependencyPrompt({ concept, level, subject }))

  let parsedResponse = null
  try{
    parsedResponse = JSON.parse(response)
  } catch(error){
    logger.error('[AI Service] JSON parsing failed:', error.message)
    throw new BadResponseError('Invalid JSON response from AI service')
  }

  // Validate against schema
  const validated = validateConceptMap(parsedResponse)

  // Validate tree structure integrity
  validateTreeStructure(validated)

  return validated
}

module.exports = {
  generateDependencyMap
}