// After just build: the package the way a consumer takes it (R08 in docs/decisions.md and its
// 2026-11-16 amendment).
//
//   node scripts/package.ts
//
// The two entry points and their declarations are where package.json says — the element, and the
// rule of the states, ./states —, its sideEffects keep the element's registration, and the
// package's name resolves to each; ./states imports nothing outside the DOM-free part, and Node,
// which has no DOM, imports it; npm pack takes the build and nothing of the sources, the tests or
// the tools; and no JavaScript of the build imports @altnovatrail/contracts, whose types alone the
// package takes, so that app keeps one copy of the contracts' code, its own. Run from the
// repository's root, inside the package, where Node resolves the package's own name.

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, posix } from "node:path";
import { fileURLToPath } from "node:url";

/** The element's entry point, which registers it when imported (R04). */
const ELEMENT = { types: "./lib/element/index.d.ts", default: "./lib/element/index.js" };
/** The rule of the states, one function for app's module card, which registers nothing (R08). */
const STATES = { types: "./lib/core/skill-states.d.ts", default: "./lib/core/skill-states.js" };
/** The entry points, by their subpaths in exports. */
const ENTRIES: Readonly<Record<string, typeof ELEMENT>> = { ".": ELEMENT, "./states": STATES };
/** What sideEffects names: the registration of the element, in the build and in the sources. */
const SIDE_EFFECTS = [ELEMENT.default, "./src/element/index.ts"];
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
  const entries = Object.values(ENTRIES).flatMap((entry) => [entry.default, entry.types]);
  for (const path of ["package.json", "LICENSE", "NOTICE", ...entries.map((e) => e.slice(2))]) {
    if (!paths.includes(path)) problems.push(`npm pack leaves out ${path}`);
  }
  return problems;
}

/**
 * Every problem with what package.json says of the entry points: there are two, the element's and
 * ./states, each where ENTRIES says, and sideEffects names the element's JavaScript, or a
 * consumer's bundler would drop the registration, and the sources' entry beside it, which the demo
 * builds from (R12 in docs/decisions.md): npm pack takes nothing of src/, so for a consumer it
 * names no file. ./states has no side effect, and sideEffects does not name it.
 */
export function manifestProblems(manifest: { exports?: unknown; sideEffects?: unknown }): string[] {
  const { exports, sideEffects } = manifest;
  const problems: string[] = [];
  if (typeof exports !== "object" || exports === null || Array.isArray(exports)) {
    problems.push(`package.json's exports is not an object of entry points`);
  } else {
    for (const entry of Object.keys(exports)) {
      if (!Object.hasOwn(ENTRIES, entry)) {
        problems.push(`package.json exports ${entry}, besides the element's and ./states`);
      }
    }
    for (const [entry, paths] of Object.entries(ENTRIES)) {
      const given = (exports as Record<string, unknown>)[entry];
      if (JSON.stringify(given) !== JSON.stringify(paths)) {
        problems.push(`package.json's entry point "${entry}" is not ${JSON.stringify(paths)}`);
      }
    }
  }
  if (JSON.stringify(sideEffects) !== JSON.stringify(SIDE_EFFECTS)) {
    problems.push(`package.json's sideEffects is not ${JSON.stringify(SIDE_EFFECTS)}`);
  }
  return problems;
}

/** Every file of the build's JavaScript that imports @altnovatrail/contracts, which only types may. */
export function contractsProblems(files: readonly { path: string; text: string }[]): string[] {
  return files
    .filter(({ path, text }) => path.endsWith(".js") && CONTRACTS.test(text))
    .map(({ path }) => `${path} imports @altnovatrail/contracts, whose code app alone ships`);
}

/**
 * A module specifier of JavaScript: `from "…"`, `import "…"` or `import("…")`, the specifier in
 * its group. The same shape as CONTRACTS, for any specifier.
 */
const SPECIFIER = /\b(?:from|import)\s*(?:\(\s*)?["']([^"']+)["']/g;
/** An `import(…)` whose module is no string literal, which no check can follow. */
const COMPUTED = /\bimport\s*\((?!\s*["'])/;

/**
 * JavaScript without its comments, which tsc keeps in the build: each block `/* … *\/`, and each
 * line that holds nothing but space before `//`. What a comment names imports nothing. It reads
 * by indexOf, not by a regular expression, so that its time stays linear in the text.
 */
export function withoutComments(text: string): string {
  let code = "";
  let at = 0;
  for (let open = text.indexOf("/*"); open !== -1; open = text.indexOf("/*", at)) {
    code += text.slice(at, open);
    const close = text.indexOf("*/", open + 2);
    at = close === -1 ? text.length : close + 2;
  }
  code += text.slice(at);
  return code
    .split("\n")
    .filter((line) => !line.trimStart().startsWith("//"))
    .join("\n");
}

/**
 * Every problem with what ./states imports, at any depth, of the build's JavaScript given by path:
 * only modules of the DOM-free part, lib/core/, so that it pulls in neither the element's
 * registration nor the DOM (R08 in docs/decisions.md), nothing of another package, and no module
 * by a name worked out at run time. What a comment names does not count.
 */
export function statesProblems(files: ReadonlyMap<string, string>): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();
  const queue = [STATES.default.slice(2)];
  for (let path = queue.shift(); path !== undefined; path = queue.shift()) {
    if (seen.has(path)) continue;
    seen.add(path);
    const text = files.get(path);
    if (text === undefined) {
      problems.push(`./states imports ${path}, which is not built`);
      continue;
    }
    const code = withoutComments(text);
    if (COMPUTED.test(code)) problems.push(`${path} imports a module by a computed name`);
    for (const [, specifier = ""] of code.matchAll(SPECIFIER)) {
      if (!specifier.startsWith(".")) {
        problems.push(`${path} imports ${specifier}, and ./states takes no other package`);
        continue;
      }
      const target = posix.normalize(posix.join(posix.dirname(path), specifier));
      if (target.startsWith("lib/core/")) queue.push(target);
      else problems.push(`${path} imports ${target}, outside the DOM-free part lib/core/`);
    }
  }
  return problems;
}

/** The files under a folder, at any depth, with paths relative to the repository's root. */
function filesUnder(folder: string): string[] {
  return readdirSync(folder, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => join(entry.parentPath, entry.name));
}

async function main(): Promise<string[]> {
  const manifest = JSON.parse(readFileSync("package.json", "utf8")) as {
    name: string;
    exports?: unknown;
    sideEffects?: unknown;
  };
  const problems = manifestProblems(manifest);
  for (const entry of Object.values(ENTRIES)) {
    for (const file of [entry.types, entry.default]) {
      if (!existsSync(file)) problems.push(`${file} is not built`);
    }
  }
  if (problems.length > 0) return problems;

  for (const [entry, paths] of Object.entries(ENTRIES)) {
    const specifier = posix.join(manifest.name, entry);
    try {
      const resolved = fileURLToPath(import.meta.resolve(specifier));
      if (!resolved.endsWith(paths.default.slice(1))) {
        problems.push(`${specifier} resolves to ${resolved}, not to ${paths.default}`);
      }
    } catch (error) {
      problems.push(`${specifier} does not resolve: ${(error as Error).message}`);
    }
  }
  const built = new Map(filesUnder("lib").map((path) => [path, readFileSync(path, "utf8")]));
  problems.push(...contractsProblems([...built].map(([path, text]) => ({ path, text }))));
  problems.push(...statesProblems(built));
  // Node has no DOM: what reaches the element or the DOM under ./states fails here, on HTMLElement.
  const specifier = posix.join(manifest.name, "states");
  try {
    const states = await import(specifier);
    if (typeof states.skillStates !== "function") {
      problems.push(`${specifier} gives no function skillStates`);
    }
  } catch (error) {
    problems.push(`${specifier} fails to import in Node: ${(error as Error).message}`);
  }
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
  const problems = await main();
  for (const problem of problems) console.log(`package: ${problem}`);
  console.log(problems.length === 0 ? "package: ok" : `package: ${problems.length} problems`);
  process.exitCode = problems.length === 0 ? 0 : 1;
}
