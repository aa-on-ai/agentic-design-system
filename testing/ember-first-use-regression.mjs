import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile, mkdtemp } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium, webkit } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { sourcePreflight } from '../skills/ember/scripts/source-preflight.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fixtureRoot = path.join(root, 'testing/fixtures/ember-menu-v1');
const output = process.argv[2] ? path.resolve(process.argv[2]) : await mkdtemp(path.join(os.tmpdir(), 'ember-menu-'));
const phase = process.argv[3] ?? 'all';
assert.ok(['baseline', 'repaired', 'all'].includes(phase));
const sha = value => createHash('sha256').update(value).digest('hex');
const fixtureManifest = JSON.parse(await readFile(path.join(fixtureRoot, 'manifest.json'), 'utf8'));
assert.equal(fixtureManifest.fixture, 'ember-menu-v1');
for (const [file, expected] of Object.entries(fixtureManifest.files)) {
  assert.equal(sha(await readFile(path.join(fixtureRoot, file))), expected, `frozen fixture changed: ${file}`);
}
const viewport = { width: 390, height: 844 };
const scope = {
  version: 1, sourceFiles: ['menu-broken.html'], engines: ['chromium', 'webkit'],
  states: [
    { id: 'default', viewport, visible: ['main'] },
    { id: 'menu-open', viewport, actions: [{ click: '#open-menu' }], visible: ['#menu'] },
  ],
};
await mkdir(output, { recursive: true });
const record = async (where, value) => writeFile(where, JSON.stringify(value, null, 2) + '\n');
const active = page => page.evaluate(() => document.activeElement?.id || document.activeElement?.tagName);

async function snapshot(page, state, engine, directory) {
  const screenshot = `${engine}-${state}-390x844.png`;
  const mountedHtml = `${engine}-${state}-390x844.html`;
  await page.screenshot({ path: path.join(directory, screenshot), fullPage: true });
  const html = await page.content();
  await writeFile(path.join(directory, mountedHtml), html);
  const axe = await new AxeBuilder({ page }).analyze();
  const row = await page.evaluate(() => {
    const visible = node => node.getBoundingClientRect().width > 0 && node.getBoundingClientRect().height > 0 && getComputedStyle(node).visibility !== 'hidden';
    const controls = [...document.querySelectorAll('button, a[href], input')].filter(visible);
    const smallTouchTargets = controls.map(node => {
      const box = node.getBoundingClientRect();
      return { selector: '#' + node.id, width: box.width, height: box.height };
    }).filter(box => box.width < 44 || box.height < 44);
    return {
      horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
      landmarks: Object.fromEntries(['main', 'nav', 'header', 'footer'].map(tag => [tag, Boolean(document.querySelector(tag))])),
      smallTouchTargets, statusRegion: Boolean(document.querySelector('[role="status"]')),
      renderedTextSample: document.body.innerText,
      cumulativeLayoutShift: { supported: false, reason: 'not measured by this interaction regression' },
      textTransforms: [...document.querySelectorAll('*')].filter(visible).filter(node => getComputedStyle(node).textTransform === 'uppercase').length,
    };
  });
  return { engine, state, breakpoint: '390x844', screenshot, mountedHtml, ...row,
    renderSignature: sha(row.renderedTextSample + html),
    axe: { violations: axe.violations, seriousOrCritical: axe.violations.filter(x => ['serious', 'critical'].includes(x.impact)).length },
  };
}

async function checkMenu(page) {
  const initialFocus = await active(page);
  const backgroundInert = await page.locator('#page-shell').evaluate(node => node.inert);
  await page.locator('#close-menu').focus();
  const forwardOrigin = await active(page);
  await page.keyboard.press('Tab');
  const forwardDestination = await active(page);
  await page.locator('#first-link').focus();
  const reverseOrigin = await active(page);
  await page.keyboard.press('Shift+Tab');
  const reverseDestination = await active(page);
  await page.locator('#first-link').focus();
  await page.locator('#background-action').evaluate(node => node.focus());
  const backgroundFocusPrevented = await active(page) === 'first-link';
  const backgroundBox = await page.locator('#background-action').boundingBox();
  await page.mouse.click(backgroundBox.x + backgroundBox.width / 2, backgroundBox.y + backgroundBox.height / 2);
  const backgroundPointerPrevented = await page.evaluate(() => window.backgroundActivations === 0);
  await page.keyboard.press('Escape');
  const escapeDismissed = await page.locator('#layer').isHidden();
  const escapeFocusReturn = await active(page);
  const backgroundRestored = await page.locator('#page-shell').evaluate(node => !node.inert);
  await page.locator('#open-menu').click();
  await page.locator('#close-menu').click();
  const closeDismissed = await page.locator('#layer').isHidden();
  const closeFocusReturn = await active(page);
  const checks = {
    initialFocus: initialFocus === 'first-link', backgroundInert,
    forwardWrap: forwardOrigin === 'close-menu' && forwardDestination === 'first-link',
    reverseWrap: reverseOrigin === 'first-link' && reverseDestination === 'close-menu',
    backgroundFocusPrevented, backgroundPointerPrevented, escapeDismissed,
    escapeFocusReturn: escapeFocusReturn === 'open-menu', backgroundRestored,
    closeDismissed, closeFocusReturn: closeFocusReturn === 'open-menu',
  };
  return { checks, observed: { initialFocus, forwardOrigin, forwardDestination, reverseOrigin, reverseDestination, escapeFocusReturn, closeFocusReturn },
    failures: Object.keys(checks).filter(key => !checks[key]), passed: Object.values(checks).every(Boolean) };
}

if (phase !== 'repaired') {
  const source = await readFile(path.join(fixtureRoot, 'menu-broken.html'), 'utf8');
  const preflight = await sourcePreflight({ sourceRoot: fixtureRoot, scope, url: pathToFileURL(path.join(fixtureRoot, 'menu-broken.html')).href });
  assert.equal(preflight.status, 'capture_ready');
  assert.equal(preflight.rows.length, 4);
  assert.equal(preflight.source.files['menu-broken.html'], sha(source));
  await record(path.join(output, 'preflight-reachable.json'), preflight);
  const portableRoot = await mkdtemp(path.join(os.tmpdir(), 'ember-installed-helper-'));
  const portableHelper = path.join(portableRoot, 'source-preflight.mjs');
  await writeFile(portableHelper, await readFile(path.join(root, 'skills/ember/scripts/source-preflight.mjs')));
  const scopeFile = path.join(portableRoot, 'scope.json');
  await record(scopeFile, scope);
  const portableReceipt = path.join(portableRoot, 'receipt.json');
  execFileSync(process.execPath, [portableHelper, fixtureRoot, scopeFile, pathToFileURL(path.join(fixtureRoot, 'menu-broken.html')).href, portableReceipt], { cwd: root });
  const portable = JSON.parse(await readFile(portableReceipt, 'utf8'));
  assert.equal(portable.status, 'capture_ready', 'installed helper must resolve consumer dependencies');
  await record(path.join(output, 'preflight-installed-helper.json'), portable);
  const mismatch = await sourcePreflight({ sourceRoot: fixtureRoot, scope: { ...scope, expectedRevision: 'missing-revision' }, url: 'http://127.0.0.1:1' });
  assert.equal(mismatch.status, 'version_mismatch');
  assert.equal(mismatch.rows.length, 0, 'version mismatch must stop before route probing');
  await record(path.join(output, 'preflight-version-mismatch.json'), mismatch);
  const missingRoot = await mkdtemp(path.join(os.tmpdir(), 'ember-absent-menu-'));
  const missing = source.replace(/<button id="open-menu"[^>]*>Menu<\/button>/, '').replace(/<script>[\s\S]*?<\/script>/, '');
  await writeFile(path.join(missingRoot, 'menu-broken.html'), missing);
  const unavailable = await sourcePreflight({ sourceRoot: missingRoot, scope, url: pathToFileURL(path.join(missingRoot, 'menu-broken.html')).href });
  assert.equal(unavailable.status, 'scope_gap');
  assert.equal(unavailable.rows.filter(row => row.state === 'default' && row.status === 'reachable').length, 2);
  assert.equal(unavailable.rows.filter(row => row.state === 'menu-open' && row.status === 'unavailable').length, 2);
  await record(path.join(output, 'preflight-menu-unavailable.json'), unavailable);
}

for (const variant of phase === 'all' ? ['baseline', 'repaired'] : [phase]) {
  const directory = path.join(output, variant);
  await mkdir(directory, { recursive: true });
  const filename = variant === 'baseline' ? 'menu-broken.html' : 'menu-repaired.html';
  const sourceBytes = await readFile(path.join(fixtureRoot, filename));
  const url = pathToFileURL(path.join(fixtureRoot, filename)).href;
  const snapshots = [], interactions = [];
  for (const [engine, launcher] of Object.entries({ chromium, webkit })) {
    const browser = await launcher.launch({ headless: true });
    try {
      const context = await browser.newContext({ viewport, isMobile: true, hasTouch: true });
      const page = await context.newPage();
      await page.goto(url);
      snapshots.push(await snapshot(page, 'default', engine, directory));
      await page.locator('#open-menu').click();
      snapshots.push(await snapshot(page, 'menu-open', engine, directory));
      const result = await checkMenu(page);
      if (variant === 'repaired') {
        await page.locator('#open-menu').click();
        // Supplemental CSS-only state proof, separate from the fixture capture above.
        const supplementalStyle = ':focus { outline: 3px solid #285541; outline-offset: 4px; }';
        await page.addStyleTag({ content: supplementalStyle });
        const states = [];
        for (const target of ['first-link', 'close-menu']) {
          await page.locator('#' + target).focus();
          const html = await page.content();
          const text = await page.locator('body').innerText();
          const screenshot = `${engine}-focus-${target}.png`;
          const png = await page.screenshot({ path: path.join(directory, screenshot) });
          states.push({ target, active: await active(page), supplementalStyle, signature: sha(text + html), screenshot, screenshotSha256: sha(png) });
        }
        assert.equal(states[0].signature, states[1].signature);
        assert.notEqual(states[0].screenshotSha256, states[1].screenshotSha256);
        await record(path.join(directory, `${engine}-css-focus-proof.json`), states);
      }
      interactions.push({ engine, ...result });
      if (variant === 'baseline') assert.deepEqual(result.failures.sort(), ['forwardWrap', 'reverseWrap']);
      else assert.deepEqual(result.failures, []);
      await page.close();
      await context.close();
    } finally { await browser.close(); }
  }
  for (const row of snapshots) {
    assert.equal(row.axe.seriousOrCritical, 0);
    assert.equal(row.horizontalOverflow, false);
    assert.equal(row.smallTouchTargets.length, 0);
    assert.equal(row.textTransforms, 0);
  }
  const manifest = { fixture: 'ember-menu-v1', file: filename, sha256: sha(sourceBytes), scope: { ...scope, sourceFiles: [filename] } };
  await record(path.join(directory, 'source-manifest.json'), manifest);
  const manifestHash = sha(await readFile(path.join(directory, 'source-manifest.json')));
  const modal = { schemaVersion: 1, kind: 'ads.modal-interaction-receipt', required: true, requiredDialogs: ['menu'],
    breakpoints: ['390x844'], checks: interactions, passed: interactions.every(row => row.passed),
    failures: interactions.flatMap(row => row.failures.map(check => ({ engine: row.engine, check }))) };
  await record(path.join(directory, 'modal-interaction-receipt.json'), modal);
  const evidence = { evidenceFormat: 2, url, capturedStates: ['default', 'menu-open'], breakpoints: ['390x844'], engines: ['chromium', 'webkit'],
    sourceManifest: 'source-manifest.json', sourceManifestSha256: manifestHash, runContext: 'OUTCOME.md', repairPasses: variant === 'baseline' ? 0 : 1,
    snapshots, gates: { seriousAxeViolations: [], horizontalOverflowAt: [], touchTargetsUnder44: [], landmarkFailures: [], liveRegionFailures: [],
      stateRendered: { default: true, 'menu-open': true }, clsAvailable: false,
      modalInteractions: { required: true, passed: modal.passed, receiptPath: 'modal-interaction-receipt.json', failures: modal.failures } } };
  await record(path.join(directory, 'evidence.json'), evidence);
  await writeFile(path.join(directory, 'OUTCOME.md'), '# Reading room menu test\n\nProfile: utility. Controlled local fixture ember-menu-v1, not the earlier website. Required states: default and menu-open at 390x844 in Chromium and WebKit. Inspect both wrapping directions from inside, initial focus, dismissal, focus return and background isolation. One repair pass maximum. Layout shift is not measured. Source manifest names the exact fixture file and hash.\n');
  await writeFile(path.join(directory, 'run-report.md'), '# Local fixture run\n\n' + (variant === 'baseline' ? 'Baseline before any repair. Both focus-wrap checks failed; other recorded interaction checks passed.' : 'One local repair pass added the missing keyboard boundary handling. Both inside-origin wrapping directions and the other recorded interaction checks passed.') + ' This is a controlled fixture result, not completion of the earlier website menu review.\n');
  console.log(variant + ': ' + interactions.map(row => row.engine + ' failures=' + row.failures.join(',')).join('; '));
}
console.log('Evidence: ' + output);
