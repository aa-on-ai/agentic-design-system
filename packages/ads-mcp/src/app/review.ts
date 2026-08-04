type JsonRpcId = string | number;

type JsonRpcMessage = {
  jsonrpc: '2.0';
  id?: JsonRpcId;
  method?: string;
  params?: unknown;
  result?: unknown;
  error?: { code?: number; message?: string };
};

type HostContext = {
  theme?: 'light' | 'dark';
  availableDisplayModes?: string[];
  styles?: {
    variables?: Record<string, string | undefined>;
    css?: { fonts?: string };
  };
  containerDimensions?: {
    width?: number;
    maxWidth?: number;
    height?: number;
    maxHeight?: number;
  };
};

type UiInitializeResult = {
  protocolVersion: string;
  hostCapabilities?: {
    serverTools?: Record<string, unknown>;
    serverResources?: Record<string, unknown>;
  };
  hostContext?: HostContext;
};

type ToolResult = {
  structuredContent?: unknown;
};

type ResourceContent = {
  uri?: string;
  mimeType?: string;
  blob?: string;
  text?: string;
};

type ResourceReadResult = {
  contents?: ResourceContent[];
};

type PendingRequest = {
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
};

const APP_PROTOCOL_VERSION = '2026-01-26';
const DEFAULT_RUBRIC = {
  task: 'Review the rendered interface against the Agentic Design System quality bar.',
  criteria: [
    { name: 'Design Quality', weight: 35 },
    { name: 'Originality', weight: 30 },
    { name: 'Craft', weight: 20 },
    { name: 'Functionality', weight: 15 },
  ],
};

class McpAppBridge {
  private nextId = 1;
  private readonly pending = new Map<JsonRpcId, PendingRequest>();
  private hostCapabilities: UiInitializeResult['hostCapabilities'];
  onToolResult?: (result: ToolResult) => void;
  onToolCancelled?: (reason: string) => void;
  onHostContext?: (context: HostContext) => void;
  onTeardown?: () => void;

  constructor() {
    window.addEventListener('message', (event) => this.handleMessage(event));
  }

  async connect(): Promise<void> {
    const initialized = await this.request('ui/initialize', {
      clientInfo: { name: 'ADS evidence review', version: '0.1.0' },
      appCapabilities: { availableDisplayModes: ['inline', 'fullscreen'] },
      protocolVersion: APP_PROTOCOL_VERSION,
    }) as UiInitializeResult;
    this.hostCapabilities = initialized.hostCapabilities;
    this.onHostContext?.(initialized.hostContext || {});
    this.notify('ui/notifications/initialized');
  }

  canCallTools(): boolean {
    return Boolean(this.hostCapabilities?.serverTools);
  }

  canReadResources(): boolean {
    return Boolean(this.hostCapabilities?.serverResources);
  }

  callTool(name: string, args: Record<string, unknown>): Promise<ToolResult> {
    return this.request('tools/call', { name, arguments: args }) as Promise<ToolResult>;
  }

  readResource(uri: string): Promise<ResourceReadResult> {
    return this.request('resources/read', { uri }) as Promise<ResourceReadResult>;
  }

  updateModelContext(runId: string, nextRevisionPrompt: string): Promise<unknown> {
    return this.request('ui/update-model-context', {
      content: [{ type: 'text', text: nextRevisionPrompt }],
      structuredContent: { runId, nextRevisionPrompt },
    });
  }

  reportSize(width: number, height: number): void {
    this.notify('ui/notifications/size-changed', { width, height });
  }

  private request(method: string, params: unknown): Promise<unknown> {
    const id = this.nextId++;
    window.parent.postMessage({ jsonrpc: '2.0', id, method, params }, '*');
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
    });
  }

  private notify(method: string, params?: unknown): void {
    window.parent.postMessage({ jsonrpc: '2.0', method, ...(params === undefined ? {} : { params }) }, '*');
  }

  private handleMessage(event: MessageEvent): void {
    if (event.source !== window.parent || !isRecord(event.data) || event.data.jsonrpc !== '2.0') return;
    const message = event.data as JsonRpcMessage;
    if (message.id !== undefined && !message.method) {
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      if (message.error) pending.reject(new Error(message.error.message || 'MCP App request failed'));
      else pending.resolve(message.result);
      return;
    }
    if (message.id !== undefined && message.method === 'ping') {
      window.parent.postMessage({ jsonrpc: '2.0', id: message.id, result: {} }, '*');
      return;
    }
    if (message.id !== undefined && message.method === 'ui/resource-teardown') {
      this.onTeardown?.();
      window.parent.postMessage({ jsonrpc: '2.0', id: message.id, result: {} }, '*');
      return;
    }
    if (message.method === 'ui/notifications/tool-result' && isRecord(message.params)) {
      this.onToolResult?.(message.params as ToolResult);
    }
    if (message.method === 'ui/notifications/tool-cancelled' && isRecord(message.params)) {
      this.onToolCancelled?.(stringValue(message.params.reason) || 'The host cancelled the tool call.');
    }
    if (message.method === 'ui/notifications/host-context-changed' && isRecord(message.params)) {
      this.onHostContext?.(message.params as HostContext);
    }
  }
}

const app = requiredElement<HTMLElement>('app');
const statusPill = requiredElement<HTMLElement>('status-pill');
const eyebrow = requiredElement<HTMLElement>('eyebrow');
const runTitle = requiredElement<HTMLElement>('run-title');
const lede = requiredElement<HTMLElement>('lede');
const runIdElement = requiredElement<HTMLElement>('run-id');
const runDetail = requiredElement<HTMLElement>('run-detail');
const liveStatus = requiredElement<HTMLElement>('live-status');
const screenshots = requiredElement<HTMLElement>('screenshots');
const visualEmpty = requiredElement<HTMLElement>('visual-empty');
const visualCount = requiredElement<HTMLElement>('visual-count');
const summaryCount = requiredElement<HTMLElement>('summary-count');
const summaryList = requiredElement<HTMLUListElement>('summary-list');
const findingsPanel = requiredElement<HTMLElement>('findings-panel');
const findingsList = requiredElement<HTMLUListElement>('findings-list');
const findingsCount = requiredElement<HTMLElement>('findings-count');
const blockersPanel = requiredElement<HTMLElement>('blockers-panel');
const blockersList = requiredElement<HTMLUListElement>('blockers-list');
const blockersCount = requiredElement<HTMLElement>('blockers-count');
const nextAction = requiredElement<HTMLElement>('next-action');
const nextCopy = requiredElement<HTMLElement>('next-copy');
const primaryAction = requiredElement<HTMLButtonElement>('primary-action');

const bridge = new McpAppBridge();
let activeOutput: Record<string, unknown> | undefined;
let currentHostContext: HostContext = {};
let resizeObserver: ResizeObserver | undefined;
const screenshotUrisByRun = new Map<string, string[]>();

bridge.onHostContext = applyHostContext;
bridge.onTeardown = () => resizeObserver?.disconnect();
bridge.onToolCancelled = renderCancelled;
bridge.onToolResult = (result) => {
  void renderToolResult(result);
};

primaryAction.addEventListener('click', () => {
  void runPrimaryAction();
});

bridge.connect()
  .then(startAutoResize)
  .catch((error) => {
    renderError(error instanceof Error ? error.message : String(error));
  });

async function renderToolResult(result: ToolResult): Promise<void> {
  if (!isRecord(result.structuredContent)) {
    renderError('The host forwarded a result without structured ADS data.');
    return;
  }
  activeOutput = result.structuredContent;
  const runId = stringValue(activeOutput.runId) || 'unknown';
  runIdElement.textContent = runId;
  resetOptionalPanels();

  if (Array.isArray(activeOutput.capturedStates)) {
    await renderRun(activeOutput, runId);
    return;
  }
  if (Array.isArray(activeOutput.findings)) {
    await renderEvaluation(activeOutput, runId);
    return;
  }
  if (typeof activeOutput.valid === 'boolean') {
    await renderTrace(activeOutput, runId);
    return;
  }
  renderError('The result did not match an ADS render, evaluation, or trace response.');
}

async function renderRun(output: Record<string, unknown>, runId: string): Promise<void> {
  const status = stringValue(output.status) || 'unknown';
  const blockers = stringArray(output.blockers);
  const capturedStates = stringArray(output.capturedStates);
  const viewports = stringArray(output.viewports);
  const artifactUris = isRecord(output.artifacts) ? stringArray(output.artifacts.screenshots) : [];
  screenshotUrisByRun.set(runId, artifactUris);
  const gateEntries = compactEntries(output.gates);

  setPageState(status === 'blocked' ? 'blocked' : 'complete', status === 'blocked' ? 'Blocked run' : 'Render complete');
  eyebrow.textContent = 'Rendered interface evidence';
  runTitle.textContent = status === 'blocked' ? 'This run stopped honestly' : 'The interface is rendered';
  lede.textContent = status === 'blocked'
    ? 'ADS preserved the partial run and surfaced the condition that prevented trustworthy evidence.'
    : 'The requested states and viewports produced inspectable evidence and deterministic gate results.';
  runDetail.textContent = `${capturedStates.length} states · ${viewports.length} viewports`;
  renderMetrics([
    ['Status', status],
    ['States', capturedStates.join(', ') || 'none'],
    ['Viewports', viewports.join(', ') || 'none'],
    ...gateEntries.slice(0, 8),
  ]);
  renderBlockers(blockers);
  await renderScreenshots(artifactUris, runId);

  if (status === 'complete') {
    showPrimaryAction(
      'Evaluate this evidence',
      'Apply the ADS rubric and return a typed human-review state without inventing a visual verdict.',
      'Evaluate run',
      bridge.canCallTools(),
    );
  }
}

async function renderEvaluation(output: Record<string, unknown>, runId: string): Promise<void> {
  const status = stringValue(output.status) || 'unknown';
  const verdict = stringValue(output.verdict) || 'unresolved';
  const findings = recordArray(output.findings);
  const blockers = stringArray(output.blockers);
  const scores = compactEntries(output.scores);
  const nextRevisionPrompt = stringValue(output.nextRevisionPrompt);
  const needsHuman = status === 'needs_human' || verdict === 'needs_revision' || verdict === 'unresolved';

  setPageState(needsHuman ? 'needs-human' : status === 'blocked' ? 'blocked' : 'complete', needsHuman ? 'Human review' : verdict);
  eyebrow.textContent = 'Evaluation receipt';
  runTitle.textContent = needsHuman ? 'Judgment is still the gate' : verdict === 'satisfied' ? 'The run is satisfied' : 'The run needs revision';
  lede.textContent = needsHuman
    ? 'Deterministic checks are available, but ADS will not turn them into a fabricated visual judgment.'
    : 'The configured evaluation returned a typed verdict with an inspectable receipt.';
  runDetail.textContent = `${findings.length} findings · ${scores.length} scores`;
  renderMetrics([
    ['Status', status],
    ['Verdict', verdict],
    ...scores.slice(0, 8),
  ]);
  renderFindings(findings);
  renderBlockers(blockers);
  await renderScreenshots([], runId);

  if (nextRevisionPrompt) {
    showPrimaryAction(
      'Carry the revision forward',
      'Add the verified next-revision prompt and run identifier to the model context.',
      'Add revision brief',
      true,
    );
  }
}

async function renderTrace(output: Record<string, unknown>, runId: string): Promise<void> {
  const valid = output.valid === true;
  const errors = stringArray(output.errors);
  setPageState(valid ? 'trace' : 'blocked', valid ? 'Trace valid' : 'Trace failed');
  eyebrow.textContent = 'Decision provenance';
  runTitle.textContent = valid ? 'The decisions resolve to evidence' : 'The trace does not close';
  lede.textContent = valid
    ? 'Every recorded decision points back to captured rules, source constraints, artifacts, and rendered evidence.'
    : 'ADS found provenance that was missing, changed, or outside the captured run.';
  runDetail.textContent = stringValue(output.manifestSha256) ? 'manifest hash verified' : 'manifest unavailable';
  renderMetrics([
    ['Trace', valid ? 'valid' : 'invalid'],
    ['Errors', String(errors.length)],
  ]);
  renderBlockers(errors);
  await renderScreenshots([], runId);
}

function renderError(message: string): void {
  setPageState('error', 'App error');
  eyebrow.textContent = 'Inline evidence review';
  runTitle.textContent = 'The review surface could not initialize';
  lede.textContent = message;
  runIdElement.textContent = 'unavailable';
  runDetail.textContent = APP_PROTOCOL_VERSION;
  renderMetrics([['Status', 'error']]);
  visualEmpty.textContent = 'No evidence is available until the host and app complete their handshake.';
}

function renderCancelled(reason: string): void {
  setPageState('blocked', 'Run cancelled');
  resetOptionalPanels();
  eyebrow.textContent = 'Inline evidence review';
  runTitle.textContent = 'The run was cancelled';
  lede.textContent = reason;
  runIdElement.textContent = stringValue(activeOutput?.runId) || 'unavailable';
  runDetail.textContent = 'host cancellation';
  renderMetrics([['Status', 'cancelled']]);
  renderBlockers([reason]);
}

async function runPrimaryAction(): Promise<void> {
  if (!activeOutput) return;
  const runId = stringValue(activeOutput.runId);
  if (!runId) return;
  primaryAction.disabled = true;
  app.setAttribute('aria-busy', 'true');
  liveStatus.textContent = 'Working on the next ADS step.';
  try {
    if (Array.isArray(activeOutput.capturedStates)) {
      const result = await bridge.callTool('ads_evaluate', { runId, rubric: DEFAULT_RUBRIC });
      await renderToolResult(result);
    } else {
      const prompt = stringValue(activeOutput.nextRevisionPrompt);
      if (!prompt) return;
      await bridge.updateModelContext(runId, prompt);
      nextCopy.textContent = 'Revision context added. The host can now continue with the verified brief.';
      primaryAction.textContent = 'Brief added';
      primaryAction.disabled = true;
      liveStatus.textContent = 'Revision brief added to model context.';
    }
  } catch (error) {
    nextCopy.textContent = error instanceof Error ? error.message : String(error);
    primaryAction.disabled = false;
    liveStatus.textContent = 'The requested ADS action failed.';
  } finally {
    app.setAttribute('aria-busy', 'false');
  }
}

async function renderScreenshots(knownUris: string[], runId: string): Promise<void> {
  screenshots.replaceChildren();
  visualEmpty.hidden = false;
  visualEmpty.textContent = bridge.canReadResources()
    ? 'Looking up rendered evidence for this run.'
    : 'This host did not grant the app access to server resources.';
  const uris = knownUris.length > 0 ? knownUris : screenshotUrisByRun.get(runId) || [];
  if (!bridge.canReadResources() || uris.length === 0) {
    visualCount.textContent = '0 artifacts';
    return;
  }

  let renderedCount = 0;
  for (const uri of uris.slice(0, 2)) {
    try {
      const resource = await bridge.readResource(uri);
      const content = resource.contents?.[0];
      if (!content?.blob) continue;
      const figure = document.createElement('figure');
      figure.className = 'shot';
      const image = document.createElement('img');
      image.src = `data:${content.mimeType || 'image/png'};base64,${content.blob}`;
      image.alt = `Rendered ADS evidence: ${uri.split('/').at(-1) || 'screenshot'}`;
      const caption = document.createElement('figcaption');
      caption.textContent = uri;
      figure.append(image, caption);
      screenshots.append(figure);
      renderedCount += 1;
    } catch {
      continue;
    }
  }
  visualCount.textContent = `${renderedCount} ${renderedCount === 1 ? 'artifact' : 'artifacts'}`;
  visualEmpty.hidden = renderedCount > 0;
  if (renderedCount === 0) visualEmpty.textContent = 'Screenshot resources were listed but could not be read.';
}

function setPageState(state: string, label: string): void {
  app.dataset.state = state;
  app.setAttribute('aria-busy', 'false');
  statusPill.textContent = label;
  liveStatus.textContent = `${label}. ADS run content updated.`;
}

function renderMetrics(entries: Array<[string, string]>): void {
  summaryList.replaceChildren();
  for (const [label, value] of entries) {
    const item = document.createElement('li');
    const name = document.createElement('span');
    name.textContent = humanize(label);
    const detail = document.createElement('strong');
    detail.textContent = value;
    item.append(name, detail);
    summaryList.append(item);
  }
  summaryCount.textContent = `${entries.length} checks`;
}

function renderFindings(findings: Record<string, unknown>[]): void {
  findingsList.replaceChildren();
  findingsPanel.hidden = findings.length === 0;
  findingsCount.textContent = `${findings.length} ${findings.length === 1 ? 'finding' : 'findings'}`;
  for (const finding of findings.slice(0, 20)) {
    const item = document.createElement('li');
    const severity = document.createElement('strong');
    severity.textContent = `${stringValue(finding.severity) || 'finding'} · ${stringValue(finding.category) || 'review'}`;
    const observation = document.createElement('span');
    observation.textContent = stringValue(finding.observation) || 'No observation provided.';
    item.append(severity, observation);
    findingsList.append(item);
  }
}

function renderBlockers(blockers: string[]): void {
  blockersList.replaceChildren();
  blockersPanel.hidden = blockers.length === 0;
  blockersCount.textContent = `${blockers.length} ${blockers.length === 1 ? 'blocker' : 'blockers'}`;
  for (const blocker of blockers) {
    const item = document.createElement('li');
    const text = document.createElement('span');
    text.textContent = blocker;
    item.append(text);
    blockersList.append(item);
  }
}

function showPrimaryAction(title: string, copy: string, label: string, enabled: boolean): void {
  nextAction.hidden = false;
  requiredElement<HTMLElement>('next-title').textContent = title;
  nextCopy.textContent = enabled ? copy : `${copy} This host did not grant server-tool access.`;
  primaryAction.textContent = label;
  primaryAction.disabled = !enabled;
}

function resetOptionalPanels(): void {
  findingsPanel.hidden = true;
  blockersPanel.hidden = true;
  nextAction.hidden = true;
  findingsList.replaceChildren();
  blockersList.replaceChildren();
}

function applyHostContext(context: HostContext): void {
  currentHostContext = {
    ...currentHostContext,
    ...context,
    styles: {
      ...currentHostContext.styles,
      ...context.styles,
      variables: {
        ...currentHostContext.styles?.variables,
        ...context.styles?.variables,
      },
      css: {
        ...currentHostContext.styles?.css,
        ...context.styles?.css,
      },
    },
    containerDimensions: {
      ...currentHostContext.containerDimensions,
      ...context.containerDimensions,
    },
  };
  const root = document.documentElement;
  root.dataset.theme = currentHostContext.theme === 'dark' ? 'dark' : 'light';
  for (const [name, value] of Object.entries(currentHostContext.styles?.variables || {})) {
    if (name.startsWith('--') && value) root.style.setProperty(name, value);
  }
  const fonts = currentHostContext.styles?.css?.fonts;
  if (fonts) {
    let fontStyles = document.getElementById('host-font-styles');
    if (!fontStyles) {
      fontStyles = document.createElement('style');
      fontStyles.id = 'host-font-styles';
      document.head.append(fontStyles);
    }
    fontStyles.textContent = fonts;
  }
  const dimensions = currentHostContext.containerDimensions;
  root.style.width = dimensions?.width ? '100vw' : '';
  root.style.maxWidth = dimensions?.maxWidth ? `${dimensions.maxWidth}px` : '';
  root.style.height = dimensions?.height ? '100vh' : '';
  root.style.maxHeight = dimensions?.maxHeight ? `${dimensions.maxHeight}px` : '';
}

function startAutoResize(): void {
  let frame = 0;
  const report = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      bridge.reportSize(
        Math.ceil(document.documentElement.scrollWidth),
        Math.ceil(document.documentElement.scrollHeight),
      );
    });
  };
  resizeObserver = new ResizeObserver(report);
  resizeObserver.observe(document.body);
  report();
}

function compactEntries(value: unknown): Array<[string, string]> {
  if (!isRecord(value)) return [];
  return Object.entries(value).flatMap(([key, entry]) => {
    if (typeof entry === 'string' || typeof entry === 'number' || typeof entry === 'boolean') {
      return [[key, String(entry)] as [string, string]];
    }
    if (Array.isArray(entry)) return [[key, String(entry.length)] as [string, string]];
    return [];
  });
}

function recordArray(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function humanize(value: string): string {
  return value.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]/g, ' ').replace(/^./, (letter) => letter.toUpperCase());
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requiredElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing required element #${id}`);
  return element as T;
}
