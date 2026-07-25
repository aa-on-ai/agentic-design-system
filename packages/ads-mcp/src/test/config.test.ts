import assert from 'node:assert/strict';
import { mkdtemp } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { HELP, parseServerConfig } from '../config.js';

test('CLI config requires explicit provider/model metadata and absolute command paths', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'ads-config-'));
  await assert.rejects(
    parseServerConfig(['--root', root, '--judge-command', process.execPath]),
    /must be configured together/,
  );
  await assert.rejects(
    parseServerConfig([
      '--root',
      root,
      '--judge-command',
      'node',
      '--judge-provider',
      'fixture',
      '--judge-model',
      'fixture',
    ]),
    /absolute path/,
  );
  await assert.rejects(
    parseServerConfig(['--root', root, '--swiftui-renderer', 'xcode-preview']),
    /--swiftui-command is required/,
  );
});

test('CLI config preserves explicit adapter arguments and deduplicated detector receipts', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'ads-config-valid-'));
  const config = await parseServerConfig([
    '--root',
    root,
    '--judge-command',
    process.execPath,
    '--judge-arg',
    '--fixture-judge',
    '--judge-provider',
    'fixture-provider',
    '--judge-model',
    'fixture-model',
    '--swiftui-command',
    process.execPath,
    '--swiftui-arg',
    '--fixture-swiftui',
    '--swiftui-renderer',
    'xcode-preview',
    '--swiftui-detector',
    'swiftlint',
    '--swiftui-detector',
    'swiftlint',
    '--swiftui-detector',
    'asset-catalog',
  ]);
  assert.ok(config);
  assert.deepEqual(config.judgeCommand?.args, ['--fixture-judge']);
  assert.equal(config.judgeCommand?.provider, 'fixture-provider');
  assert.equal(config.judgeCommand?.model, 'fixture-model');
  assert.deepEqual(config.swiftUiCommand?.args, ['--fixture-swiftui']);
  assert.equal(config.swiftUiCommand?.renderer, 'xcode-preview');
  assert.deepEqual(config.swiftUiCommand?.detectors, ['swiftlint', 'asset-catalog']);
  assert.match(HELP, /--judge-command/);
  assert.match(HELP, /--swiftui-command/);
});
