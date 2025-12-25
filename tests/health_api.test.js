const app = require('../app')
const supertest = require('supertest')
const { test, describe, beforeEach } = require('node:test')
const assert = require('node:assert')

const api = supertest(app)

describe('GET /api/health', () => {
  let response = null
  beforeEach(async () => {
    response = await api.get('/api/health')
  })

  test('returns server status as json', async () => {
    await api.get('/api/health')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('returns server status - UP ', async () => {
    assert.strictEqual(response.body.status, 'UP')
  })

  test('returns timestamp', async () => {
    assert.match(response.body.timestamp, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
  })

  test('returns uptime', async () => {
    assert.strictEqual(typeof response.body.uptime, 'number')
    assert(response.body.uptime > 0)
  })
})
