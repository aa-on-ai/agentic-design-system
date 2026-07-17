#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { access, mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const START_MARKER = '<!-- ads-decision-provenance:start -->';
const END_MARKER = '<!-- ads-decision-provenance:end -->';
const DEFAULT_BUDGET_MS = 250;
const REVIEW_STATUSES = new Set(['draft', 'reviewed', 'verified', 'rejected']);

function usage() {
  return `Usage:
  node decision-trace.mjs capture --out <skill-manifest.json> [options]
  node decision-trace.mjs verify --manifest <skill-manifest.json> --trace <decision-trace.json> [options]

Capture options (repeat file options as needed):
  --root <dir>          Project root. Defaults to cwd.
  --observed <file>     Skill file actually loaded before the build.
  --declared <file>     Skill file selected, but not proven loaded.
  --source <file>       Product/source-of-truth file used by the run.
  --release <value>     ADS release or checkout identifier.
  --budget-ms <number>  Deterministic capture budget. Default: ${DEFAULT_BUDGET_MS}.

Verify options:
  --root <dir>          Project root. Defaults to cwd.
  --report <file>       Add or replace the managed provenance block in a run report.
  --validation <file>   Write a machine-readable validation receipt.
  --budget-ms <number>  Deterministic verification budget. Default: ${DEFAULT_BUDGET_MS}.

The script performs local hashing and validation only. It makes no network, model, or browser calls.`;
}

function parseArgs(argv) {
  const parsed = { _: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) {
      parsed._.push(token);
      continue;
    }
    const key = token.slice(2);
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) throw new Error(`missing value for --${key}`);
    index += 1;
    parsed[key] = parsed[key] === undefined
      ? value
      : Array.isArray(parsed[key])
        ? [...parsed[key], value]
        : [parsed[key], value];
  }
  return parsed;
}

function values(args, key) {
  if (args[key] === undefined) return [];
  return Array.isArray(args[key]) ? args[key] : [args[key]];
}

function required(args, key) {
  const value = args[key];
  if (!value || Array.isArray(value)) throw new Error(`--${key} is required exactly once`);
  return value;
}

function budgetFrom(args) {
  const budget = Number(args['budget-ms'] ?? DEFAULT_BUDGET_MS);
  if (!Number.isFinite(budget) || budget <= 0) throw new Error('--budget-ms must be a positive number');
  return budget;
}

function elapsedMs(startedAt) {
  return Number(process.hrtime.bigint() - startedAt) / 1_000_000;
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function portablePath(root, file) {
  const absolute = path.resolve(root, file);
  const relative = path.relative(root, absolute);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`path must be a file inside --root: ${file}`);
  }
  return relative.split(path.sep).join('/');
}

function resolvePortable(root, file) {
  return path.resolve(root, ...file.split('/'));
}

function skillNameFrom(file) {
  const parts = file.split('/');
  const skillIndex = parts.lastIndexOf('skills');
  return skillIndex >= 0 && parts[skillIndex + 1] ? parts[skillIndex + 1] : 'unknown';
}

function stableId(prefix, file) {
  const stem = file
    .replace(/\/SKILL\.md$/i, '')
    .replace(/\.[^.\/]+$/, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
  return `${prefix}-${stem}`;
}

async function fileRecord(root, file, extra = {}) {
  const portable = portablePath(root, file);
  const absolute = resolvePortable(root, portable);
  const [bytes, details] = await Promise.all([readFile(absolute), stat(absolute)]);
  if (!details.isFile()) throw new Error(`expected a file: ${file}`);
  return {
    id: stableId(extra.kind === 'source' ? 'source' : 'skill', portable),
    path: portable,
    sha256: sha256(bytes),
    bytes: details.size,
    ...extra,
  };
}

async function detectRelease(root) {
  try {
    const packageJson = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
    return packageJson.version ? `v${packageJson.version}` : null;
  } catch {
    return null;
  }
}

async function capture(args) {
  const startedAt = process.hrtime.bigint();
  const root = path.resolve(args.root || process.cwd());
  const out = path.resolve(root, required(args, 'out'));
  const budgetMs = budgetFrom(args);
  const observed = values(args, 'observed');
  const declared = values(args, 'declared');
  const sources = values(args, 'source');

  if (observed.length + declared.length === 0) {
    throw new Error('capture needs at least one --observed or --declared skill file');
  }

  const statuses = new Map();
  for (const file of declared) statuses.set(portablePath(root, file), 'declared');
  for (const file of observed) statuses.set(portablePath(root, file), 'observed');

  const skillFiles = await Promise.all(
    [...statuses.entries()].map(([file, loadStatus]) =>
      fileRecord(root, file, {
        kind: 'skill',
        skill: skillNameFrom(file),
        loadStatus,
      })),
  );
  const sourceFiles = await Promise.all(
    [...new Set(sources.map((file) => portablePath(root, file)))].map((file) =>
      fileRecord(root, file, { kind: 'source' })),
  );
  skillFiles.sort((a, b) => a.path.localeCompare(b.path));
  sourceFiles.sort((a, b) => a.path.localeCompare(b.path));

  const adsRelease = args.release || await detectRelease(root);
  const measuredMs = elapsedMs(startedAt);
  const manifest = {
    schemaVersion: 1,
    captureMode: 'pre-run',
    generatedAt: new Date().toISOString(),
    projectRoot: '.',
    adsRelease,
    skillFiles,
    sourceFiles,
    performance: {
      operation: 'local-hash-capture',
      elapsedMs: Number(measuredMs.toFixed(3)),
      budgetMs,
      withinBudget: measuredMs <= budgetMs,
      networkCalls: 0,
      modelCalls: 0,
      browserCalls: 0,
    },
  };

  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  console.log(
    `skill manifest: ${skillFiles.length} skill file(s), ${sourceFiles.length} source file(s), ` +
    `${manifest.performance.elapsedMs}ms / ${budgetMs}ms`,
  );
  if (!manifest.performance.withinBudget) process.exitCode = 2;
}

function addError(errors, condition, message) {
  if (!condition) errors.push(message);
}

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

function verifyExcerpt(errors, label, excerpt, excerptHash, content) {
  addError(errors, typeof excerpt === 'string' && excerpt.trim().length > 0, `${label}: excerpt is required`);
  if (typeof excerpt !== 'string' || excerpt.length === 0) return;
  addError(errors, sha256(excerpt) === excerptHash, `${label}: excerptSha256 does not match excerpt`);
  addError(errors, content.includes(excerpt), `${label}: excerpt is not present in the captured file`);
}

function markdownLink(label, target, reportPath, root) {
  const relative = path.relative(path.dirname(reportPath), resolvePortable(root, target)).split(path.sep).join('/');
  return `[${label}](${relative})`;
}

function tableCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

function reportBlock({ manifest, trace, reportPath, root, verificationMs, budgetMs }) {
  const skillMap = new Map(manifest.skillFiles.map((file) => [file.id, file]));
  const rows = trace.decisions.map((decision) => {
    const skill = skillMap.get(decision.rule.fileId);
    const evidence = (decision.evidence || [])
      .map((item) => markdownLink(item.type || 'evidence', item.path, reportPath, root))
      .join(', ');
    return `| ${tableCell(decision.decision)} | ${markdownLink(tableCell(decision.artifact.location || decision.artifact.path), decision.artifact.path, reportPath, root)} | ${tableCell(skill?.skill || 'unknown')} · \`${tableCell(skill?.sha256.slice(0, 10))}\`<br>${tableCell(decision.rule.excerpt)} | ${tableCell(decision.sourceConstraint.excerpt)} | ${evidence} | ${tableCell(decision.reviewStatus)} |`;
  });
  const captureMs = manifest.performance?.elapsedMs ?? 'unknown';
  const totalMs = typeof captureMs === 'number' ? Number((captureMs + verificationMs).toFixed(3)) : verificationMs;

  return `${START_MARKER}
## decision provenance

- **manifest:** \`${trace.manifestPath}\` (sha256 \`${trace.manifestSha256.slice(0, 12)}…\`)
- **scope:** ${trace.context || 'prospective run capture'}
- **capture status:** ${manifest.skillFiles.filter((file) => file.loadStatus === 'observed').length} observed, ${manifest.skillFiles.filter((file) => file.loadStatus === 'declared').length} declared
- **deterministic overhead:** ${totalMs}ms total (${captureMs}ms capture + ${verificationMs}ms verify), budget ${budgetMs}ms per operation
- **external work added:** 0 model calls, 0 browser calls, 0 network calls

| decision | artifact | governing skill + excerpt | source constraint | evidence | review |
|---|---|---|---|---|---|
${rows.join('\n')}

> \`observed\` means the file was explicitly recorded as loaded before the build. \`declared\` means selected but not proven loaded, and cannot support a \`verified\` decision.
${END_MARKER}`;
}

async function updateReport(reportPath, block) {
  const current = await readFile(reportPath, 'utf8').catch(() => '');
  const expression = new RegExp(`${START_MARKER}[\\s\\S]*?${END_MARKER}`, 'm');
  const next = expression.test(current)
    ? current.replace(expression, block)
    : `${current.trimEnd()}${current.trim() ? '\n\n' : ''}${block}\n`;
  await writeFile(reportPath, next, 'utf8');
}

async function verify(args) {
  const startedAt = process.hrtime.bigint();
  const root = path.resolve(args.root || process.cwd());
  const manifestPath = path.resolve(root, required(args, 'manifest'));
  const tracePath = path.resolve(root, required(args, 'trace'));
  const budgetMs = budgetFrom(args);
  const [manifestRaw, traceRaw] = await Promise.all([
    readFile(manifestPath, 'utf8'),
    readFile(tracePath, 'utf8'),
  ]);
  const manifest = JSON.parse(manifestRaw);
  const trace = JSON.parse(traceRaw);
  const errors = [];

  addError(errors, manifest.schemaVersion === 1, 'manifest: unsupported schemaVersion');
  addError(errors, trace.schemaVersion === 1, 'trace: unsupported schemaVersion');
  addError(errors, trace.manifestSha256 === sha256(manifestRaw), 'trace: manifestSha256 does not match manifest bytes');
  addError(errors, manifest.performance?.withinBudget === true, 'manifest: capture exceeded its performance budget');
  addError(errors, Array.isArray(trace.decisions) && trace.decisions.length > 0, 'trace: at least one decision is required');

  const skillMap = new Map((manifest.skillFiles || []).map((file) => [file.id, file]));
  const sourceMap = new Map((manifest.sourceFiles || []).map((file) => [file.id, file]));
  const contents = new Map();

  for (const file of [...(manifest.skillFiles || []), ...(manifest.sourceFiles || [])]) {
    const absolute = resolvePortable(root, file.path);
    try {
      const bytes = await readFile(absolute);
      addError(errors, sha256(bytes) === file.sha256, `${file.id}: current file hash differs from captured hash`);
      contents.set(file.id, bytes.toString('utf8'));
    } catch (error) {
      errors.push(`${file.id}: could not read ${file.path}: ${error.message}`);
    }
  }

  const seenIds = new Set();
  for (const [index, decision] of (trace.decisions || []).entries()) {
    const label = `decision[${index}]${decision.id ? ` ${decision.id}` : ''}`;
    addError(errors, typeof decision.id === 'string' && decision.id.length > 0, `${label}: id is required`);
    addError(errors, !seenIds.has(decision.id), `${label}: duplicate id`);
    seenIds.add(decision.id);
    addError(errors, typeof decision.decision === 'string' && decision.decision.length > 0, `${label}: decision text is required`);
    addError(errors, REVIEW_STATUSES.has(decision.reviewStatus), `${label}: invalid reviewStatus`);

    const skill = skillMap.get(decision.rule?.fileId);
    addError(errors, Boolean(skill), `${label}: rule.fileId is not in the manifest`);
    if (skill) {
      if (decision.reviewStatus === 'verified') {
        addError(errors, skill.loadStatus === 'observed', `${label}: verified decisions require an observed skill file`);
      }
      verifyExcerpt(errors, `${label} rule`, decision.rule?.excerpt, decision.rule?.excerptSha256, contents.get(skill.id) || '');
    }

    const source = sourceMap.get(decision.sourceConstraint?.sourceId);
    addError(errors, Boolean(source), `${label}: sourceConstraint.sourceId is not in the manifest`);
    if (source) {
      verifyExcerpt(
        errors,
        `${label} source constraint`,
        decision.sourceConstraint?.excerpt,
        decision.sourceConstraint?.excerptSha256,
        contents.get(source.id) || '',
      );
    }

    addError(errors, Boolean(decision.artifact?.path), `${label}: artifact.path is required`);
    if (decision.artifact?.path) {
      addError(errors, await exists(resolvePortable(root, decision.artifact.path)), `${label}: artifact does not exist: ${decision.artifact.path}`);
    }
    if (decision.reviewStatus === 'verified') {
      addError(errors, Array.isArray(decision.evidence) && decision.evidence.length > 0, `${label}: verified decisions require evidence`);
    }
    for (const evidence of decision.evidence || []) {
      addError(errors, Boolean(evidence.path), `${label}: evidence.path is required`);
      if (evidence.path) {
        addError(errors, await exists(resolvePortable(root, evidence.path)), `${label}: evidence does not exist: ${evidence.path}`);
      }
    }
  }

  const measuredMs = elapsedMs(startedAt);
  if (measuredMs > budgetMs) errors.push(`verification exceeded performance budget: ${measuredMs.toFixed(3)}ms > ${budgetMs}ms`);
  const receipt = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    valid: errors.length === 0,
    manifest: portablePath(root, manifestPath),
    trace: portablePath(root, tracePath),
    decisions: trace.decisions?.length || 0,
    errors,
    performance: {
      operation: 'local-trace-verification',
      elapsedMs: Number(measuredMs.toFixed(3)),
      budgetMs,
      withinBudget: measuredMs <= budgetMs,
      networkCalls: 0,
      modelCalls: 0,
      browserCalls: 0,
    },
  };

  if (args.validation) {
    const validationPath = path.resolve(root, args.validation);
    await mkdir(path.dirname(validationPath), { recursive: true });
    await writeFile(validationPath, `${JSON.stringify(receipt, null, 2)}\n`, 'utf8');
  }
  if (errors.length === 0 && args.report) {
    const reportPath = path.resolve(root, args.report);
    await updateReport(reportPath, reportBlock({
      manifest,
      trace,
      reportPath,
      root,
      verificationMs: receipt.performance.elapsedMs,
      budgetMs,
    }));
  }

  if (errors.length > 0) {
    for (const error of errors) console.error(`decision trace error: ${error}`);
    process.exitCode = 1;
    return;
  }
  console.log(`decision trace verified: ${receipt.decisions} decision(s), ${receipt.performance.elapsedMs}ms / ${budgetMs}ms`);
}

async function main() {
  const [command, ...rest] = process.argv.slice(2);
  if (!command || command === '--help' || command === '-h' || rest.includes('--help') || rest.includes('-h')) {
    console.log(usage());
    return;
  }
  const args = parseArgs(rest);
  if (command === 'capture') return capture(args);
  if (command === 'verify') return verify(args);
  throw new Error(`unknown command: ${command}\n\n${usage()}`);
}

main().catch((error) => {
  console.error(`decision trace error: ${error.message}`);
  process.exitCode = 1;
});
