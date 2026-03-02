const { BadRequestError } = require('./errors')

/**
 * Generates a prompt for creating a prerequisite knowledge dependency tree
 * @param {Object} param0 - Prompt generation parameters
 * @param {string} param0.concept - The concept to generate a prerequisite tree for (required)
 * @param {string} [param0.level] - Education level (foundational, intermediate, advanced)
 * @param {string} [param0.subject] - Subject area for context
 * @returns {string} Formatted prompt string for Gemini API
 * @throws {BadRequestError} If concept is not provided
 */
const dependencyPrompt = ({ concept, level, subject }) => {
  if(!concept){
    throw new BadRequestError('concept input required to generate concept map.')
  }

  return (
    `Generate a prerequisite knowledge tree for understanding "${concept}"${level ? ` at ${level} level` : ''}${subject ? ` in ${subject}` : ''}.
    Return ONLY valid JSON (no markdown, no preamble) with this exact structure:
    {
    "target": "concept name",
    "prerequisites": [
        {
        "id": 1,
        "name": "concept name",
        "description": "brief description",
        "prerequisites": [array of prerequisite IDs],
        "level": "foundational|intermediate|advanced"
        }
    ]
    }
    Include 5-8 prerequisite concepts arranged in a logical dependency hierarchy. The target concept should be the last item with the highest ID.`
  )
}

/**
 * Generates a prompt for creating multiple choice quiz questions
 * @param {Object} param0 - Prompt generation parameters
 * @param {string} param0.name - The concept to create quiz questions for (required)
 * @param {string} param0.description - Description of the concept (required)
 * @param {string} param0.level - Education level (foundational, intermediate, advanced) (required)
 * @param {number} param0.numQuestions - Number of questions to generate (required)
 * @returns {string} Formatted prompt string for Gemini API
 * @throws {BadRequestError} If any required parameter is missing
 */
const quizPrompt = ({ name, description, level, numQuestions }) => {
  if(!(name && description && level && numQuestions)){
    throw new BadRequestError('missing params required to generate fetch quiz.')
  }

  return (
    `Generate ${numQuestions} multiple choice questions to test understanding of "${name}": ${description}
    Return ONLY valid JSON (no markdown, no preamble) with this exact structure:
    {
      "questions": [
        {
          "question": "question text",
          "options": ["option1", "option2", "option3", "option4"],
          "correct": 0
        }
      ]
    }
    Where "correct" is the index (0-3) of the correct answer. Make questions appropriate for ${level} level.`
  )
}

module.exports = {
  dependencyPrompt,
  quizPrompt,
}