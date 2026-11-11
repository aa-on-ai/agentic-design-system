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
  assert.equal(result.modelCalls, null);
  assert.equal(result.identitySource, 'configured');
  assert.equal(result.reportedUsage, undefined);
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

const usageRequest = {
  schemaVersion: 1 as const, runId: 'run_usage_fixture',
  target: { type: 'url' as const, url: 'http://localhost:3000/' },
  rubric: { task: 'Review', criteria: [{ name: 'Quality', weight: 100 }] },
  gates: {}, comparison: null, screenshots: [],
};
function usageJudge(extra: Record<string, unknown>) {
  const response = { verdict: 'satisfied', scores: { Quality: 8 }, findings: [], nextRevisionPrompt: '', ...extra };
  return new CommandVisualJudge({ command: process.execPath,
    args: ['--input-type=module', '-e', `for await (const chunk of process.stdin) {} process.stdout.write(${JSON.stringify(JSON.stringify(response))})`],
    provider: 'configured-provider', model: 'requested-model',
  });
}
test('command judge separates explicit zero or multi-call usage from immutable configured identity', async () => {
  for (const modelCalls of [0, 3]) {
    const usage = { provider: 'reported-provider', model: 'different-returned-model', modelCalls };
    const judge = usageJudge({ usage });
    const result = await judge.evaluate(usageRequest);
    assert.deepEqual(judge.configuredIdentity, { provider: 'configured-provider', model: 'requested-model' });
    assert.equal(result.provider, 'configured-provider');
    assert.equal(result.model, 'requested-model');
    assert.equal(result.modelCalls, modelCalls);
    assert.deepEqual(result.reportedUsage, usage);
  }
});
test('command judge rejects invalid usage and top-level identity spoofing', async () => {
  for (const modelCalls of [-1, 0.5, Number.MAX_SAFE_INTEGER + 1]) {
    await assert.rejects(usageJudge({ usage: { provider: 'p', model: 'm', modelCalls } }).evaluate(usageRequest));
  }
  await assert.rejects(usageJudge({ usage: { provider: '', model: 'm', modelCalls: 0 } }).evaluate(usageRequest));
  await assert.rejects(usageJudge({ provider: 'spoof', model: 'spoof', modelCalls: 0 }).evaluate(usageRequest));
});
