export type UrlTarget = {
  type: 'url';
  url: string;
};

export type ComponentTarget = {
  type: 'component';
  path: string;
  exportName?: string;
};

export type SwiftUiTarget = {
  type: 'swiftui';
  projectPath: string;
  scheme: string;
  sourcePath?: string;
  configuration?: 'Debug' | 'Release';
  device?: string;
};

export type RenderTarget = UrlTarget | ComponentTarget | SwiftUiTarget;

export type Viewport = {
  width: number;
  height: number;
};

export type RenderProvenance = {
  observedSkillFiles?: string[];
  declaredSkillFiles?: string[];
  sourceFiles?: string[];
  artifactFiles?: string[];
  adsRelease?: string;
};

export type RenderInput = {
  target: RenderTarget;
  states?: string[];
  viewports?: Viewport[];
  waitFor?: string;
  settleMs?: number;
  maxCls?: number;
  provenance?: RenderProvenance;
};

export type EvaluateInput = {
  runId: string;
  compareToRunId?: string;
  rubric: {
    task: string;
    criteria: Array<{ name: string; weight: number }>;
  };
  judge?: { mode?: 'none' | 'configured' };
};

export type FindingCategory =
  | 'layout_spacing_hierarchy'
  | 'polish_consistency'
  | 'typography'
  | 'originality'
  | 'color_contrast'
  | 'interaction_motion'
  | 'cues_affordances'
  | 'brand_fit_tone';

export type FindingSeverity = 'minor' | 'major' | 'blocker';

export type NormalizedBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type VisualFinding = {
  category: FindingCategory;
  severity: FindingSeverity;
  rubricRow: string;
  state: string;
  breakpoint: string;
  artifact: string;
  target: {
    description: string;
    normalizedBox?: NormalizedBox;
  };
  observation: string;
  evidence: string[];
};

export type VisualJudgeRequest = {
  schemaVersion: 1;
  runId: string;
  target: RenderTarget;
  rubric: EvaluateInput['rubric'];
  gates: Record<string, unknown>;
  comparison: Record<string, unknown> | null;
  screenshots: Array<{
    state: string;
    breakpoint: string;
    artifact: string;
    path: string;
  }>;
};

export type VisualJudgeResult = {
  provider: string;
  model: string;
  modelCalls: number;
  verdict: 'satisfied' | 'needs_revision' | 'failed';
  scores: Record<string, number>;
  findings: VisualFinding[];
  nextRevisionPrompt: string;
};

export type VisualJudge = {
  id: string;
  evaluate: (request: VisualJudgeRequest, signal?: AbortSignal) => Promise<VisualJudgeResult>;
};

export type TraceDecision = {
  id: string;
  decision: string;
  artifact: {
    path: string;
    location?: string;
  };
  rule: {
    path: string;
    excerpt: string;
  };
  sourceConstraint: {
    path: string;
    excerpt: string;
  };
  evidence: string[];
};

export type TraceInput = {
  runId: string;
  context: string;
  decisions: TraceDecision[];
};

export type FileRecord = {
  path: string;
  sha256: string;
  bytes: number;
  kind: 'skill' | 'source' | 'artifact';
  loadStatus?: 'observed' | 'declared';
};

export type RunManifest = {
  schemaVersion: 1;
  runId: string;
  generatedAt: string;
  projectRootSha256: string;
  platform: 'web' | 'swiftui';
  renderer: string;
  detectors: string[];
  target: RenderTarget;
  adsRelease: string | null;
  skillFiles: FileRecord[];
  sourceFiles: FileRecord[];
  artifactFiles: FileRecord[];
};

export type CaptureEvidence = {
  url?: string;
  capturedStates?: string[];
  breakpoints?: string[];
  snapshots?: Array<{
    state: string;
    breakpoint: string;
    screenshot: string;
    [key: string]: unknown;
  }>;
  gates?: Record<string, unknown>;
  [key: string]: unknown;
};

export type CaptureRunnerArgs = {
  url: string;
  states: string[];
  viewports: Viewport[];
  waitFor?: string;
  settleMs: number;
  maxCls: number;
  outDir: string;
  cwd: string;
  timeoutMs: number;
  signal?: AbortSignal;
};

export type CaptureRunner = (args: CaptureRunnerArgs) => Promise<void>;

export type SwiftUiRenderArgs = {
  root: string;
  target: SwiftUiTarget;
  projectPath: string;
  sourcePath?: string;
  states: string[];
  viewports: Viewport[];
  settleMs: number;
  outDir: string;
  timeoutMs: number;
  signal?: AbortSignal;
};

export type SwiftUiRenderer = {
  id: string;
  detectors: string[];
  render: (args: SwiftUiRenderArgs) => Promise<void>;
};

export type RenderOutput = {
  schemaVersion: 1;
  runId: string;
  status: 'complete' | 'blocked';
  target: RenderTarget;
  capturedStates: string[];
  viewports: string[];
  gates: Record<string, unknown>;
  blockers: string[];
  artifacts: {
    evidence: string;
    screenshots: string[];
    manifest: string;
  };
};

export type EvaluateOutput = {
  schemaVersion: 1;
  runId: string;
  status: 'complete' | 'blocked' | 'needs_human';
  verdict: 'satisfied' | 'needs_revision' | 'failed' | null;
  scores: Record<string, number> | null;
  findings: VisualFinding[];
  gates: Record<string, unknown>;
  comparison: Record<string, unknown> | null;
  nextRevisionPrompt: string;
  blockers: string[];
  artifacts: {
    receipt: string;
    report: string;
  };
};

export type TraceOutput = {
  schemaVersion: 1;
  runId: string;
  valid: boolean;
  errors: string[];
  manifestSha256: string;
  artifacts: {
    trace: string;
    validation: string;
  };
};

export type ServerConfig = {
  root: string;
  runsDir: string;
  allowedOrigins: Set<string>;
  timeoutMs: number;
  judgeCommand?: {
    command: string;
    args: string[];
    provider: string;
    model: string;
  };
  swiftUiCommand?: {
    command: string;
    args: string[];
    renderer: string;
    detectors: string[];
  };
};
