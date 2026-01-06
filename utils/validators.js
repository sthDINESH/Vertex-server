const { conceptMapSchema } = require('./schemas')
const { BadResponseError } = require('./errors')
const logger = require('./logger')

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
    const messages = error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`)
    const validationError = new BadResponseError(`Invalid concept map: ${messages.join('; ')}`)
    validationError.details = error.issues

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

module.exports = {
  validateConceptMap,
  validateTreeStructure
}