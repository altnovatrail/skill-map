// The English titles of the anchor skills, embedded at build time (R04; R09 in docs/decisions.md):
// from shared-taxonomy.schema.json in the format file of a release of spec, which enters the
// package only through spec's release-verify (R77 spec; RULES.md, Hard rules).
//
//   just taxonomy                      verify the file, pin its digest and write the titles
//   node scripts/taxonomy.ts --check   fail unless the pinned file gives the titles as written
//
// Writing, which `just taxonomy` runs, downloads the file and its bundle from the release, runs
// `just -f spec/justfile release-verify spec <tag> <file> <bundle>` on them, and writes
// src/element/anchor-titles.ts with the file's sha256. From then on the digest holds the file:
// --check, which ci-lint runs, downloads it again, holds it to the digest the source names, and
// fails unless what it gives is what the source says. Neither needs anything installed: the
// network, tar and, to write, just and spec/.

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { TAR } from "./tar.ts";

/** The release of spec whose format file the titles come from: the tag spec/ stands on. */
export const RELEASE = { repository: "spec", tag: "v0.9.5", format: "0.3" } as const;
/** Where the titles are written. */
export const TARGET = "src/element/anchor-titles.ts";

const FILE = `format-${RELEASE.format}.tar.gz`;
const SCHEMA = `format-${RELEASE.format}/format/schemas/shared-taxonomy.schema.json`;
const URL_OF = (name: string) =>
  `https://github.com/altnovatrail/${RELEASE.repository}/releases/download/${RELEASE.tag}/${name}`;

/** The ID and English title of each anchor skill of the shared taxonomy, by ID. */
export function titlesOf(schema: unknown): [string, string][] {
  const branches = (schema as { oneOf?: unknown }).oneOf;
  if (!Array.isArray(branches) || branches.length === 0) {
    throw new Error("shared-taxonomy.schema.json has no branches of oneOf");
  }
  const titles = branches.map((branch: { const?: unknown; title?: unknown }) => {
    if (typeof branch.const !== "string" || typeof branch.title !== "string") {
      throw new Error("a branch of oneOf has no const and title of strings");
    }
    return [branch.const, branch.title] as [string, string];
  });
  return titles.sort(([a], [b]) => Number(a > b) - Number(a < b));
}

/** The source of src/element/anchor-titles.ts. */
export function render(sha256: string, titles: readonly [string, string][]): string {
  const rows = titles.map(([id, title]) => `  ${JSON.stringify(id)}: ${JSON.stringify(title)},`);
  return [
    "// Written by scripts/taxonomy.ts from the format file of a release of spec, verified by spec's",
    "// release-verify and held by its sha256 since: `just taxonomy` writes it anew (R09 in",
    "// docs/decisions.md). Do not edit it by hand: ci-lint checks it against the file.",
    "",
    "/** The format file the titles come from, and its digest. */",
    "export const SOURCE = {",
    `  release: ${JSON.stringify(`${RELEASE.repository} ${RELEASE.tag}`)},`,
    `  file: ${JSON.stringify(FILE)},`,
    `  sha256: ${JSON.stringify(sha256)},`,
    "} as const;",
    "",
    "/** The English title of each anchor skill of the shared taxonomy, by ID (R50 spec). */",
    "export const ANCHOR_TITLES: Readonly<Record<string, string>> = {",
    ...rows,
    "};",
    "",
  ].join("\n");
}

/** The sha256 the source of the titles pins, or undefined if it pins none. */
export function pinned(source: string): string | undefined {
  return /\bsha256: "([0-9a-f]{64})"/.exec(source)?.[1];
}

async function download(name: string, folder: string): Promise<string> {
  const response = await fetch(URL_OF(name));
  if (!response.ok) throw new Error(`${URL_OF(name)}: HTTP ${response.status}`);
  const path = join(folder, name);
  writeFileSync(path, Buffer.from(await response.arrayBuffer()));
  return path;
}

function sha256Of(path: string): string {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function titlesFrom(archive: string, folder: string): [string, string][] {
  execFileSync(TAR, ["-xzf", archive, "-C", folder, SCHEMA]);
  return titlesOf(JSON.parse(readFileSync(join(folder, SCHEMA), "utf8")));
}

async function main(check: boolean): Promise<string> {
  const folder = mkdtempSync(join(tmpdir(), "taxonomy-"));
  try {
    const archive = await download(FILE, folder);
    const sha256 = sha256Of(archive);
    if (check) {
      const source = readFileSync(TARGET, "utf8");
      const want = pinned(source);
      if (want !== sha256) {
        throw new Error(`${FILE} of ${RELEASE.tag} is sha256 ${sha256}, not ${want ?? "none"}`);
      }
      if (render(sha256, titlesFrom(archive, folder)) !== source) {
        throw new Error(`${TARGET} is not what ${FILE} gives: run just taxonomy`);
      }
      return `${TARGET} is what ${FILE} of ${RELEASE.tag} gives, sha256 ${sha256}`;
    }
    // The just that runs the recipe, by its path: none is looked up in PATH.
    const just = process.env.JUST;
    if (just === undefined) throw new Error("run it by just taxonomy, which names its just");
    const bundle = await download(`${FILE}.sigstore.json`, folder);
    execFileSync(
      just,
      ["-f", "spec/justfile", "release-verify", RELEASE.repository, RELEASE.tag, archive, bundle],
      { stdio: "inherit" },
    );
    writeFileSync(TARGET, render(sha256, titlesFrom(archive, folder)));
    return `wrote ${TARGET} from ${FILE} of ${RELEASE.tag}, sha256 ${sha256}`;
  } finally {
    rmSync(folder, { recursive: true, force: true });
  }
}

if (import.meta.main) {
  main(process.argv.includes("--check")).then(
    (done) => console.log(`taxonomy: ${done}`),
    (error: Error) => {
      console.error(`taxonomy: ${error.message}`);
      process.exitCode = 1;
    },
  );
}
