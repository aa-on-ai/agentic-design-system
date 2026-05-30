// Deterministic "skip" fixture. Mirrors the most common real failure: a generated page
// imports an icon/chart/font lib that isn't installed. esbuild can't resolve it, the mount
// stage fails, and render-eval must record an EXPLICIT skip with the reason — never a silent
// drop. This file is supposed to fail to bundle; that is the test.
import { FancyChart } from 'totally-not-installed-chart-lib';

export default function BrokenPage() {
  return (
    <main>
      <h1>Revenue</h1>
      <FancyChart />
    </main>
  );
}
