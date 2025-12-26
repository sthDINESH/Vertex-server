const { ValidationError } = require('./errors')

const dependencyPrompt = ({ concept, level, subject }) => {
  if(!concept){
    throw new ValidationError('concept input required to generate concept map.')
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
module.exports = {
  dependencyPrompt,
}