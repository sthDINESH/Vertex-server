const { conceptMapSchema, questionBankSchema } = require('./schemas')
const { BadResponseError } = require('./errors')
const logger = require('./logger')

/**
 * Creates a formatted BadResponseError from Zod validation errors
 * @param {Object} zodError - Zod validation error object containing issues array
 * @param {string} errorMsg - Base error message to prepend to validation details
 * @returns {BadResponseError} A BadResponseError with formatted message and validation details
 */
const createValidationError = (zodError, errorMsg) => {
  const messages = zodError.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`)
  const error = new BadResponseError(`${errorMsg}: ${messages.join('; ')}`)
  error.details = zodError.issues

  return error
}

/**
 * Validate concept map structure
 * @param {Object} data - Data to validate
 * @returns {Object} Validated data
 * @throws {BadResponseError} If validation fails
 */
const validateConceptMap = (data) => {
  try {
    const validated = conceptMapSchema.parse(data)
    return validated
  } catch (error) {
    logger.error('[Validation] Concept map validation failed:', error.issues)

    // Create detailed error message from Zod issues
    const validationError = createValidationError(error, 'Invalid concept map')
    throw validationError
  }
}

/**
 * Validate prerequisite IDs form valid dependency tree
 * @param {Object} conceptMap - Validated concept map
 * @throws {BadResponseError} If tree structure is invalid
 */
const validateTreeStructure = (conceptMap) => {
  const { prerequisites } = conceptMap
  const validIds = new Set(prerequisites.map(p => p.id))

  for (const prereq of prerequisites) {
    for (const depId of prereq.prerequisites) {
      if (!validIds.has(depId)) {
        throw new BadResponseError(`Invalid dependency: prerequisite ${depId} referenced but not found`)
      }
    }
  }
  return true
}

/**
 * Validates question bank structure against schema
 * @param {Object} questionBank - Question bank object to validate
 * @returns {Object} Validated question bank object
 * @throws {BadResponseError} If validation fails with detailed error messages
 */
const validateQuestionBank = (questionBank) => {
  try {
    const validated = questionBankSchema.parse(questionBank)
    return validated
  } catch(error) {
    logger.error('[Validation] Question bank validation failed:', error.issues)

    // Create detailed error message from Zod issues
    const validationError = createValidationError(error, 'Invalid question bank')
    throw validationError
  }
}

module.exports = {
  validateConceptMap,
  validateTreeStructure,
  validateQuestionBank,
}