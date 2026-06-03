// mount.mjs — turn a generated variant (.tsx) into a capturable route.
//
// Strategy: bundle the variant for the BROWSER with esbuild (one IIFE that client-renders
// it into <div id="root">), write a self-contained index.html, and return a file:// URL.
// capture.mjs then loads it in headless chromium — so React actually renders and axe runs
// on the real DOM, no Next dev server required.
//
// Tolerance is the whole point: arbitrary generated pages import icon/font/chart libs that
// may not resolve. Bundling fails per-variant -> we return { ok:false, reason } so the caller
// records an explicit skip. Nothing is dropped silently, and one bad variant never takes the
// batch down.
//
// We do NOT execute the variant in Node — esbuild only bundles. Execution happens inside the
// browser sandbox during capture.

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, '..', '..');
// Variants are plain React + Tailwind components; we resolve their imports (react, react-dom,
// lucide-react, recharts, …) from the demos app, which already declares them.
const DEMOS_DIR = path.join(REPO_ROOT, 'demos');

async function loadEsbuild() {
  try {
    return (await import('esbuild')).default ?? (await import('esbuild'));
  } catch {
    return null;
  }
}

function htmlShell({ title, bundleJs, tailwind }) {
  // Optional Tailwind: 'cdn' injects the Play CDN (needs network at capture time). Default
  // 'none' keeps the fixture path deterministic and offline — fixtures use inline styles.
  const tw = tailwind === 'cdn' ? '<script src="https://cdn.tailwindcss.com"></script>' : '';
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    ${tw}
    <style>html,body{margin:0}#mount-error{font-family:ui-monospace,monospace;color:#b00;padding:16px;white-space:pre-wrap}</style>
  </head>
  <body>
    <div id="root"></div>
    <div id="mount-error" hidden></div>
    <script>${bundleJs}</script>
  </body>
</html>
`;
}

// Entry that imports the variant by absolute path and client-renders it. A render-time throw
// is surfaced into #mount-error (visible in the screenshot + readable by capture) rather than
// a blank page, so a runtime failure is still an explicit, visible receipt.
function entrySource(variantAbsPath) {
  // esbuild resolves filesystem paths, not file:// URLs — import the variant by absolute path.
  return `
import React from 'react';
import { createRoot } from 'react-dom/client';
import Variant from ${JSON.stringify(variantAbsPath)};

const root = document.getElementById('root');
try {
  createRoot(root).render(React.createElement(Variant));
} catch (err) {
  const box = document.getElementById('mount-error');
  box.hidden = false;
  box.textContent = 'render error: ' + (err && err.stack || err);
}
window.addEventListener('error', (e) => {
  const box = document.getElementById('mount-error');
  box.hidden = false;
  box.textContent = (box.textContent ? box.textContent + '\\n' : '') + 'window error: ' + e.message;
});
`;
}

/**
 * Bundle + write one variant to an HTML page.
 * @returns {Promise<{ok:true, htmlPath:string, url:string} | {ok:false, reason:string, stage:string}>}
 */
export async function mountVariant({ src, outDir, title = 'variant', tailwind = 'none' }) {
  const esbuild = await loadEsbuild();
  if (!esbuild) {
    return {
      ok: false,
      stage: 'deps',
      reason: 'esbuild not installed. Run: npm i -D esbuild (and playwright for capture).',
    };
  }

  const variantAbsPath = path.resolve(src);
  try {
    await fs.access(variantAbsPath);
  } catch {
    return { ok: false, stage: 'read', reason: `variant source not found: ${src}` };
  }

  let bundleJs;
  try {
    const result = await esbuild.build({
      stdin: {
        contents: entrySource(variantAbsPath),
        resolveDir: DEMOS_DIR, // resolve react/lucide/recharts from demos/node_modules
        loader: 'tsx',
        sourcefile: 'entry.tsx',
      },
      bundle: true,
      format: 'iife',
      platform: 'browser',
      jsx: 'automatic',
      // Variants live outside demos/, so their bare imports (react, lucide-react, recharts…)
      // resolve via nodePaths → demos/node_modules, not by walking up from the variant.
      nodePaths: [path.join(DEMOS_DIR, 'node_modules'), path.join(REPO_ROOT, 'node_modules')],
      target: 'es2020',
      write: false,
      logLevel: 'silent',
      define: { 'process.env.NODE_ENV': '"production"' },
      loader: { '.tsx': 'tsx', '.ts': 'ts', '.jsx': 'jsx', '.js': 'jsx' },
    });
    bundleJs = result.outputFiles[0].text;
  } catch (err) {
    // The common, expected failure: an unresolved import (icon/font/chart lib not installed).
    const messages = (err && err.errors) || [];
    const detail = messages.length
      ? messages.map((m) => m.text).join('; ')
      : String(err && err.message ? err.message : err);
    return { ok: false, stage: 'bundle', reason: `bundle failed: ${detail}` };
  }

  await fs.mkdir(outDir, { recursive: true });
  const htmlPath = path.join(outDir, 'index.html');
  await fs.writeFile(htmlPath, htmlShell({ title, bundleJs, tailwind }), 'utf8');

  return { ok: true, htmlPath, url: pathToFileURL(htmlPath).href };
}
