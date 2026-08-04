import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { build } from 'esbuild';

const execFileAsync = promisify(execFile);
const here = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(here, '..');
const repositoryRoot = path.resolve(packageRoot, '..', '..');
const vendorDir = path.join(packageRoot, 'dist', 'vendor');
const appDir = path.join(packageRoot, 'dist', 'app');

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

const appBundle = await build({
  entryPoints: [path.join(packageRoot, 'src', 'app', 'review.ts')],
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: 'es2022',
  minify: true,
  sourcemap: false,
  write: false,
});
const appScript = appBundle.outputFiles[0]?.text;
if (!appScript) throw new Error('MCP App bundle did not produce JavaScript');

const appTemplate = await readFile(path.join(packageRoot, 'src', 'app', 'review.html'), 'utf8');
const appHtml = appTemplate.replace(
  '<!-- ADS_APP_SCRIPT -->',
  `<script>${appScript.replaceAll('</script', '<\\/script')}</script>`,
);
await mkdir(appDir, { recursive: true });
await writeFile(path.join(appDir, 'review.html'), appHtml);
