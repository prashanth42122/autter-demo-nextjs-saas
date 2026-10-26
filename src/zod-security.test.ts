import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

/**
 * Guards the GHSA-mrhx-c7xc-m3w5 fix: the zod version resolved in the
 * committed lockfile must be a patched release (>= 4.6.6). Zod 3.x and
 * 4.6.5 and earlier are affected by the advisory.
 */
function resolvedZodVersion(): string {
  const lockPath = resolve(process.cwd(), "package-lock.json");
  const lock = JSON.parse(readFileSync(lockPath, "utf8")) as {
    packages?: Record<string, { version?: string }>;
  };
  return lock.packages?.["node_modules/zod"]?.version ?? "";
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
  test("locks zod to a patched release for GHSA-mrhx-c7xc-m3w5", () => {
    expect(isAtLeast(resolvedZodVersion(), "4.6.6")).toBe(true);
  });
});
