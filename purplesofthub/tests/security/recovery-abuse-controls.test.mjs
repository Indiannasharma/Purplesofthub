/**
 * Abuse-control tests for the public recovery endpoint.
 *
 * `lib/verifyCaptcha.ts` is the exact helper the route calls. The fetch calls
 * are stubbed so no network access is needed.
 */
import test from 'node:test'
import assert from 'node:assert/strict'

import { verifyCaptcha } from '../../lib/verifyCaptcha.ts'

const originalFetch = globalThis.fetch
const originalWarn = console.warn

function stubFetch(implementation) {
  globalThis.fetch = implementation
}

test.before(() => {
  console.warn = () => {}
})

test.after(() => {
  globalThis.fetch = originalFetch
  console.warn = originalWarn
  delete process.env.TURNSTILE_SECRET_KEY
})

test('captcha verification fails closed when a secret is configured and no token is sent', async () => {
  process.env.TURNSTILE_SECRET_KEY = 'test-secret'
  const result = await verifyCaptcha(undefined, '203.0.113.10')
  assert.equal(result.ok, false)
})

test('a valid token is verified against the Turnstile siteverify endpoint', async () => {
  process.env.TURNSTILE_SECRET_KEY = 'test-secret'
  let captured = null

  stubFetch(async (url, init) => {
    captured = { url, body: JSON.parse(init.body) }
    return { json: async () => ({ success: true }) }
  })

  const result = await verifyCaptcha('good-token', '203.0.113.10')
  assert.equal(result.ok, true)
  assert.equal(captured.url, 'https://challenges.cloudflare.com/turnstile/v0/siteverify')
  assert.equal(captured.body.secret, 'test-secret')
  assert.equal(captured.body.response, 'good-token')
  assert.equal(captured.body.remoteip, '203.0.113.10')
})

test('a rejected token cannot be bypassed', async () => {
  process.env.TURNSTILE_SECRET_KEY = 'test-secret'
  stubFetch(async () => ({ json: async () => ({ success: false, 'error-codes': ['invalid-input-response'] }) }))

  const result = await verifyCaptcha('forged-token', '203.0.113.10')
  assert.equal(result.ok, false)
})

test('a failing siteverify call fails closed', async () => {
  process.env.TURNSTILE_SECRET_KEY = 'test-secret'
  stubFetch(async () => {
    throw new Error('network down')
  })

  const result = await verifyCaptcha('any-token', '203.0.113.10')
  assert.equal(result.ok, false)
})

test('the check is dormant (and never calls out) when no secret is configured', async () => {
  delete process.env.TURNSTILE_SECRET_KEY
  let called = false
  stubFetch(async () => {
    called = true
    return { json: async () => ({ success: true }) }
  })

  const result = await verifyCaptcha(undefined, '203.0.113.10')
  assert.equal(result.ok, true)
  assert.equal(called, false)
})
