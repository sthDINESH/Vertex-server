const { z } = require('zod')

/**
 * Schema for a single prerequisite in the concept map
 */
const prerequisiteSchema = z.object({
  id: z.number().int().positive('id must be a positive integer'),
  name: z.string().min(1, 'name is required'),
  description: z.string().min(1, 'description is required'),
  prerequisites: z.array(z.number()).default([]),
  level: z.enum(['foundational', 'intermediate', 'advanced'], {
    errorMap: () => ({ message: 'level must be foundational, intermediate, or advanced' })
  })
})

/**
 * Schema for the complete concept map response
 */
const conceptMapSchema = z.object({
  target: z.string().min(1, 'target is required'),
  prerequisites: z.array(prerequisiteSchema).min(1, 'prerequisites must have at least one item')
})

/**
 * Schema for a single question object in question bank
 */
const questionSchema = z.object({
  question: z.string().min(1, 'question is required'),
  options: z.array(z.string().min(1,'option is required')).length(4,'four options required'),
  correct: z.number().int().min(0,'min must be starting array index').max(3,'max must be end array index')
})

/**
 * Schema for array of questions
 */
const questionBankSchema = z.object({
  questions: z.array(questionSchema).min(1,'question bank must have at least one question')
})

module.exports = {
  conceptMapSchema,
  prerequisiteSchema,
  questionBankSchema,
}