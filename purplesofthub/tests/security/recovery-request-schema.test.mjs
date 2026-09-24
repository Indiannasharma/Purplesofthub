/**
 * Recovery submission schema tests.
 *
 * Covers the internal-field rejection that used to let a public browser submit
 * `admin_notes`, plus the field aliases the real forms send.
 */
import test from 'node:test'
import assert from 'node:assert/strict'

import {
  RECOVERY_MAX_APPEAL_MESSAGE_LENGTH,
  parseRecoverySubmission,
} from '../../lib/recovery/requests.ts'

function publicForm(overrides = {}) {
  const fields = {
    fullName: 'Ada Lovelace',
    email: 'Ada@Example.com',
    platform: 'facebook',
    handle: '@ada',
    issueType: 'hacked',
    appealMessage: 'My account was taken over on Monday.',
    amount: '42000',
    paymentMethod: 'paystack',
    ...overrides,
  }

  const form = new FormData()
  for (const [key, value] of Object.entries(fields)) form.append(key, value)
  return form
}

test('a valid public submission is normalised', () => {
  const parsed = parseRecoverySubmission(publicForm(), { mode: 'public' })
  assert.equal(parsed.ok, true)
  assert.equal(parsed.value.first_name, 'Ada')
  assert.equal(parsed.value.last_name, 'Lovelace')
  assert.equal(parsed.value.email, 'ada@example.com')
  assert.equal(parsed.value.platform, 'facebook')
  assert.equal(parsed.value.support_type, 'hacked')
  assert.equal(parsed.value.amount, 42000)
  assert.equal(parsed.value.handle, 'ada')
  assert.equal(parsed.adminNotes, null)
})

test('admin_notes cannot be submitted through the public endpoint', () => {
  const parsed = parseRecoverySubmission(publicForm({ admin_notes: 'internal only' }), {
    mode: 'public',
  })
  assert.equal(parsed.ok, false)
  assert.equal(parsed.status, 400)
})

test('admin_notes is accepted only from the admin-guarded mode', () => {
  const parsed = parseRecoverySubmission(publicForm({ admin_notes: '  internal note  ' }), {
    mode: 'admin',
  })
  assert.equal(parsed.ok, true)
  assert.equal(parsed.adminNotes, 'internal note')
})

test('every server-owned internal field is rejected from the public endpoint', () => {
  const internalFields = {
    status: 'completed',
    created_by_admin_id: '00000000-0000-4000-8000-000000000000',
    user_id: '00000000-0000-4000-8000-000000000000',
    id_document_url: 'recovery/../../etc/passwd',
    screenshot_url: 'https://evil.example.com/x.png',
    assigned_to: 'someone',
    approval_status: 'approved',
  }

  for (const [key, value] of Object.entries(internalFields)) {
    const parsed = parseRecoverySubmission(publicForm({ [key]: value }), { mode: 'public' })
    assert.equal(parsed.ok, false, `${key} must be rejected`)
    assert.equal(parsed.status, 400)
  }
})

test('server-owned fields stay rejected in admin mode too', () => {
  const parsed = parseRecoverySubmission(publicForm({ id_document_url: 'recovery/x.png' }), {
    mode: 'admin',
  })
  assert.equal(parsed.ok, false)
})

test('unexpected fields are rejected rather than silently dropped', () => {
  const parsed = parseRecoverySubmission(publicForm({ is_admin: 'true' }), { mode: 'public' })
  assert.equal(parsed.ok, false)
  assert.equal(parsed.status, 400)
})

test('required fields are enforced', () => {
  const noEmail = new FormData()
  noEmail.append('first_name', 'Ada')
  noEmail.append('platform', 'facebook')
  noEmail.append('appeal_message', 'Please help.')
  assert.equal(parseRecoverySubmission(noEmail, { mode: 'public' }).ok, false)

  const badEmail = new FormData()
  badEmail.append('fullName', 'Ada Lovelace')
  badEmail.append('email', 'not-an-email')
  badEmail.append('platform', 'facebook')
  badEmail.append('appeal_message', 'Please help.')
  assert.equal(parseRecoverySubmission(badEmail, { mode: 'public' }).ok, false)

  const noAppeal = new FormData()
  noAppeal.append('fullName', 'Ada Lovelace')
  noAppeal.append('email', 'ada@example.com')
  noAppeal.append('platform', 'facebook')
  assert.equal(parseRecoverySubmission(noAppeal, { mode: 'public' }).ok, false)
})

test('platform values are validated against the supported set', () => {
  assert.equal(
    parseRecoverySubmission(publicForm({ platform: 'myspace' }), { mode: 'public' }).ok,
    false
  )
  assert.equal(
    parseRecoverySubmission(publicForm({ platform: 'tiktok' }), { mode: 'public' }).ok,
    true
  )
})

test('amounts must be finite and bounded', () => {
  assert.equal(parseRecoverySubmission(publicForm({ amount: 'abc' }), { mode: 'public' }).ok, false)
  assert.equal(parseRecoverySubmission(publicForm({ amount: '-5' }), { mode: 'public' }).ok, false)
  assert.equal(
    parseRecoverySubmission(publicForm({ amount: '999999999999' }), { mode: 'public' }).ok,
    false
  )
})

test('values are length-capped', () => {
  const parsed = parseRecoverySubmission(
    publicForm({ appealMessage: 'x'.repeat(RECOVERY_MAX_APPEAL_MESSAGE_LENGTH + 500) }),
    { mode: 'public' }
  )
  assert.equal(parsed.ok, true)
  assert.equal(parsed.value.appeal_message.length, RECOVERY_MAX_APPEAL_MESSAGE_LENGTH)
})

test('the admin form field names work as well (snake_case + first/last)', () => {
  const form = new FormData()
  form.append('email', 'client@example.com')
  form.append('first_name', 'John')
  form.append('last_name', 'Doe')
  form.append('phone', '+234 906 446 1786')
  form.append('platform', 'youtube')
  form.append('issueType', 'appeal')
  form.append('appeal_message', 'Appeal for a disabled channel.')
  const parsed = parseRecoverySubmission(form, { mode: 'admin' })
  assert.equal(parsed.ok, true)
  assert.equal(parsed.value.full_name, 'John Doe')
  assert.equal(parsed.value.platform, 'youtube')
  assert.equal(parsed.value.phone, '+234 906 446 1786')
})
