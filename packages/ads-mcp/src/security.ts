import { createHash } from 'node:crypto';
import { mkdir, realpath, stat } from 'node:fs/promises';
import path from 'node:path';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]', '::1']);
const SENSITIVE_QUERY_KEY = /(?:token|secret|key|password|auth|signature|credential)/i;

export function sha256(value: string | Buffer): string {
  return createHash('sha256').update(value).digest('hex');
}

export function isInside(root: string, candidate: string): boolean {
  const relative = path.relative(root, candidate);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

export function portablePath(root: string, absolute: string): string {
  if (!isInside(root, absolute) || root === absolute) {
    throw new Error(`path must be a file inside the configured root: ${absolute}`);
  }
  return path.relative(root, absolute).split(path.sep).join('/');
}

export async function canonicalRoot(root: string): Promise<string> {
  const absolute = path.resolve(root);
  const resolved = await realpath(absolute);
  const details = await stat(resolved);
  if (!details.isDirectory()) throw new Error(`--root must be a directory: ${root}`);
  return resolved;
}

export async function resolveFileInside(root: string, input: string): Promise<string> {
  const lexical = path.resolve(root, input);
  if (!isInside(root, lexical) || lexical === root) {
    throw new Error(`path escapes the configured root: ${input}`);
  }
  const resolved = await realpath(lexical);
  if (!isInside(root, resolved) || resolved === root) {
    throw new Error(`path resolves outside the configured root: ${input}`);
  }
  const details = await stat(resolved);
  if (!details.isFile()) throw new Error(`expected a file: ${input}`);
  return resolved;
}

export async function ensureDirectoryInside(root: string, input: string): Promise<string> {
  const lexical = path.resolve(root, input);
  if (!isInside(root, lexical) || lexical === root) {
    throw new Error(`directory must be inside the configured root: ${input}`);
  }
  let existingAncestor = lexical;
  while (true) {
    try {
      existingAncestor = await realpath(existingAncestor);
      break;
    } catch (error) {
      if (!(error instanceof Error) || !('code' in error) || error.code !== 'ENOENT') throw error;
      const parent = path.dirname(existingAncestor);
      if (parent === existingAncestor) throw new Error(`could not resolve directory ancestor: ${input}`);
      existingAncestor = parent;
    }
  }
  if (!isInside(root, existingAncestor)) {
    throw new Error(`directory ancestor resolves outside the configured root: ${input}`);
  }
  await mkdir(lexical, { recursive: true });
  const resolved = await realpath(lexical);
  if (!isInside(root, resolved) || resolved === root) {
    throw new Error(`directory resolves outside the configured root: ${input}`);
  }
  return resolved;
}

export function normalizeAllowedOrigin(input: string): string {
  const url = new URL(input);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(`allowed origin must use HTTP(S): ${input}`);
  }
  if (url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error(`allowed origin must contain only scheme, host, and optional port: ${input}`);
  }
  return url.origin;
}

export function validateRenderUrl(input: string, allowedOrigins: Set<string>): URL {
  const url = new URL(input);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('render targets must use HTTP(S)');
  }
  if (url.username || url.password) {
    throw new Error('render target URLs cannot contain embedded credentials');
  }
  if (!LOCAL_HOSTS.has(url.hostname) && !allowedOrigins.has(url.origin)) {
    throw new Error(`origin is not allowed: ${url.origin}`);
  }
  return url;
}

export function redactUrl(input: string): string {
  const url = new URL(input);
  for (const key of [...url.searchParams.keys()]) {
    if (SENSITIVE_QUERY_KEY.test(key)) url.searchParams.set(key, '[REDACTED]');
  }
  return url.toString();
}

export function combineAbortSignals(signal: AbortSignal | undefined, timeoutMs: number): AbortSignal {
  const timeout = AbortSignal.timeout(timeoutMs);
  return signal ? AbortSignal.any([signal, timeout]) : timeout;
}
