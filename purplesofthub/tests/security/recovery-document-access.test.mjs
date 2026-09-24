/**
 * Recovery document access tests: unpredictable object paths, legacy public URL
 * handling and the privacy-conscious rate-limit key.
 */
import test from 'node:test'
import assert from 'node:assert/strict'

import {
  RECOVERY_DOCUMENTS_BUCKET,
  RECOVERY_DOCUMENT_COLUMN_BY_KEY,
  RECOVERY_SIGNED_URL_TTL_SECONDS,
  deriveRecoveryRateLimitKey,
  isCanonicalRecoveryObjectPath,
  isRecoveryDocumentKey,
  isUuid,
  newRecoveryDocumentPath,
  parseRecoveryDocumentReference,
} from '../../lib/recovery/documents.ts'

import { isAdminRecoveryStatus, toAdminRecoveryRecord } from '../../lib/recovery/records.ts'

const PROJECT = 'https://abcdefghijklmnop.supabase.co'
const REQUEST_ID = '2b1f1c9e-4f6a-4f4e-9f5a-1c2d3e4f5a6b'

test('storage paths are unpredictable and contain no client-supplied data', () => {
  const path = newRecoveryDocumentPath(REQUEST_ID, 'png')
  assert.match(
    path,
    /^recovery\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.png$/
  )
  assert.equal(isCanonicalRecoveryObjectPath(path), true)
  assert.equal(path.includes('id_'), false)
  assert.equal(path.includes('@'), false)
  assert.equal(path.includes('+'), false)
})

test('two documents in the same request never collide', () => {
  const paths = new Set()
  for (let i = 0; i < 200; i += 1) {
    paths.add(newRecoveryDocumentPath(REQUEST_ID, 'pdf'))
  }
  assert.equal(paths.size, 200)
})

test('path building refuses invalid input', () => {
  assert.throws(() => newRecoveryDocumentPath('not-a-uuid', 'png'))
  assert.throws(() => newRecoveryDocumentPath(REQUEST_ID, 'exe'))
  assert.throws(() => newRecoveryDocumentPath(REQUEST_ID, ''))
  assert.equal(isUuid(REQUEST_ID), true)
  assert.equal(isUuid('not-a-uuid'), false)
})

test('only the two known document keys can be requested', () => {
  assert.equal(isRecoveryDocumentKey('id_document'), true)
  assert.equal(isRecoveryDocumentKey('screenshot'), true)
  assert.equal(isRecoveryDocumentKey('id_document_url'), false)
  assert.equal(isRecoveryDocumentKey('admin_notes'), false)
  assert.equal(isRecoveryDocumentKey('../../etc/passwd'), false)
  assert.deepEqual(RECOVERY_DOCUMENT_COLUMN_BY_KEY, {
    id_document: 'id_document_url',
    screenshot: 'screenshot_url',
  })
})

test('canonical private object paths are resolved for the recovery bucket', () => {
  const reference = parseRecoveryDocumentReference(
    'recovery/2b1f1c9e-4f6a-4f4e-9f5a-1c2d3e4f5a6b/6f1c2b3a-1111-4222-8333-444455556666.jpg',
    PROJECT
  )
  assert.ok(reference)
  assert.equal(reference.bucket, RECOVERY_DOCUMENTS_BUCKET)
  assert.equal(reference.legacyPublicUrl, false)
})

test('legacy flat object names stay readable (historical submissions)', () => {
  const reference = parseRecoveryDocumentReference('id_1699999999999_passport_jpg', PROJECT)
  assert.ok(reference)
  assert.equal(reference.objectPath, 'id_1699999999999_passport_jpg')
})

test('legacy public URLs from our own project and bucket are parsed', () => {
  const reference = parseRecoveryDocumentReference(
    `${PROJECT}/storage/v1/object/public/account-recovery-documents/id_1699999999999_passport_jpg`,
    PROJECT
  )
  assert.ok(reference)
  assert.equal(reference.legacyPublicUrl, true)
  assert.equal(reference.objectPath, 'id_1699999999999_passport_jpg')
})

test('encoded legacy names are decoded before signing', () => {
  const reference = parseRecoveryDocumentReference(
    `${PROJECT}/storage/v1/object/public/account-recovery-documents/id_1_nin%20card.png`,
    PROJECT
  )
  assert.ok(reference)
  assert.equal(reference.objectPath, 'id_1_nin card.png')
})

test('external URLs and foreign buckets are rejected', () => {
  const rejected = [
    'https://evil.example.com/storage/v1/object/public/account-recovery-documents/id_1.jpg',
    'https://otherapp.supabase.co/storage/v1/object/public/account-recovery-documents/id_1.jpg',
    `${PROJECT}/storage/v1/object/public/avatars/id_1.jpg`,
    `${PROJECT}/storage/v1/object/sign/account-recovery-documents/id_1.jpg`,
    'http://169.254.169.254/latest/meta-data/',
    'https://abcdefghijklmnop.supabase.co.evil.example/x',
  ]

  for (const value of rejected) {
    assert.equal(parseRecoveryDocumentReference(value, PROJECT), null, value)
  }
})

test('traversal and absolute-looking paths are rejected', () => {
  const rejected = [
    'recovery/../../etc/passwd',
    '/etc/passwd',
    'C:\\Windows\\win.ini',
    'recovery\\..\\secret',
    'recovery//double.png',
  ]

  for (const value of rejected) {
    assert.equal(parseRecoveryDocumentReference(value, PROJECT), null, value)
  }
})

test('empty, missing and oversized references are rejected', () => {
  assert.equal(parseRecoveryDocumentReference(null, PROJECT), null)
  assert.equal(parseRecoveryDocumentReference('', PROJECT), null)
  assert.equal(parseRecoveryDocumentReference('   ', PROJECT), null)
  assert.equal(parseRecoveryDocumentReference(`recovery/${'a'.repeat(3000)}.png`, PROJECT), null)
  assert.equal(
    parseRecoveryDocumentReference(
      `${PROJECT}/storage/v1/object/public/account-recovery-documents/id.jpg`,
      null
    ),
    null
  )
})

test('signed URLs are short-lived and scoped to the private bucket', () => {
  assert.equal(RECOVERY_SIGNED_URL_TTL_SECONDS, 60)
  assert.ok(RECOVERY_SIGNED_URL_TTL_SECONDS <= 300)
  assert.equal(RECOVERY_DOCUMENTS_BUCKET, 'account-recovery-documents')
})

test('rate-limit keys never contain the raw client identifier', () => {
  const ip = '203.0.113.77'
  const key = deriveRecoveryRateLimitKey(ip, 'pepper')

  assert.match(key, /^recovery:[0-9a-f]{64}$/)
  assert.equal(key.includes(ip), false)
  assert.equal(key, deriveRecoveryRateLimitKey(ip, 'pepper'))
  assert.notEqual(key, deriveRecoveryRateLimitKey(ip, 'other-pepper'))
  assert.notEqual(key, deriveRecoveryRateLimitKey('203.0.113.78', 'pepper'))
})

test('admin records expose document flags, never storage locations', () => {
  const record = toAdminRecoveryRecord({
    id: 'abc',
    first_name: 'Ada',
    email: 'ada@example.com',
    admin_notes: 'internal',
    id_document_url: `recovery/${REQUEST_ID}/${REQUEST_ID}.png`,
    screenshot_url: null,
    created_at: '2026-09-24T10:00:00.000Z',
  })

  assert.equal(record.has_id_document, true)
  assert.equal(record.has_screenshot, false)
  assert.equal(Object.keys(record).includes('id_document_url'), false)
  assert.equal(JSON.stringify(record).includes('recovery/'), false)
  assert.equal(record.admin_notes, 'internal')
})

test('only whitelisted statuses can be written through the admin route', () => {
  for (const status of ['pending_payment', 'pending', 'in_progress', 'completed', 'rejected']) {
    assert.equal(isAdminRecoveryStatus(status), true)
  }
  for (const status of ['approved', 'admin', 'deleted', '']) {
    assert.equal(isAdminRecoveryStatus(status), false)
  }
})
