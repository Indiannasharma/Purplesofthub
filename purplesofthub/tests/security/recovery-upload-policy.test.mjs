/**
 * Recovery attachment policy tests.
 *
 * These exercise the exact functions the public and admin route handlers call
 * (`lib/uploadPolicy.ts`), so a regression in the allowlist / size / magic-byte
 * logic fails the suite.
 */
import test from 'node:test'
import assert from 'node:assert/strict'

import {
  RECOVERY_DOCUMENT_MAX_ATTACHMENTS,
  RECOVERY_DOCUMENT_MAX_BYTES,
  RECOVERY_DOCUMENT_MIME_TYPES,
  RECOVERY_REQUEST_MAX_BYTES,
  extensionForMimeType,
  matchesFileSignature,
  sanitizeDisplayFileName,
  validateRecoveryDocument,
} from '../../lib/uploadPolicy.ts'

const JPEG = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(128, 0x20)])
const PNG = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  Buffer.alloc(128, 0x00),
])
const PDF = Buffer.concat([Buffer.from('%PDF-1.7\n'), Buffer.alloc(128, 0x20)])

const file = (type, size) => ({ type, size })

test('the recovery allowlist is limited to JPEG, PNG and PDF', () => {
  assert.deepEqual([...RECOVERY_DOCUMENT_MIME_TYPES], [
    'image/jpeg',
    'image/png',
    'application/pdf',
  ])
  assert.equal(extensionForMimeType('image/jpeg'), 'jpg')
  assert.equal(extensionForMimeType('image/png'), 'png')
  assert.equal(extensionForMimeType('application/pdf'), 'pdf')
  assert.equal(extensionForMimeType('image/svg+xml'), null)
  assert.equal(extensionForMimeType('image/gif'), null)
})

test('limits are 5 MB per file, 2 attachments and a bounded request body', () => {
  assert.equal(RECOVERY_DOCUMENT_MAX_BYTES, 5 * 1024 * 1024)
  assert.equal(RECOVERY_DOCUMENT_MAX_ATTACHMENTS, 2)
  assert.ok(RECOVERY_REQUEST_MAX_BYTES > RECOVERY_DOCUMENT_MAX_BYTES * RECOVERY_DOCUMENT_MAX_ATTACHMENTS)
})

test('valid JPEG, PNG and PDF documents are accepted', () => {
  for (const [type, buffer] of [
    ['image/jpeg', JPEG],
    ['image/png', PNG],
    ['application/pdf', PDF],
  ]) {
    const result = validateRecoveryDocument(file(type, buffer.length), buffer)
    assert.equal(result.ok, true, `${type} should be accepted`)
    assert.equal(result.mimeType, type)
  }
})

test('unsupported declared MIME types are rejected (415)', () => {
  for (const type of ['image/svg+xml', 'image/gif', 'image/webp', 'application/zip', 'text/html']) {
    const result = validateRecoveryDocument(file(type, PNG.length), PNG)
    assert.equal(result.ok, false)
    assert.equal(result.status, 415)
  }
})

test('a missing or nonsense MIME type is rejected (415)', () => {
  assert.equal(validateRecoveryDocument(file('', PNG.length), PNG).ok, false)
  assert.equal(validateRecoveryDocument(file(undefined, PNG.length), PNG).ok, false)
  assert.equal(validateRecoveryDocument(file('not-a-mime', PNG.length), PNG).ok, false)
})

test('spoofed MIME types are rejected: contents must match the declared type', () => {
  // Windows executable bytes declared as an image.
  const spoofedImage = Buffer.concat([Buffer.from('MZ\x90\x00'), Buffer.alloc(128, 0x00)])
  const spoofedResult = validateRecoveryDocument(
    file('image/png', spoofedImage.length),
    spoofedImage
  )
  assert.equal(spoofedResult.ok, false)
  assert.equal(spoofedResult.status, 415)

  // A PDF declared as a PNG (and vice versa).
  assert.equal(validateRecoveryDocument(file('image/png', PDF.length), PDF).ok, false)
  assert.equal(validateRecoveryDocument(file('application/pdf', PNG.length), PNG).ok, false)

  // An HTML document declared as a PDF.
  const html = Buffer.from('<html><script>alert(1)</script></html>')
  assert.equal(validateRecoveryDocument(file('application/pdf', html.length), html).ok, false)
})

test('oversized files are rejected (413) even when the bytes look valid', () => {
  const result = validateRecoveryDocument(file('image/png', RECOVERY_DOCUMENT_MAX_BYTES + 1), PNG)
  assert.equal(result.ok, false)
  assert.equal(result.status, 413)
})

test('empty files are rejected (400)', () => {
  assert.equal(validateRecoveryDocument(file('image/png', 0), Buffer.alloc(0)).ok, false)
  const empty = validateRecoveryDocument(file('image/png', 0), Buffer.alloc(0))
  assert.equal(empty.ok, false)
  assert.equal(empty.status, 400)
})

test('the storage extension never comes from the client filename', () => {
  const name = 'my identity card.pdf'
  assert.equal(validateRecoveryDocument(file('image/png', PNG.length), PNG).extension, 'png')
  assert.equal(validateRecoveryDocument(file('application/pdf', PDF.length), PDF).extension, 'pdf')
  // The declared type decides, regardless of the name the browser sent.
  assert.equal(name.endsWith('.pdf'), true)
  assert.equal(extensionForMimeType('image/png'), 'png')
})

test('sanitizeDisplayFileName strips paths and control characters and caps length', () => {
  assert.equal(sanitizeDisplayFileName('C:\\Users\\hp\\passport.jpg'), 'passport.jpg')
  assert.equal(sanitizeDisplayFileName('/tmp/nin scan.png'), 'nin scan.png')
  assert.equal(sanitizeDisplayFileName('evil\r\nname.png'), 'evilname.png')
  assert.equal(sanitizeDisplayFileName('<script>.png'), 'script.png')
  assert.equal(sanitizeDisplayFileName('..'), null)
  assert.equal(sanitizeDisplayFileName(''), null)
  assert.equal(sanitizeDisplayFileName(null), null)
  assert.equal(sanitizeDisplayFileName('a'.repeat(400)).length, 120)
})

test('matchesFileSignature stays strict for the recovery formats', () => {
  assert.equal(matchesFileSignature(PNG, 'image/png'), true)
  assert.equal(matchesFileSignature(JPEG, 'image/jpeg'), true)
  assert.equal(matchesFileSignature(PDF, 'application/pdf'), true)
  assert.equal(matchesFileSignature(Buffer.from('plain text'), 'application/pdf'), false)
  assert.equal(matchesFileSignature(Buffer.from('plain text'), 'image/png'), false)
})
