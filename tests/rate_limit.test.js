const supertest = require('supertest')
const { describe, test, beforeEach, afterEach } = require('node:test')
const assert = require('node:assert')
const geminiService = require('../services/googleGeminiService')
const sinon = require('sinon')
const app = require('../app')

const api = supertest(app)

describe('rate limiting', () => {
  let stub = null

  describe('General service routes', () => {
    test('should return 429 after exceeding rate limit', async () => {
    // Make requests until rate limit is hit
      let response
      for (let i = 0; i < 101; i++) {
        response = await api
          .get('/api/health')
          .set('X-Forwarded-For', '192.168.1.100') // Simulate same IP
      }

      // 101st request should be rate limited
      assert.strictEqual(response.status, 429)
      assert(response.body.error.includes('Too many requests'))
    })
  })

  describe('AI service route', () => {
    beforeEach(() => {
      // Stub the ACTUAL API call at the lowest level
      stub = sinon.stub(geminiService.googleGeminiClient.models, 'generateContent').resolves({
        text: '```json\n{"target": "React", "prerequisites": [{"id": 1, "name": "JavaScript", "description": "Learn JS", "prerequisites": [], "level": "foundational"}]}\n```'
      })
    })

    afterEach(() => {
      if (stub) stub.restore()
    })

    test('should have stricter rate limit and return 429', async () => {
      // The /api/generate-map endpoint should rate limit faster
      // (20 requests per hour)
      let response = null

      for(let i = 0; i < 21; i++) {
        response = await api
          .post('/api/generate-map')
          .set('X-Forwarded-For', '192.168.1.101')
          .send({ concept: 'React' })
      }

      // 21st request should be rate limited
      assert.strictEqual(response.status, 429)
      assert(response.body.error.includes('Too many concept map requests'))

    })

    test('should return 200 within rate', async () => {
      for(let i = 0; i < 20; i++) {
        await api
          .post('/api/generate-map')
          .set('X-Forwarded-For', '192.168.1.102')
          .send({ concept: 'React' })
          .expect(200)
      }
    })
  })
})