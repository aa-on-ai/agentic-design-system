import { createServer, type Server } from 'node:http';
import { readFile, realpath, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';
import { isInside, resolveFileInside } from './security.js';

export type MountedComponent = {
  url: string;
  close: () => Promise<void>;
};

const PACKAGE_NODE_MODULES = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'node_modules');

function entrySource(componentPath: string, exportName: string): string {
  return `
import React from 'react';
import { createRoot } from 'react-dom/client';
import * as ComponentModule from ${JSON.stringify(componentPath)};

const Component = ComponentModule[${JSON.stringify(exportName)}];
const errorBox = document.getElementById('mount-error');
if (typeof Component !== 'function' && typeof Component !== 'object') {
  errorBox.hidden = false;
  errorBox.textContent = ${JSON.stringify(`component export not found: ${exportName}`)};
} else {
  try {
    createRoot(document.getElementById('root')).render(React.createElement(Component));
  } catch (error) {
    errorBox.hidden = false;
    errorBox.textContent = 'render error: ' + (error?.stack || error);
  }
}
window.addEventListener('error', (event) => {
  errorBox.hidden = false;
  errorBox.textContent += '\\nwindow error: ' + event.message;
});
`;
}

function htmlShell(bundle: string): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>ADS component capture</title>
    <style>html,body{margin:0}#mount-error{font-family:ui-monospace,monospace;color:#b00020;padding:16px;white-space:pre-wrap}</style>
  </head>
  <body>
    <div id="root"></div>
    <div id="mount-error" role="alert" hidden></div>
    <script>${bundle.replaceAll('</script>', '<\\/script>')}</script>
  </body>
</html>\n`;
}

async function listen(server: Server): Promise<number> {
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        reject(new Error('could not allocate a localhost component port'));
        return;
      }
      resolve(address.port);
    });
  });
}

async function closeServer(server: Server): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
}

export async function mountComponent(
  root: string,
  componentInputPath: string,
  exportName: string,
  outputDirectory: string,
): Promise<MountedComponent> {
  const componentPath = await resolveFileInside(root, componentInputPath);
  const rootReal = await realpath(root);
  const packageNodeModulesReal = await realpath(PACKAGE_NODE_MODULES);
  const result = await esbuild.build({
    stdin: {
      contents: entrySource(componentPath, exportName),
      resolveDir: root,
      loader: 'tsx',
      sourcefile: 'ads-component-entry.tsx',
    },
    absWorkingDir: root,
    bundle: true,
    format: 'iife',
    platform: 'browser',
    jsx: 'automatic',
    target: 'es2020',
    write: false,
    logLevel: 'silent',
    nodePaths: [path.join(root, 'node_modules'), PACKAGE_NODE_MODULES],
    define: { 'process.env.NODE_ENV': '"production"' },
    loader: { '.tsx': 'tsx', '.ts': 'ts', '.jsx': 'jsx', '.js': 'jsx' },
    plugins: [{
      name: 'ads-root-confinement',
      setup(build) {
        build.onLoad({ filter: /.*/, namespace: 'file' }, async (args) => {
          const resolved = await realpath(args.path);
          if (!isInside(rootReal, resolved) && !isInside(packageNodeModulesReal, resolved)) {
            return { errors: [{ text: `component import resolves outside --root: ${args.path}` }] };
          }
          return undefined;
        });
      },
    }],
  });
  const bundle = result.outputFiles[0]?.text;
  if (!bundle) throw new Error('component bundle produced no browser output');

  await mkdir(outputDirectory, { recursive: true });
  const htmlPath = path.join(outputDirectory, 'index.html');
  await writeFile(htmlPath, htmlShell(bundle), 'utf8');
  const html = await readFile(htmlPath);
  const server = createServer((request, response) => {
    if (request.url !== '/' && request.url !== '/index.html') {
      response.writeHead(404).end('not found');
      return;
    }
    response.writeHead(200, {
      'content-type': 'text/html; charset=utf-8',
      'content-length': String(html.byteLength),
      'cache-control': 'no-store',
    });
    response.end(html);
  });
  const port = await listen(server);
  return {
    url: `http://127.0.0.1:${port}/`,
    close: () => closeServer(server),
  };
}
