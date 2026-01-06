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

module.exports = {
  conceptMapSchema,
  prerequisiteSchema
}