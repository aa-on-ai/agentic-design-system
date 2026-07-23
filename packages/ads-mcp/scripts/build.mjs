import { cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const here = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(here, '..');
const repositoryRoot = path.resolve(packageRoot, '..', '..');
const vendorDir = path.join(packageRoot, 'dist', 'vendor');

await rm(path.join(packageRoot, 'dist'), { recursive: true, force: true });
await execFileAsync(
  process.execPath,
  [path.join(packageRoot, 'node_modules', 'typescript', 'bin', 'tsc')],
  { cwd: packageRoot },
);
await mkdir(vendorDir, { recursive: true });
await Promise.all([
  cp(
    path.join(repositoryRoot, 'skills', 'design-review', 'scripts', 'capture.mjs'),
    path.join(vendorDir, 'capture.mjs'),
  ),
  cp(
    path.join(repositoryRoot, 'skills', 'design-review', 'scripts', 'compare.mjs'),
    path.join(vendorDir, 'compare.mjs'),
  ),
  cp(
    path.join(repositoryRoot, 'skills', 'design-review', 'scripts', 'setup-capture.mjs'),
    path.join(vendorDir, 'setup-capture.mjs'),
  ),
]);
