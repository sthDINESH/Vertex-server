const { dependencyPrompt } = require('./prompt')
const { askGoogleGemini } = require('./googleGeminiService')

/**
 * Calls AI service to generate dependency maps
 * Returns: dependency map as json
 */
const generateDependencyMap = async ({ concept, level, subject }) => {
  const response = await askGoogleGemini(dependencyPrompt({ concept, level, subject }))
  return JSON.parse(response)
}

module.exports = {
  generateDependencyMap
}