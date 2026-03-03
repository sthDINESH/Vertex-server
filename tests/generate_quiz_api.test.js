const supertest = require('supertest')
const { describe, test, beforeEach, afterEach } = require('node:test')
const assert = require('node:assert')
const sinon = require('sinon')

// Import before app to stub before any calls
const geminiService = require('../services/googleGeminiService')
const app = require('../app')

const api = supertest(app)

describe('POST /api/generate-quiz', () => {
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
        text: '```json\n{"questions": [{"question": "What is React?", "options": ["A library", "A framework", "A language", "A tool"], "correct": 0}]}\n```'
      })
    })

    test('provided concept name', async () => {
      await api
        .post('/api/generate-quiz')
        .send({ name: 'React Basics', description: 'Learn React', level: 'foundational', numQuestions: 5 })

      // Check that stub was called with the expected prompt
      assert(stub.calledOnce)

      // Get the arguments passed to the stub
      const callArgs = stub.getCall(0).args[0]

      // Verify the prompt contains the name
      assert(callArgs.contents.includes('React Basics'))
    })

    test('provided user description', async () => {
      await api
        .post('/api/generate-quiz')
        .send({ name: 'React', description: 'Understanding components and hooks', level: 'intermediate', numQuestions: 5 })

      // Check that stub was called with the expected prompt
      assert(stub.calledOnce)

      // Get the arguments passed to the stub
      const callArgs = stub.getCall(0).args[0]

      // Verify the prompt contains the description
      assert(callArgs.contents.includes('Understanding components and hooks'))
    })

    test('provided user level', async () => {
      await api
        .post('/api/generate-quiz')
        .send({ name: 'React', description: 'Learn React', level: 'advanced', numQuestions: 5 })

      // Check that stub was called with the expected prompt
      assert(stub.calledOnce)

      // Get the arguments passed to the stub
      const callArgs = stub.getCall(0).args[0]

      // Verify the prompt contains the level
      assert(callArgs.contents.includes('advanced'))
    })

    test('provided user numQuestions', async () => {
      await api
        .post('/api/generate-quiz')
        .send({ name: 'React', description: 'Learn React', level: 'foundational', numQuestions: 10 })

      // Check that stub was called with the expected prompt
      assert(stub.calledOnce)

      // Get the arguments passed to the stub
      const callArgs = stub.getCall(0).args[0]

      // Verify the prompt contains the number of questions
      assert(callArgs.contents.includes('10'))
    })
  })

  describe('with valid parameters', () => {
    beforeEach(() => {
      stub = sinon.stub(geminiService.googleGeminiClient.models, 'generateContent').resolves({
        text: '```json\n{"questions": [{"question": "What is React?", "options": ["A library", "A framework", "A language", "A tool"], "correct": 0}]}\n```'
      })
    })

    test('should return quiz questions', async () => {
      const response = await api
        .post('/api/generate-quiz')
        .send({ name: 'React Basics', description: 'Understanding React components', level: 'foundational', numQuestions: 5 })
        .expect(200)
        .expect('Content-Type', /application\/json/)

      assert(Array.isArray(response.body.questions))
      assert.strictEqual(response.body.questions.length, 1)
      assert.strictEqual(response.body.questions[0].question, 'What is React?')
      assert.strictEqual(response.body.questions[0].correct, 0)
      assert(stub.calledOnce)
    })
  })

  describe('missing required parameters', () => {
    test('should return 400 without name', async () => {
      const response = await api
        .post('/api/generate-quiz')
        .send({ description: 'Learn React', level: 'foundational', numQuestions: 5 })
        .expect(400)

      assert.strictEqual(response.body.error, 'missing params required to generate quiz.')
    })

    test('should return 400 without description', async () => {
      const response = await api
        .post('/api/generate-quiz')
        .send({ name: 'React', level: 'foundational', numQuestions: 5 })
        .expect(400)

      assert.strictEqual(response.body.error, 'missing params required to generate quiz.')
    })

    test('should return 400 without level', async () => {
      const response = await api
        .post('/api/generate-quiz')
        .send({ name: 'React', description: 'Learn React', numQuestions: 5 })
        .expect(400)

      assert.strictEqual(response.body.error, 'missing params required to generate quiz.')
    })

    test('should return 400 without numQuestions', async () => {
      const response = await api
        .post('/api/generate-quiz')
        .send({ name: 'React', description: 'Learn React', level: 'foundational' })
        .expect(400)

      assert.strictEqual(response.body.error, 'missing params required to generate quiz.')
    })

    test('should return 400 with empty request body', async () => {
      const response = await api
        .post('/api/generate-quiz')
        .send({})
        .expect(400)

      assert.strictEqual(response.body.error, 'missing params required to generate quiz.')
    })
  })

  describe('API response validation errors', () => {
    test('should return 502 when no text field in API response', async () => {
      stub = sinon.stub(geminiService.googleGeminiClient.models, 'generateContent').resolves({
        other: '```json\n{"questions": [{"question": "What is React?", "options": ["A", "B", "C", "D"], "correct": 0}]}\n```'
      })

      const response = await api
        .post('/api/generate-quiz')
        .send({ name: 'React', description: 'Learn React', level: 'foundational', numQuestions: 5 })
        .expect(502)

      assert.strictEqual(response.body.error, 'Invalid response from AI service')
    })

    test('should return 502 when response is invalid JSON', async () => {
      stub = sinon.stub(geminiService.googleGeminiClient.models, 'generateContent').resolves({
        text: 'invalid json {'
      })

      const response = await api
        .post('/api/generate-quiz')
        .send({ name: 'React', description: 'Learn React', level: 'foundational', numQuestions: 5 })
        .expect(502)

      assert.strictEqual(response.body.error, 'Invalid response from AI service')
    })

    test('should return 502 when questions field is missing', async () => {
      stub = sinon.stub(geminiService.googleGeminiClient.models, 'generateContent').resolves({
        text: '```json\n{"other": [{"question": "What is React?"}]}\n```'
      })

      const response = await api
        .post('/api/generate-quiz')
        .send({ name: 'React', description: 'Learn React', level: 'foundational', numQuestions: 5 })
        .expect(502)

      assert.strictEqual(response.body.error, 'Invalid response from AI service')
    })

    test('should return 502 when question text is missing', async () => {
      stub = sinon.stub(geminiService.googleGeminiClient.models, 'generateContent').resolves({
        text: '```json\n{"questions": [{"options": ["A", "B", "C", "D"], "correct": 0}]}\n```'
      })

      const response = await api
        .post('/api/generate-quiz')
        .send({ name: 'React', description: 'Learn React', level: 'foundational', numQuestions: 5 })
        .expect(502)

      assert.strictEqual(response.body.error, 'Invalid response from AI service')
    })

    test('should return 502 when options array is incomplete', async () => {
      stub = sinon.stub(geminiService.googleGeminiClient.models, 'generateContent').resolves({
        text: '```json\n{"questions": [{"question": "What is React?", "options": ["A", "B"], "correct": 0}]}\n```'
      })

      const response = await api
        .post('/api/generate-quiz')
        .send({ name: 'React', description: 'Learn React', level: 'foundational', numQuestions: 5 })
        .expect(502)

      assert.strictEqual(response.body.error, 'Invalid response from AI service')
    })

    test('should return 502 when correct index is out of range', async () => {
      stub = sinon.stub(geminiService.googleGeminiClient.models, 'generateContent').resolves({
        text: '```json\n{"questions": [{"question": "What is React?", "options": ["A", "B", "C", "D"], "correct": 5}]}\n```'
      })

      const response = await api
        .post('/api/generate-quiz')
        .send({ name: 'React', description: 'Learn React', level: 'foundational', numQuestions: 5 })
        .expect(502)

      assert.strictEqual(response.body.error, 'Invalid response from AI service')
    })

    test('should return 502 when questions array is empty', async () => {
      stub = sinon.stub(geminiService.googleGeminiClient.models, 'generateContent').resolves({
        text: '```json\n{"questions": []}\n```'
      })

      const response = await api
        .post('/api/generate-quiz')
        .send({ name: 'React', description: 'Learn React', level: 'foundational', numQuestions: 5 })
        .expect(502)

      assert.strictEqual(response.body.error, 'Invalid response from AI service')
    })
  })

  test('should return 503 when API fails', async () => {
    stub = sinon.stub(geminiService.googleGeminiClient.models, 'generateContent')
      .rejects(new Error('API key invalid'))

    const response = await api
      .post('/api/generate-quiz')
      .send({ name: 'React', description: 'Learn React', level: 'foundational', numQuestions: 5 })
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
            text: '```json\n{"questions": [{"question": "What is React?", "options": ["A library", "A framework", "A language", "A tool"], "correct": 0}]}\n```'
          }
        })

      const response = await api
        .post('/api/generate-quiz')
        .send({ name: 'React', description: 'Learn React', level: 'foundational', numQuestions: 5 })
        .expect(200)

      // Verify retry happened: called twice (1 fail + 1 success)
      assert.strictEqual(callCount, 2)
      assert(Array.isArray(response.body.questions))
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
            text: '```json\n{"questions": [{"question": "What is React?", "options": ["A library", "A framework", "A language", "A tool"], "correct": 0}]}\n```'
          }
        })

      const response = await api
        .post('/api/generate-quiz')
        .send({ name: 'React', description: 'Learn React', level: 'foundational', numQuestions: 5 })
        .expect(200)

      // Verify: called 3 times (2 failures + 1 success)
      assert.strictEqual(callCount, 3)
      assert(Array.isArray(response.body.questions))
      assert.strictEqual(response.body.questions.length, 1)
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
        .post('/api/generate-quiz')
        .send({ name: 'React', description: 'Learn React', level: 'foundational', numQuestions: 5 })
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
        .post('/api/generate-quiz')
        .send({}) // Missing parameters - triggers validation error
        .expect(400)

      // Verify: never called the stub (validation happened before API call)
      assert.strictEqual(callCount, 0)
      assert.strictEqual(response.body.error, 'missing params required to generate quiz.')
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
        .post('/api/generate-quiz')
        .send({ name: 'React', description: 'Learn React', level: 'foundational', numQuestions: 5 })
        .expect(502)

      // Verify: called once (no retry on syntax error)
      assert.strictEqual(callCount, 1)
      assert.strictEqual(response.body.error, 'Invalid response from AI service')
    })
  })

  describe('multiple questions validation', () => {
    test('should accept multiple valid questions', async () => {
      stub = sinon.stub(geminiService.googleGeminiClient.models, 'generateContent').resolves({
        text: '```json\n{"questions": [{"question": "Q1?", "options": ["A", "B", "C", "D"], "correct": 0}, {"question": "Q2?", "options": ["A", "B", "C", "D"], "correct": 1}, {"question": "Q3?", "options": ["A", "B", "C", "D"], "correct": 2}]}\n```'
      })

      const response = await api
        .post('/api/generate-quiz')
        .send({ name: 'React', description: 'Learn React', level: 'foundational', numQuestions: 3 })
        .expect(200)

      assert.strictEqual(response.body.questions.length, 3)
      assert.strictEqual(response.body.questions[0].correct, 0)
      assert.strictEqual(response.body.questions[1].correct, 1)
      assert.strictEqual(response.body.questions[2].correct, 2)
    })

    test('should validate all questions in array', async () => {
      stub = sinon.stub(geminiService.googleGeminiClient.models, 'generateContent').resolves({
        text: '```json\n{"questions": [{"question": "Q1?", "options": ["A", "B", "C", "D"], "correct": 0}, {"question": "Q2?", "options": ["A", "B"], "correct": 0}]}\n```'
      })

      const response = await api
        .post('/api/generate-quiz')
        .send({ name: 'React', description: 'Learn React', level: 'foundational', numQuestions: 2 })
        .expect(502)

      assert.strictEqual(response.body.error, 'Invalid response from AI service')
    })
  })
})