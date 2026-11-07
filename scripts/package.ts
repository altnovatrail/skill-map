// After just build: the package the way a consumer takes it (R08 in docs/decisions.md).
//
//   node scripts/package.ts
//
// The one entry point and its declarations are where package.json says, its sideEffects keep the
// entry's registration of the element, and the package's name resolves to it; npm pack takes the
// build and nothing of the sources, the tests or the tools; and no JavaScript of the build imports
// @altnovatrail/contracts, whose types alone the package takes, so that app keeps one copy of the
// contracts' code, its own. Run from the repository's root, inside the package, where Node
// resolves the package's own name.

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/** The one entry point: the element, which registers itself when imported (R04). */
const ENTRY = { types: "./lib/element/index.d.ts", default: "./lib/element/index.js" };
/**
 * The paths npm pack takes, besides the build: package.json, the files npm always adds, and NOTICE,
 * which names the icons the package embeds (R78 spec; R10 in docs/decisions.md).
 */
const ALWAYS = new Set(["package.json", "README.md", "LICENSE", "NOTICE"]);
/** A file of the build: JavaScript or a declaration, at any depth under lib/core or lib/element. */
const BUILT = /^lib\/(core|element)\/(?:[^/]+\/)*[^/]+\.(js|d\.ts)$/;
/** What the build leaves out (tsconfig.build.json): tests, their fixtures and type-only checks. */
const NOT_SHIPPED = /\.(test|fixture|check)\.(js|d\.ts)$/;
/**
 * A module specifier of @altnovatrail/contracts in JavaScript: `from "…"`, `import "…"` or
 * `import("…")`. A comment that names the package imports nothing, and does not count. The space
 * after the keyword goes to one quantifier, and the space after `(` to another that only follows
 * `(`, so that no input has two ways to match it.
 */
const CONTRACTS = /\b(?:from|import)\s*(?:\(\s*)?["']@altnovatrail\/contracts["'/]/;

/** Every problem with the files npm pack takes. */
export function packProblems(paths: readonly string[]): string[] {
  const problems: string[] = [];
  for (const path of paths) {
    if (ALWAYS.has(path)) continue;
    if (!BUILT.test(path) || NOT_SHIPPED.test(path)) {
      problems.push(`npm pack takes ${path}, which is not part of the build`);
    }
  }
  for (const path of [
    "package.json",
    "LICENSE",
    "NOTICE",
    ENTRY.default.slice(2),
    ENTRY.types.slice(2),
  ]) {
    if (!paths.includes(path)) problems.push(`npm pack leaves out ${path}`);
  }
  return problems;
}

/**
 * Every problem with what package.json says of the entry point: there is one, the element's, and
 * sideEffects names its JavaScript alone, or a consumer's bundler would drop the registration.
 */
export function manifestProblems(manifest: { exports?: unknown; sideEffects?: unknown }): string[] {
  const { exports, sideEffects } = manifest;
  const problems: string[] = [];
  if (typeof exports !== "object" || exports === null || Array.isArray(exports)) {
    problems.push(`package.json's exports is not an object of entry points`);
  } else {
    for (const entry of Object.keys(exports)) {
      if (entry !== ".") problems.push(`package.json exports ${entry}, besides the element's`);
    }
    const element = (exports as Record<string, unknown>)["."];
    if (JSON.stringify(element) !== JSON.stringify(ENTRY)) {
      problems.push(`package.json's entry point "." is not ${JSON.stringify(ENTRY)}`);
    }
  }
  if (JSON.stringify(sideEffects) !== JSON.stringify([ENTRY.default])) {
    problems.push(`package.json's sideEffects is not ["${ENTRY.default}"]`);
  }
  return problems;
}

/** Every file of the build's JavaScript that imports @altnovatrail/contracts, which only types may. */
export function contractsProblems(files: readonly { path: string; text: string }[]): string[] {
  return files
    .filter(({ path, text }) => path.endsWith(".js") && CONTRACTS.test(text))
    .map(({ path }) => `${path} imports @altnovatrail/contracts, whose code app alone ships`);
}

/** The files under a folder, at any depth, with paths relative to the repository's root. */
function filesUnder(folder: string): string[] {
  return readdirSync(folder, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => join(entry.parentPath, entry.name));
}

function main(): string[] {
  const manifest = JSON.parse(readFileSync("package.json", "utf8")) as {
    name: string;
    exports?: unknown;
    sideEffects?: unknown;
  };
  const problems = manifestProblems(manifest);
  for (const file of [ENTRY.types, ENTRY.default]) {
    if (!existsSync(file)) problems.push(`${file} is not built`);
  }
  if (problems.length > 0) return problems;

  const element = fileURLToPath(import.meta.resolve(manifest.name));
  if (!element.endsWith(ENTRY.default.slice(1))) {
    problems.push(`${manifest.name} resolves to ${element}, not to the element's build`);
  }
  problems.push(
    ...contractsProblems(
      filesUnder("lib").map((path) => ({ path, text: readFileSync(path, "utf8") })),
    ),
  );

  // The npm that comes with this very Node, by its path in Node's distribution and run by this
  // Node: no program is looked up in PATH.
  const npm = join(
    dirname(process.execPath),
    "..",
    "lib",
    "node_modules",
    "npm",
    "bin",
    "npm-cli.js",
  );
  if (!existsSync(npm)) return [...problems, `npm is not at ${npm}, beside this Node`];
  const packed = JSON.parse(
    execFileSync(process.execPath, [npm, "pack", "--dry-run", "--json", "--ignore-scripts"], {
      encoding: "utf8",
    }),
  ) as { files: { path: string }[] }[];
  problems.push(...packProblems(packed[0]?.files.map((file) => file.path) ?? []));
  return problems;
}

if (import.meta.main) {
  const problems = main();
  for (const problem of problems) console.log(`package: ${problem}`);
  console.log(problems.length === 0 ? "package: ok" : `package: ${problems.length} problems`);
  process.exitCode = problems.length === 0 ? 0 : 1;
}
