const { describe, test, afterEach } = require('node:test')
const assert = require('node:assert')
const sinon = require('sinon')
const supertest = require('supertest')
const app = require('../app')
const geminiService = require('../services/googleGeminiService')

const api = supertest(app)

describe('Schema Validation', () => {
  let stub

  afterEach(() => {
    if (stub) stub.restore()
  })

  test('should accept valid concept map response', async () => {
    const validResponse = {
      text: '```json\n{"target": "React", "prerequisites": [{"id": 1, "name": "JavaScript", "description": "Learn JS", "prerequisites": [], "level": "foundational"}]}\n```'
    }

    stub = sinon.stub(geminiService.googleGeminiClient.models, 'generateContent')
      .resolves(validResponse)

    const response = await api
      .post('/api/generate-map')
      .send({ concept: 'React' })
      .expect(200)

    assert.strictEqual(response.body.target, 'React')
    assert(Array.isArray(response.body.prerequisites))
  })

  test('should reject response missing target field', async () => {
    const invalidResponse = {
      text: '```json\n{"prerequisites": [{"id": 1, "name": "JavaScript", "description": "Learn JS", "prerequisites": [], "level": "foundational"}]}\n```'
    }

    stub = sinon.stub(geminiService.googleGeminiClient.models, 'generateContent')
      .resolves(invalidResponse)

    const response = await api
      .post('/api/generate-map')
      .send({ concept: 'React' })
      .expect(502)

    assert(response.body.error.includes('Invalid response'))
  })

  test('should reject invalid prerequisite level', async () => {
    const invalidResponse = {
      text: '```json\n{"target": "React", "prerequisites": [{"id": 1, "name": "JavaScript", "description": "Learn JS", "prerequisites": [], "level": "invalid"}]}\n```'
    }

    stub = sinon.stub(geminiService.googleGeminiClient.models, 'generateContent')
      .resolves(invalidResponse)

    const response = await api
      .post('/api/generate-map')
      .send({ concept: 'React' })
      .expect(502)

    assert(response.body.error.includes('Invalid response'))
  })

  test('should reject broken dependency tree (missing prerequisite)', async () => {
    const invalidResponse = {
      text: '```json\n{"target": "React", "prerequisites": [{"id": 1, "name": "JavaScript", "description": "Learn JS", "prerequisites": [999], "level": "foundational"}]}\n```'
    }

    stub = sinon.stub(geminiService.googleGeminiClient.models, 'generateContent')
      .resolves(invalidResponse)

    const response = await api
      .post('/api/generate-map')
      .send({ concept: 'React' })
      .expect(502)

    assert(response.body.error.includes('Invalid response'))
  })

  test('should reject response with missing id field', async () => {
    const invalidResponse = {
      text: '```json\n{"target": "React", "prerequisites": [{"name": "JavaScript", "description": "Learn JS", "prerequisites": [], "level": "foundational"}]}\n```'
    }

    stub = sinon.stub(geminiService.googleGeminiClient.models, 'generateContent')
      .resolves(invalidResponse)

    const response = await api
      .post('/api/generate-map')
      .send({ concept: 'React' })
      .expect(502)

    assert(response.body.error.includes('Invalid response'))
  })
})