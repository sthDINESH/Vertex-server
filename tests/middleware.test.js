const app = require('../app')
const supertest = require('supertest')
const { describe, test } = require('node:test')
const assert = require('node:assert')

const api = supertest(app)

describe('GET unknown endpoint', () => {
  test('returns json with status 404', async () => {
    await api.get('/random')
      .expect(404)
      .expect('Content-Type', /application\/json/)
  })

  test('returns error message', async () => {
    const response = await api.get('/ajsljdlask')

    assert.strictEqual(response.body.error, 'unknown endpoint')
  })
})