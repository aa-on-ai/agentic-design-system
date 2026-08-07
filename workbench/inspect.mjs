#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { lstat, readdir, readFile, realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const SCHEMA_ID = 'https://github.com/aa-on-ai/agentic-design-system/schemas/workbench-session.v1.schema.json';
const INSPECTOR_VERSION = '0.1.0';
const MAX_DEPTH = 4;
const MAX_SOURCES = 64;
const MAX_SOURCE_BYTES = 256 * 1024;
const MAX_TOTAL_BYTES = 2 * 1024 * 1024;
const IGNORED_DIRS = new Set([
  '.git', '.next', '.nuxt', '.output', '.svelte-kit', '.turbo', '.vercel',
  'build', 'coverage', 'dist', 'node_modules', 'out', 'target',
]);
const DISCOVERY_DIRS = new Set([
  'app', 'assets', 'components', 'design', 'docs', 'public', 'screenshots', 'src', 'styles',
]);
const INCLUDE_EXTENSIONS = new Set([
  '.css', '.gif', '.html', '.jpeg', '.jpg', '.js', '.json', '.jsx', '.md', '.mdx',
  '.png', '.scss', '.svg', '.ts', '.tsx', '.webp', '.yaml', '.yml',
]);
const CLAIM_ORDER = ['name', 'description', 'audience', 'surface'];

function fail(message) {
  process.stderr.write(`workbench inspector: ${message}\n`);
  process.exitCode = 1;
}

function parseArgs(argv) {
  let project;
  const includes = [];
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--project') {
      if (project !== undefined || !argv[index + 1]) throw new Error('--project requires exactly one value');
      project = argv[++index];
    } else if (arg === '--include') {
      if (!argv[index + 1]) throw new Error('--include requires a project-relative path');
      includes.push(argv[++index]);
    } else {
      throw new Error(`unknown argument: ${arg}`);
    }
  }
  if (!project) throw new Error('--project is required');
  if (!path.isAbsolute(project)) throw new Error('--project must be an absolute path');
  return { project, includes };
}

function sha256(content) {
  return createHash('sha256').update(content).digest('hex');
}

function isWithin(root, candidate) {
  const relative = path.relative(root, candidate);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

function portablePath(root, absolutePath) {
  return path.relative(root, absolutePath).split(path.sep).join('/');
}

function validateInclude(value, root) {
  if (path.isAbsolute(value)) throw new Error(`--include must be project-relative: ${value}`);
  const normalized = path.normalize(value);
  if (normalized === '.' || normalized === '' || normalized.split(path.sep).includes('..')) {
    throw new Error(`unsafe --include path: ${value}`);
  }
  const absolute = path.resolve(root, normalized);
  if (!isWithin(root, absolute)) throw new Error(`--include escapes the project root: ${value}`);
  return absolute;
}

function isRootContextFile(relativePath) {
  if (relativePath.includes('/')) return false;
  return /^(?:readme(?:\.[^.]+)?|package\.json|design\.md|agents\.md|claude\.md|guidelines\.md)$/i.test(relativePath);
}

function classifySource(relativePath, explicitlyIncluded = false) {
  const base = path.posix.basename(relativePath).toLowerCase();
  const extension = path.posix.extname(base);
  const segments = relativePath.toLowerCase().split('/');
  if (/^design\.md$/.test(base)) return 'project-identity';
  if (/^(?:guidelines|contributing)\.md$/.test(base)) return 'design-guidelines';
  if (/^(?:agents|claude)\.md$/.test(base)) return 'agent-instructions';
  if (base === 'package.json') return 'package-manifest';
  if (/^readme(?:\.[^.]+)?$/.test(base)) return 'product-doc';
  if (/decision|run-report/.test(base)) return 'prior-decision';
  if (/token|theme|variables/.test(base)) return 'design-tokens';
  if (segments.includes('components') && /\.(?:js|jsx|ts|tsx)$/.test(extension)) return 'component';
  if (segments.includes('screenshots') && /\.(?:gif|jpe?g|png|webp)$/.test(extension)) return 'screenshot';
  if (/\.(?:css|scss)$/.test(extension)) return 'design-tokens';
  if (/\.(?:md|mdx|json|ya?ml)$/.test(extension)) return 'product-doc';
  if (explicitlyIncluded && /\.(?:html|js|jsx|ts|tsx)$/.test(extension)) return 'component';
  return null;
}

function isDiscoverable(relativePath) {
  if (isRootContextFile(relativePath)) return true;
  const lower = relativePath.toLowerCase();
  const base = path.posix.basename(lower);
  const segments = lower.split('/');
  if (/^(?:design|guidelines|brand|product|readme)(?:\.[^.]+)?\.(?:md|mdx)$/.test(base)) return true;
  if (/token|theme|variables/.test(base) && /\.(?:css|json|scss|ts|js)$/.test(base)) return true;
  if (segments.includes('components') && /\.(?:js|jsx|ts|tsx)$/.test(base)) return true;
  if (segments.includes('screenshots') && /\.(?:gif|jpe?g|png|webp)$/.test(base)) return true;
  return false;
}

async function collectDefaultPaths(root) {
  const found = [];
  const notices = [];

  async function walk(directory, depth) {
    if (depth > MAX_DEPTH) return;
    let entries;
    try {
      entries = (await readdir(directory, { withFileTypes: true }))
        .sort((left, right) => left.name.localeCompare(right.name, 'en'));
    } catch (error) {
      if (depth === 0) throw error;
      notices.push({
        severity: 'warning',
        code: 'source-unreadable',
        path: portablePath(root, directory),
        message: 'Skipped a directory that could not be read.',
      });
      return;
    }
    for (const entry of entries) {
      const absolute = path.join(directory, entry.name);
      const relative = portablePath(root, absolute);
      if (entry.isSymbolicLink()) {
        const target = await realpath(absolute).catch(() => null);
        if (!target || !isWithin(root, target)) {
          notices.push({
            severity: 'warning',
            code: 'external-symlink-skipped',
            path: relative,
            message: 'Skipped a symbolic link whose target is outside the project root or unreadable.',
          });
        }
        continue;
      }
      if (entry.isDirectory()) {
        if (IGNORED_DIRS.has(entry.name.toLowerCase())) continue;
        if (depth === 0 ? DISCOVERY_DIRS.has(entry.name.toLowerCase()) : true) {
          await walk(absolute, depth + 1);
        }
      } else if (entry.isFile() && isDiscoverable(relative)) {
        found.push({ absolute, explicitlyIncluded: false });
      }
    }
  }

  await walk(root, 0);
  return { found, notices };
}

async function collectIncludePaths(root, includePath) {
  const found = [];
  const rootRelative = portablePath(root, includePath);
  const info = await lstat(includePath).catch(() => null);
  if (!info) throw new Error(`--include does not exist: ${rootRelative}`);
  if (info.isSymbolicLink()) throw new Error(`--include may not be a symbolic link: ${rootRelative}`);

  async function walk(absolute, depth) {
    if (depth > MAX_DEPTH) return;
    const current = await lstat(absolute);
    if (current.isSymbolicLink()) return;
    if (current.isFile()) {
      const extension = path.extname(absolute).toLowerCase();
      if (!INCLUDE_EXTENSIONS.has(extension)) throw new Error(`unsupported --include file type: ${portablePath(root, absolute)}`);
      found.push({ absolute, explicitlyIncluded: true });
      return;
    }
    if (!current.isDirectory()) throw new Error(`--include is not a regular file or directory: ${portablePath(root, absolute)}`);
    const entries = (await readdir(absolute, { withFileTypes: true }))
      .sort((left, right) => left.name.localeCompare(right.name, 'en'));
    for (const entry of entries) {
      if (IGNORED_DIRS.has(entry.name.toLowerCase()) || entry.isSymbolicLink()) continue;
      await walk(path.join(absolute, entry.name), depth + 1);
    }
  }

  await walk(includePath, 0);
  return found;
}

async function readSources(root, candidates) {
  const unique = new Map();
  for (const candidate of candidates) {
    const relative = portablePath(root, candidate.absolute);
    const previous = unique.get(relative);
    unique.set(relative, {
      absolute: candidate.absolute,
      explicitlyIncluded: Boolean(candidate.explicitlyIncluded || previous?.explicitlyIncluded),
    });
  }

  const sources = [];
  const notices = [];
  let totalBytes = 0;
  for (const [relative, candidate] of [...unique.entries()].sort(([left], [right]) => left.localeCompare(right, 'en'))) {
    if (sources.length >= MAX_SOURCES) {
      notices.push({ severity: 'warning', code: 'source-too-large', message: `Inspection stopped after the ${MAX_SOURCES}-source budget.` });
      break;
    }
    let info;
    try {
      info = await lstat(candidate.absolute);
    } catch {
      notices.push({ severity: 'warning', code: 'source-unreadable', message: 'Skipped a source that could not be inspected.', path: relative });
      continue;
    }
    if (!info.isFile() || info.isSymbolicLink()) continue;
    if (info.size > MAX_SOURCE_BYTES) {
      notices.push({ severity: 'warning', code: 'source-too-large', message: `Skipped a source larger than ${MAX_SOURCE_BYTES} bytes.`, path: relative });
      continue;
    }
    if (totalBytes + info.size > MAX_TOTAL_BYTES) {
      notices.push({ severity: 'warning', code: 'source-too-large', message: `Inspection stopped at the ${MAX_TOTAL_BYTES}-byte source budget.` });
      break;
    }
    let content;
    try {
      content = await readFile(candidate.absolute);
    } catch {
      notices.push({ severity: 'warning', code: 'source-unreadable', message: 'Skipped a source that could not be read.', path: relative });
      continue;
    }
    totalBytes += content.byteLength;
    sources.push({
      path: relative,
      kind: classifySource(relative, candidate.explicitlyIncluded) ?? 'product-doc',
      contentSha256: sha256(content),
      bytes: content.byteLength,
      text: content.toString('utf8'),
    });
  }
  return { sources, notices };
}

function cleanValue(value) {
  return value.replace(/[*_`]/g, '').replace(/\s+/g, ' ').trim();
}

function normalizedValue(value) {
  return cleanValue(value).toLocaleLowerCase('en-US').replace(/[.!?]+$/, '');
}

function humanizePackageName(value) {
  return value.replace(/^@[^/]+\//, '').replace(/[-_]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function extractCandidates(source) {
  const extracted = [];
  const isRootSource = !source.path.includes('/');
  const add = (claim, value, direct, statement, line) => {
    const cleaned = cleanValue(String(value ?? ''));
    if (cleaned) extracted.push({
      claim,
      value: cleaned,
      direct,
      reason: {
        code: direct ? `declared-${claim}` : `observed-${claim}`,
        statement,
        evidence: [{ source: source.path, locator: line ? { type: 'lines', start: line, end: line } : { type: 'file' } }],
      },
    });
  };

  if (source.kind === 'package-manifest') {
    try {
      const manifest = JSON.parse(source.text);
      if (typeof manifest.displayName === 'string') add('name', manifest.displayName, true, 'package.json declares displayName.');
      else if (typeof manifest.name === 'string') add('name', humanizePackageName(manifest.name), true, 'package.json declares the project name.');
      if (typeof manifest.description === 'string') add('description', manifest.description, true, 'package.json declares the project description.');
    } catch {
      return {
        extracted,
        notice: {
          severity: 'warning',
          code: 'identity-parse-failed',
          message: 'package.json could not be parsed for project identity.',
          path: source.path,
        },
      };
    }
  }

  if (source.kind === 'project-identity' || (isRootSource && source.kind === 'product-doc')) {
    const lines = source.text.split(/\r?\n/);
    const labels = {
      name: 'name',
      'product name': 'name',
      description: 'description',
      product: 'description',
      summary: 'description',
      audience: 'audience',
      users: 'audience',
      surface: 'surface',
      'product surface': 'surface',
    };
    for (const [index, line] of lines.entries()) {
      const match = line.match(/^\s*(?:[-*]\s+)?(?:\*\*)?([a-z ]+?)(?:\*\*)?\s*:\s*(.+?)\s*$/i);
      if (!match) continue;
      const label = match[1].trim().toLowerCase();
      const claim = labels[label];
      if (claim) add(claim, match[2], true, `${source.path} declares ${label}.`, index + 1);
    }
    const headingIndex = lines.findIndex((line) => /^#\s+\S/.test(line));
    if (headingIndex >= 0) add('name', lines[headingIndex].replace(/^#\s+/, ''), true, `${source.path} declares its title.`, headingIndex + 1);

    const hasDescription = extracted.some((candidate) => candidate.claim === 'description' && candidate.reason.evidence[0].source === source.path);
    if (!hasDescription && source.kind === 'product-doc' && /^readme/i.test(path.posix.basename(source.path))) {
      const paragraphIndex = lines.findIndex((line) => {
        const trimmed = line.trim();
        return trimmed && !/^(?:#|[-*]\s|```|<|\[!)/.test(trimmed) && trimmed.length >= 24;
      });
      if (paragraphIndex >= 0) add('description', lines[paragraphIndex], false, `${source.path} provides the first descriptive paragraph.`, paragraphIndex + 1);
    }
  }
  return { extracted };
}

function questionId(claim, state) {
  return `${state === 'conflicted' ? 'resolve' : 'provide'}-${claim}`;
}

function evidenceFromReasons(reasons) {
  return [...new Map(reasons.flatMap((reason) => reason.evidence).map((evidence) => [JSON.stringify(evidence), evidence])).values()];
}

function makeQuestion(claim, inference) {
  const labels = { name: 'project name', description: 'product description', audience: 'primary audience', surface: 'product surface', preset: 'project posture' };
  const question = {
    id: questionId(claim, inference.state),
    blocks: claim === 'preset' ? 'preset-recommendation' : 'project-identity',
    prompt: inference.state === 'conflicted'
      ? `Which ${labels[claim]} should the Workbench use?`
      : `What is the ${labels[claim]}?`,
  };
  if (inference.state === 'conflicted') {
    question.options = inference.candidates.map((candidate) => ({
      value: candidate.value,
      label: candidate.value,
      evidence: evidenceFromReasons(candidate.reasons),
    }));
  }
  return question;
}

function candidateQuality(candidate) {
  const sources = new Set(candidate.reasons.flatMap((reason) => reason.evidence.map((evidence) => evidence.source)));
  return sources.size > 1 ? 'cross-source' : candidate.direct ? 'direct-declaration' : 'single-signal';
}

function unknownInference(claim, inspectedKinds) {
  return {
    state: 'unknown',
    value: null,
    reason: `No inspected source made a supported ${claim} declaration.`,
    inspectedKinds,
  };
}

function inferClaim(claim, candidates, inspectedKinds) {
  const claimCandidates = candidates.filter((candidate) => candidate.claim === claim);
  const directCandidates = claimCandidates.filter((candidate) => candidate.direct);
  const preferred = directCandidates.length > 0 ? directCandidates : claimCandidates;
  const grouped = new Map();
  for (const candidate of preferred) {
    const key = normalizedValue(candidate.value);
    const existing = grouped.get(key);
    if (existing) {
      existing.reasons.push(candidate.reason);
      existing.direct ||= candidate.direct;
    } else grouped.set(key, { value: candidate.value, direct: candidate.direct, reasons: [candidate.reason] });
  }
  const values = [...grouped.values()]
    .map((candidate) => ({
      ...candidate,
      reasons: candidate.reasons.sort((left, right) => left.evidence[0].source.localeCompare(right.evidence[0].source, 'en')),
    }))
    .sort((left, right) => normalizedValue(left.value).localeCompare(normalizedValue(right.value), 'en'));
  if (values.length === 0) return unknownInference(claim, inspectedKinds);
  if (values.length > 1) return {
    state: 'conflicted',
    value: null,
    candidates: values.map((candidate) => ({
      value: candidate.value,
      evidenceQuality: candidateQuality(candidate),
      reasons: candidate.reasons,
    })),
    questionId: questionId(claim, 'conflicted'),
  };
  return {
    state: 'inferred',
    value: values[0].value,
    evidenceQuality: candidateQuality(values[0]),
    reasons: values[0].reasons,
  };
}

function presetMatches(text) {
  const lower = text.toLowerCase();
  const matches = [];
  if (/\b(?:landing|marketing|editorial|storytelling|brand|campaign|case stud(?:y|ies)|launch page)\b/.test(lower)) matches.push('marketing-editorial');
  if (/\b(?:dashboard|analytics|monitoring|finance|metrics|comparison-heavy|data-heavy)\b/.test(lower)) matches.push('dense-dashboard');
  if (/\b(?:settings|admin|internal tool|operational interface|product workflow|utility ui)\b/.test(lower)) matches.push('utilitarian-app');
  return matches;
}

function inferPreset(surfaceClaim, inspectedKinds) {
  if (surfaceClaim.state === 'unknown') return unknownInference('preset', inspectedKinds);
  const sourceCandidates = surfaceClaim.state === 'conflicted'
    ? surfaceClaim.candidates
    : [{ value: surfaceClaim.value, evidenceQuality: surfaceClaim.evidenceQuality, reasons: surfaceClaim.reasons }];
  const grouped = new Map();
  for (const candidate of sourceCandidates) {
    for (const preset of presetMatches(candidate.value)) {
      const existing = grouped.get(preset);
      if (existing) {
        existing.reasons.push(...candidate.reasons);
        if (candidate.evidenceQuality === 'cross-source') existing.evidenceQuality = 'cross-source';
      } else grouped.set(preset, { value: preset, evidenceQuality: candidate.evidenceQuality, reasons: [...candidate.reasons] });
    }
  }
  const matches = [...grouped.values()]
    .map((candidate) => ({
      ...candidate,
      reasons: [...new Map(candidate.reasons.map((reason) => [JSON.stringify(reason), reason])).values()]
        .sort((left, right) => left.evidence[0].source.localeCompare(right.evidence[0].source, 'en')),
    }))
    .sort((left, right) => left.value.localeCompare(right.value, 'en'));
  if (matches.length === 0) return unknownInference('preset', inspectedKinds);
  if (matches.length > 1) return { state: 'conflicted', value: null, candidates: matches, questionId: questionId('preset', 'conflicted') };
  return {
    state: 'inferred',
    value: matches[0].value,
    evidenceQuality: matches[0].evidenceQuality,
    reasons: matches[0].reasons,
  };
}

function publicSource(source) {
  const { text, ...record } = source;
  return record;
}

async function inspect(projectArg, includeArgs) {
  const canonicalRoot = await realpath(projectArg).catch(() => null);
  if (!canonicalRoot) throw new Error(`project path does not exist: ${projectArg}`);
  const rootInfo = await stat(canonicalRoot);
  if (!rootInfo.isDirectory()) throw new Error(`project path is not a directory: ${projectArg}`);

  const includes = includeArgs.map((include) => validateInclude(include, canonicalRoot));
  const defaultDiscovery = await collectDefaultPaths(canonicalRoot);
  const includedCandidates = [];
  for (const include of includes) includedCandidates.push(...await collectIncludePaths(canonicalRoot, include));
  const { sources, notices: readNotices } = await readSources(canonicalRoot, [...defaultDiscovery.found, ...includedCandidates]);

  const candidates = [];
  const notices = [...defaultDiscovery.notices, ...readNotices];
  for (const source of sources) {
    const extracted = extractCandidates(source);
    candidates.push(...extracted.extracted);
    if (extracted.notice) notices.push(extracted.notice);
  }
  const inspectedKinds = [...new Set(sources.map((source) => source.kind))].sort((left, right) => left.localeCompare(right, 'en'));
  const claims = Object.fromEntries(CLAIM_ORDER.map((claim) => [claim, inferClaim(claim, candidates, inspectedKinds)]));
  const preset = inferPreset(claims.surface, inspectedKinds);
  const allInferences = [...CLAIM_ORDER.map((claim) => [claim, claims[claim]]), ['preset', preset]];
  const questions = allInferences
    .filter(([, inference]) => inference.state !== 'inferred')
    .map(([claim, inference]) => makeQuestion(claim, inference));
  const status = allInferences.some(([, inference]) => inference.state === 'conflicted')
    ? 'blocked'
    : allInferences.some(([, inference]) => inference.state === 'unknown') ? 'needs-human' : 'ready';
  const sourceRecords = sources.map(publicSource);
  const sourceFingerprint = sha256(JSON.stringify(sourceRecords.map(({ path: sourcePath, kind, contentSha256, bytes }) => ({ path: sourcePath, kind, contentSha256, bytes }))));

  return {
    $schema: SCHEMA_ID,
    schemaVersion: 1,
    kind: 'ads.workbench.session',
    inspector: { version: INSPECTOR_VERSION, mode: 'read-only', sourceFingerprint },
    project: { root: canonicalRoot, rootLabel: path.basename(canonicalRoot) },
    intake: {
      status,
      sources: sourceRecords,
      claims,
      preset,
      questions,
      notices: notices.sort((left, right) => `${left.code}\0${left.path ?? ''}`.localeCompare(`${right.code}\0${right.path ?? ''}`, 'en')),
    },
  };
}

try {
  const { project, includes } = parseArgs(process.argv.slice(2));
  const session = await inspect(project, includes);
  process.stdout.write(`${JSON.stringify(session, null, 2)}\n`);
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}
