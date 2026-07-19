import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const suiteRoot = path.dirname(fileURLToPath(import.meta.url));
export const repoRoot = path.resolve(suiteRoot, '../../..');
export const suite = JSON.parse(fs.readFileSync(path.join(suiteRoot, 'suite.json'), 'utf8'));

export function isBehaviorPath(relativePath) {
  return suite.behaviorPathPrefixes.some((prefix) => relativePath.startsWith(prefix));
}

export function behaviorFiles(root = repoRoot) {
  const output = execFileSync(
    'git',
    ['ls-files', '--cached', '--others', '--exclude-standard'],
    { cwd: root, encoding: 'utf8' },
  );
  return [...new Set(output.split('\n').filter(Boolean).filter(isBehaviorPath))].sort();
}

export function behaviorDigest(root = repoRoot) {
  const digest = crypto.createHash('sha256');
  const files = behaviorFiles(root);
  for (const relativePath of files) {
    const fileHash = crypto
      .createHash('sha256')
      .update(fs.readFileSync(path.join(root, relativePath)))
      .digest('hex');
    digest.update(relativePath);
    digest.update('\0');
    digest.update(fileHash);
    digest.update('\n');
  }
  return { digest: digest.digest('hex'), files };
}
