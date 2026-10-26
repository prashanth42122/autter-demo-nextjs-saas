import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

/**
 * Guards the GHSA-587h-7wmj-h5pm fix: the vite version resolved in the
 * committed lockfile must be a patched release (>= 7.3.7). Vite 7.3.6 and
 * earlier are vulnerable to the launch-editor `fs.existsSync()` existence
 * check bypass on Windows.
 */
function resolvedViteVersion(): string {
  const lockPath = resolve(process.cwd(), "package-lock.json");
  const lock = JSON.parse(readFileSync(lockPath, "utf8")) as {
    packages?: Record<string, { version?: string }>;
  };
  return lock.packages?.["node_modules/vite"]?.version ?? "";
}

function isAtLeast(version: string, minimum: string): boolean {
  const actual = version.split(".").map((part) => Number.parseInt(part, 10) || 0);
  const floor = minimum.split(".").map((part) => Number.parseInt(part, 10) || 0);
  for (let i = 0; i < floor.length; i += 1) {
    const a = actual[i] ?? 0;
    if (a > floor[i]) return true;
    if (a < floor[i]) return false;
  }
  return true;
}

describe("dependencies", () => {
  test("locks vite to a patched release for GHSA-587h-7wmj-h5pm", () => {
    expect(isAtLeast(resolvedViteVersion(), "7.3.7")).toBe(true);
  });
});
