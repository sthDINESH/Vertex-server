const { dependencyPrompt, quizPrompt } = require('../utils/prompt')
const { askGoogleGemini } = require('./googleGeminiService')
const { BadResponseError } = require('../utils/errors')
const { validateConceptMap, validateTreeStructure } = require('../utils/validators')
const logger = require('../utils/logger')

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

/**
 * Calls AI service to generate quiz questions
 * @param {string} name - The concept to create quiz questions for
 * @param {string} description - Description of the concept
 * @param {string} level - Education level (foundational, intermediate, advanced)
 * @param {number} numQuestions - Number of questions to generate
 * @returns {Promise<Object>} Parsed quiz questions object with structure { questions: [...] }
 * @throws {BadResponseError} If JSON parsing fails or response is invalid
 */
const generateQuiz = async({ name, description, level, numQuestions }) => {
  const response = await askGoogleGemini(quizPrompt({ name, description, level, numQuestions }))

  let parsedResponse = null
  try{
    parsedResponse = JSON.parse(response)
  } catch(error){
    logger.error('[AI Service] JSON parsing failed:', error.message)
    throw new BadResponseError('Invalid JSON response from AI service')
  }

  // TODO: validate response against schema

  return parsedResponse
}

module.exports = {
  generateDependencyMap,
  generateQuiz,
}