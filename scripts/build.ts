/**
 * Build script for the Mienvío SDK.
 *
 * Compiles TypeScript source to ESM JavaScript + declarations using tsc.
 */

import { $ } from "bun";

console.log("🧹 Cleaning dist/...");
await $`rm -rf dist`.quiet();

console.log("📦 Compiling with tsc (ESM + declarations)...");
const tsc = Bun.spawnSync([
  "bunx", "tsc",
  "--outDir", "dist",
  "--declaration", "--declarationMap",
  "--sourceMap",
], {
  stdout: "inherit",
  stderr: "inherit",
});

if (tsc.exitCode !== 0) {
  console.error("❌ TypeScript compilation failed.");
  process.exit(1);
}

console.log("✅ Build complete.");
await $`find dist/ -type f | sort`.quiet();
