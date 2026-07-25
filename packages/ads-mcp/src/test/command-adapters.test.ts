import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { CommandSwiftUiRenderer, CommandVisualJudge } from '../command-adapters.js';

test('command visual judge exchanges one bounded JSON request and typed response without a shell', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'ads-judge-command-'));
  const script = path.join(root, 'judge.mjs');
  await writeFile(script, `
let input = "";
for await (const chunk of process.stdin) input += chunk;
const request = JSON.parse(input);
const artifact = request.screenshots[0].artifact;
process.stdout.write(JSON.stringify({
  verdict: "satisfied",
  scores: { "Design Quality": 9 },
  findings: [],
  nextRevisionPrompt: ""
}));
`);
  const judge = new CommandVisualJudge({
    command: process.execPath,
    args: [script],
    provider: 'fixture-provider',
    model: 'fixture-model',
  });
  const result = await judge.evaluate({
    schemaVersion: 1,
    runId: 'run_fixture_000000000000',
    target: { type: 'url', url: 'http://localhost:3000/' },
    rubric: { task: 'Review', criteria: [{ name: 'Design Quality', weight: 100 }] },
    gates: {},
    comparison: null,
    screenshots: [{
      state: 'default',
      breakpoint: '390x844',
      artifact: 'ads://runs/run_fixture_000000000000/screenshots/default-390x844.png',
      path: '/tmp/default-390x844.png',
    }],
  });
  assert.equal(result.provider, 'fixture-provider');
  assert.equal(result.model, 'fixture-model');
  assert.equal(result.modelCalls, 1);
  assert.equal(result.verdict, 'satisfied');
  assert.equal(result.scores['Design Quality'], 9);
});

test('command SwiftUI renderer writes evidence into the caller-owned run directory', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'ads-swiftui-command-'));
  const script = path.join(root, 'swiftui.mjs');
  const outDir = path.join(root, 'evidence');
  await writeFile(script, `
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
let input = "";
for await (const chunk of process.stdin) input += chunk;
const request = JSON.parse(input);
await mkdir(request.outDir, { recursive: true });
const screenshot = "default-393x852.png";
await writeFile(path.join(request.outDir, screenshot), "png");
await writeFile(path.join(request.outDir, "evidence.json"), JSON.stringify({
  snapshots: [{ state: "default", breakpoint: "393x852", screenshot }],
  gates: {
    adapterAvailable: true,
    buildSucceeded: true,
    stateRendered: { default: true }
  }
}));
process.stdout.write(JSON.stringify({ status: "complete" }));
`);
  const renderer = new CommandSwiftUiRenderer({
    command: process.execPath,
    args: [script],
    renderer: 'fixture-swiftui',
    detectors: ['swiftui-snapshot'],
  });
  await renderer.render({
    root,
    target: { type: 'swiftui', projectPath: 'App.xcodeproj', scheme: 'App' },
    projectPath: path.join(root, 'App.xcodeproj'),
    states: ['default'],
    viewports: [{ width: 393, height: 852 }],
    settleMs: 0,
    outDir,
    timeoutMs: 2_000,
  });
  assert.equal(renderer.id, 'fixture-swiftui');
  assert.deepEqual(renderer.detectors, ['swiftui-snapshot']);
  assert.match(await readFile(path.join(outDir, 'evidence.json'), 'utf8'), /buildSucceeded/);
});

test('command adapters reject invalid or unbounded protocol output', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'ads-command-invalid-'));
  const script = path.join(root, 'invalid.mjs');
  await writeFile(script, 'process.stdout.write("not-json");\n');
  const judge = new CommandVisualJudge({
    command: process.execPath,
    args: [script],
    provider: 'fixture',
    model: 'fixture',
  });
  await assert.rejects(
    judge.evaluate({
      schemaVersion: 1,
      runId: 'run_fixture_000000000000',
      target: { type: 'url', url: 'http://localhost:3000/' },
      rubric: { task: 'Review', criteria: [{ name: 'Craft', weight: 100 }] },
      gates: {},
      comparison: null,
      screenshots: [],
    }),
    /invalid JSON/,
  );
});
