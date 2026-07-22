import { randomBytes } from 'node:crypto';
import { cp, mkdir, readFile, realpath, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { ensureDirectoryInside, isInside } from './security.js';

const RUN_ID = /^run_[a-z0-9]+_[a-f0-9]{12}$/;

export class RunStore {
  readonly root: string;
  readonly runsRoot: string;

  private constructor(root: string, runsRoot: string) {
    this.root = root;
    this.runsRoot = runsRoot;
  }

  static async create(root: string, runsDir: string): Promise<RunStore> {
    const runsRoot = await ensureDirectoryInside(root, runsDir);
    return new RunStore(root, runsRoot);
  }

  newRunId(): string {
    return `run_${Date.now().toString(36)}_${randomBytes(6).toString('hex')}`;
  }

  runDirectory(runId: string): string {
    if (!RUN_ID.test(runId)) throw new Error(`invalid run ID: ${runId}`);
    const directory = path.join(this.runsRoot, runId);
    if (!isInside(this.runsRoot, directory)) throw new Error(`invalid run ID: ${runId}`);
    return directory;
  }

  async createRun<T>(
    runId: string,
    build: (temporaryDirectory: string) => Promise<T>,
  ): Promise<T> {
    const finalDirectory = this.runDirectory(runId);
    const temporaryDirectory = path.join(
      this.runsRoot,
      `.tmp-${runId}-${randomBytes(4).toString('hex')}`,
    );
    await mkdir(temporaryDirectory, { recursive: false, mode: 0o700 });
    try {
      const result = await build(temporaryDirectory);
      await rename(temporaryDirectory, finalDirectory);
      return result;
    } catch (error) {
      await rm(temporaryDirectory, { recursive: true, force: true });
      throw error;
    }
  }

  async readJson<T>(runId: string, relativePath: string): Promise<T> {
    return JSON.parse(await readFile(await this.existingRunPath(runId, relativePath), 'utf8')) as T;
  }

  async readBytes(runId: string, relativePath: string): Promise<Buffer> {
    return readFile(await this.existingRunPath(runId, relativePath));
  }

  async writeStage<T>(
    runId: string,
    kind: 'evaluation' | 'trace',
    build: (temporaryDirectory: string, stageId: string) => Promise<T>,
  ): Promise<T> {
    const runDirectory = await realpath(this.runDirectory(runId));
    if (!isInside(this.runsRoot, runDirectory)) throw new Error(`run resolves outside storage: ${runId}`);
    await this.readBytes(runId, 'run.json');
    const stageId = `${kind}_${Date.now().toString(36)}_${randomBytes(4).toString('hex')}`;
    const kindDirectory = path.join(runDirectory, kind);
    const temporaryDirectory = path.join(kindDirectory, `.tmp-${stageId}`);
    const finalDirectory = path.join(kindDirectory, stageId);
    await mkdir(temporaryDirectory, { recursive: true, mode: 0o700 });
    try {
      const result = await build(temporaryDirectory, stageId);
      await rename(temporaryDirectory, finalDirectory);
      await this.writeJsonAtomic(path.join(kindDirectory, 'index.json'), {
        schemaVersion: 1,
        latest: stageId,
        updatedAt: new Date().toISOString(),
      });
      return result;
    } catch (error) {
      await rm(temporaryDirectory, { recursive: true, force: true });
      throw error;
    }
  }

  async latestStagePath(runId: string, kind: 'evaluation' | 'trace', file: string): Promise<string> {
    const index = await this.readJson<{ latest: string }>(runId, `${kind}/index.json`);
    if (!/^(?:evaluation|trace)_[a-z0-9]+_[a-f0-9]{8}$/.test(index.latest)) {
      throw new Error(`invalid ${kind} index`);
    }
    return `${kind}/${index.latest}/${file}`;
  }

  async copyEvidence(runId: string, destination: string): Promise<void> {
    await cp(await this.existingRunPath(runId, 'evidence'), destination, { recursive: true });
  }

  private lexicalRunPath(runId: string, relativePath: string): string {
    const runDirectory = this.runDirectory(runId);
    const absolute = path.resolve(runDirectory, relativePath);
    if (!isInside(runDirectory, absolute) || absolute === runDirectory) {
      throw new Error(`resource path escapes run: ${relativePath}`);
    }
    return absolute;
  }

  private async existingRunPath(runId: string, relativePath: string): Promise<string> {
    const runDirectory = await realpath(this.runDirectory(runId));
    if (!isInside(this.runsRoot, runDirectory)) throw new Error(`run resolves outside storage: ${runId}`);
    const resolved = await realpath(this.lexicalRunPath(runId, relativePath));
    if (!isInside(runDirectory, resolved) || resolved === runDirectory) {
      throw new Error(`resource resolves outside run: ${relativePath}`);
    }
    return resolved;
  }

  private async writeJsonAtomic(target: string, value: unknown): Promise<void> {
    await mkdir(path.dirname(target), { recursive: true });
    const temporary = `${target}.tmp-${randomBytes(4).toString('hex')}`;
    await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
    await rename(temporary, target);
  }
}
