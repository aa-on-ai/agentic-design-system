import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";

const skipBrowserDownload = /^(1|true)$/i.test(process.env.PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD || "");

if (skipBrowserDownload) {
  process.stdout.write("ads-mcp: skipping Chromium download because PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD is set\n");
} else {
  const require = createRequire(import.meta.url);
  const playwrightCli = path.join(path.dirname(require.resolve("playwright/package.json")), "cli.js");
  execFileSync(process.execPath, [playwrightCli, "install", "chromium"], {
    env: { ...process.env, PLAYWRIGHT_SKIP_BROWSER_GC: "1" },
    stdio: "inherit",
  });
}
