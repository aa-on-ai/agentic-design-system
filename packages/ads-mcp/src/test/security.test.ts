import assert from 'node:assert/strict';
import { mkdtemp, mkdir, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  canonicalRoot,
  ensureDirectoryInside,
  normalizeAllowedOrigin,
  redactUrl,
  resolveFileInside,
  validateRenderUrl,
} from '../security.js';

test('root confinement rejects traversal and symlink escapes', async () => {
  const base = await mkdtemp(path.join(os.tmpdir(), 'ads-security-'));
  const rootInput = path.join(base, 'root');
  const outside = path.join(base, 'outside.txt');
  const outsideDirectory = path.join(base, 'outside-directory');
  await mkdir(rootInput);
  await mkdir(outsideDirectory);
  await writeFile(path.join(rootInput, 'inside.txt'), 'inside');
  await writeFile(outside, 'outside');
  await symlink(outside, path.join(rootInput, 'escape.txt'));
  await symlink(outsideDirectory, path.join(rootInput, '.ads'));
  const root = await canonicalRoot(rootInput);

  assert.equal(await resolveFileInside(root, 'inside.txt'), path.join(root, 'inside.txt'));
  await assert.rejects(resolveFileInside(root, '../outside.txt'), /escapes/);
  await assert.rejects(resolveFileInside(root, 'escape.txt'), /outside/);
  await assert.rejects(ensureDirectoryInside(root, '..'), /inside/);
  await assert.rejects(ensureDirectoryInside(root, '.ads/runs'), /outside/);
});

test('origin policy defaults to exact localhost and requires explicit remote origins', () => {
  const allowed = new Set([normalizeAllowedOrigin('https://example.com')]);
  assert.equal(validateRenderUrl('http://127.0.0.1:3000/orders', allowed).hostname, '127.0.0.1');
  assert.equal(validateRenderUrl('https://example.com/orders', allowed).origin, 'https://example.com');
  assert.throws(() => validateRenderUrl('https://untrusted.example/orders', allowed), /not allowed/);
  assert.throws(() => validateRenderUrl('file:///tmp/index.html', allowed), /HTTP/);
  assert.throws(() => validateRenderUrl('https://user:pass@example.com', allowed), /credentials/);
  assert.throws(() => normalizeAllowedOrigin('https://example.com/path'), /only scheme/);
});

test('receipt URLs redact common secret query parameters', () => {
  const redacted = redactUrl('http://localhost:3000/?token=abc&view=orders&api_key=xyz');
  assert.doesNotMatch(redacted, /abc|xyz/);
  assert.match(redacted, /view=orders/);
});
