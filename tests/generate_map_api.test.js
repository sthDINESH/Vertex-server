const supertest = require('supertest')
const { describe, test, beforeEach, afterEach } = require('node:test')
const assert = require('node:assert')
const sinon = require('sinon')

// Import before app to stub before any calls
const geminiService = require('../utils/googleGeminiService')
const app = require('../app')

const api = supertest(app)

describe('POST /api/generate-map', () => {
  let stub

  beforeEach(() => {
    // Clean up any leftover stubs from previous test
    if (stub) stub.restore()
  })

  afterEach(() => {
    // Clean up after current test
    if (stub) stub.restore()
  })

  describe('prompt includes', () => {
    beforeEach(() => {
      // Stub the ACTUAL API call at the lowest level
      stub = sinon.stub(geminiService.googleGeminiClient.models, 'generateContent').resolves({
        text: '```json\n{"target": "React", "prerequisites": [{"id": 1, "name": "JavaScript", "description": "Learn JS", "prerequisites": [], "level": "foundational"}]}\n```'
      })
    })

    test('provided user concept', async () => {
      await api
        .post('/api/generate-map')
        .send({ concept: 'React' })

      // Check that stub was called with the expected prompt
      assert(stub.calledOnce)

      // Get the arguments passed to the stub
      const callArgs = stub.getCall(0).args[0]

      // Verify the prompt contains the concept
      assert(callArgs.contents.includes('React'))
    })

    test('provided user level', async () => {
      await api
        .post('/api/generate-map')
        .send({ concept: 'React', level: 'undergraduate' })

      // Check that stub was called with the expected prompt
      assert(stub.calledOnce)

      // Get the arguments passed to the stub
      const callArgs = stub.getCall(0).args[0]

      // Verify the prompt contains the concept
      assert(callArgs.contents.includes('undergraduate level'))
    })

    test('provided user subject', async () => {
      await api
        .post('/api/generate-map')
        .send({ concept: 'React', subject: 'Computer Science' })

      // Check that stub was called with the expected prompt
      assert(stub.calledOnce)

      // Get the arguments passed to the stub
      const callArgs = stub.getCall(0).args[0]

      // Verify the prompt contains the concept
      assert(callArgs.contents.includes('Computer Science'))
    })
  })

  describe('with valid concept', () => {
    beforeEach(() => {
      stub = sinon.stub(geminiService.googleGeminiClient.models, 'generateContent').resolves({
        text: '```json\n{"target": "React", "prerequisites": [{"id": 1, "name": "JavaScript", "description": "Learn JS", "prerequisites": [], "level": "foundational"}]}\n```'
      })
    })

    test('should return concept map', async () => {
      const response = await api
        .post('/api/generate-map')
        .send({ concept: 'React' })
        .expect(200)
        .expect('Content-Type', /application\/json/)

      assert.strictEqual(response.body.target, 'React')
      assert.deepStrictEqual(response.body.prerequisites, [{ 'id': 1, 'name': 'JavaScript', 'description': 'Learn JS', 'prerequisites': [], 'level': 'foundational' }])
      assert(stub.calledOnce)
    })
  })

  test('should return 400 without concept input', async () => {
    const response = await api
      .post('/api/generate-map')
      .send({})
      .expect(400)

    assert.strictEqual(response.body.error, 'concept input required to generate concept map.')
  })

  test('should return 502 when no text field in API response', async () => {
    stub = sinon.stub(geminiService.googleGeminiClient.models, 'generateContent').resolves({
      other: '```json\n{"target": "React", "prerequisites": [{"id": 1, "name": "JavaScript", "description": "Learn JS", "prerequisites": [], "level": "foundational"}]}\n```'
    })

    const response = await api
      .post('/api/generate-map')
      .send({ concept: 'React' })
      .expect(502)

    assert.strictEqual(response.body.error, 'Invalid response from AI service')
  })

  test('should return 502 when response is invalid JSON', async () => {
    stub = sinon.stub(geminiService.googleGeminiClient.models, 'generateContent').resolves({
      text: 'invalid json {'
    })

    const response = await api
      .post('/api/generate-map')
      .send({ concept: 'React' })
      .expect(502)

    assert.strictEqual(response.body.error, 'Invalid response from AI service')
  })

  test('should return 503 when API fails', async () => {
    stub = sinon.stub(geminiService.googleGeminiClient.models, 'generateContent')
      .rejects(new Error('API key invalid'))

    const response = await api
      .post('/api/generate-map')
      .send({ concept: 'React' })
      .expect(503)

    assert.strictEqual(response.body.error, 'AI Service temporarily unavailable')
  })

  describe('retry logic', () => {
    test('should retry on timeout and eventually succeed', async () => {
      let callCount = 0

      stub = sinon.stub(geminiService.googleGeminiClient.models, 'generateContent')
        .callsFake(async () => {
          callCount++
          // Fail on first attempt with timeout error
          if (callCount === 1) {
            const error = new Error('Request timeout')
            error.code = 'ETIMEDOUT'
            throw error
          }
          // Success on second attempt
          return {
            text: '```json\n{"target": "React", "prerequisites": [{"id": 1, "name": "JavaScript", "description": "Learn JS", "prerequisites": [], "level": "foundational"}]}\n```'
          }
        })

      const response = await api
        .post('/api/generate-map')
        .send({ concept: 'React' })
        .expect(200)

      // Verify retry happened: called twice (1 fail + 1 success)
      assert.strictEqual(callCount, 2)
      assert.strictEqual(response.body.target, 'React')
    })

    test('should retry multiple times before success', async () => {
      let callCount = 0

      stub = sinon.stub(geminiService.googleGeminiClient.models, 'generateContent')
        .callsFake(async () => {
          callCount++
          // Fail on first two attempts
          if (callCount < 3) {
            const error = new Error('Connection refused')
            error.code = 'ECONNREFUSED'
            throw error
          }
          // Success on third attempt (after 2 retries)
          return {
            text: '```json\n{"target": "React", "prerequisites": []}\n```'
          }
        })

      const response = await api
        .post('/api/generate-map')
        .send({ concept: 'React' })
        .expect(200)

      // Verify: called 3 times (2 failures + 1 success)
      assert.strictEqual(callCount, 3)
      assert.strictEqual(response.body.target, 'React')
    })

    test('should fail after max retries exhausted', async () => {
      let callCount = 0

      stub = sinon.stub(geminiService.googleGeminiClient.models, 'generateContent')
        .callsFake(async () => {
          callCount++
          const error = new Error('API is down')
          error.code = 'ECONNREFUSED'
          throw error
        })

      const response = await api
        .post('/api/generate-map')
        .send({ concept: 'React' })
        .expect(503)

      // Verify: retried max times (initial attempt + 2 retries = 3 total)
      assert.strictEqual(callCount, 3)
      assert.strictEqual(response.body.error, 'AI Service temporarily unavailable')
    })

    test('should NOT retry on validation errors', async () => {
      let callCount = 0

      stub = sinon.stub(geminiService.googleGeminiClient.models, 'generateContent')
        .callsFake(async () => {
          callCount++
          return { text: '{}' }
        })

      const response = await api
        .post('/api/generate-map')
        .send({}) // Missing concept - triggers validation error
        .expect(400)

      // Verify: never called the stub (validation happened before API call)
      assert.strictEqual(callCount, 0)
      assert.strictEqual(response.body.error, 'concept input required to generate concept map.')
    })

    test('should NOT retry on syntax errors from API', async () => {
      let callCount = 0

      stub = sinon.stub(geminiService.googleGeminiClient.models, 'generateContent')
        .callsFake(async () => {
          callCount++
          // Return response without text field
          return { other: 'data' }
        })

      const response = await api
        .post('/api/generate-map')
        .send({ concept: 'React' })
        .expect(502)

      // Verify: called once (no retry on syntax error)
      assert.strictEqual(callCount, 1)
      assert.strictEqual(response.body.error, 'Invalid response from AI service')
    })
  })
})

