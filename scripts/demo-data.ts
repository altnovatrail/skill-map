// The graphs of the page to try the map on by hand (R12 in docs/decisions.md; RUN.md, T16): those
// of the modules of the first slice, from a release of modules, and the vectors of tiers of the
// format file of spec's release. Both enter through spec's release-verify once, and their digests
// hold them from then on (RULES.md, Hard rules; R77 spec):
//
//   just demo-pin                      verify the module index and pin its sha256 in demo/release.ts
//   the demo's Vite configuration      load the graphs, held to the pinned digests, into memory
//
// The module index is the signed file. Its entry names a package by the sha256 of the package's
// inventory.json, which names its server part, server.json, by that file's sha256: a chain of
// digests from the pinned index to the manifest, the skill graph and the tiers the map is drawn
// from (format/README.md of spec, section 25). The format file is held to the sha256 that
// src/element/anchor-titles.ts already pins (R09). Nothing of the network is written to a file:
// archives are read in memory and tar reads them from its standard input (CodeQL
// js/http-to-file-access). Pinning reads the index and its bundle from PIN_FOLDER, where the recipe
// downloaded them: nothing of the command line goes into a path or a command.

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import { RELEASE } from "../demo/release.ts";
import { SOURCE } from "../src/element/anchor-titles.ts";
import { TAR } from "./tar.ts";
import { RELEASE as FORMAT_RELEASE, URLS as FORMAT_URLS, sha256Of } from "./taxonomy.ts";

export { sha256Of };

/** The release of modules whose index is pinned, and the file of it. */
export const MODULES = { repository: "modules", tag: "v0.1.0", file: "module-index.json" } as const;
/** Where `just demo-pin` downloads the index and its bundle, and removes them after. */
export const PIN_FOLDER = "node_modules/.demo-pin";
/** Where the pinned digest is written. */
export const TARGET = "demo/release.ts";

/** A file of a release of modules, by its tag and its name. */
const URL_OF = (tag: string, name: string) =>
  `https://github.com/altnovatrail/${MODULES.repository}/releases/download/${tag}/${name}`;

/** The addresses of the index and its bundle, which `just demo-pin` downloads. */
export const URLS = [
  URL_OF(MODULES.tag, MODULES.file),
  URL_OF(MODULES.tag, `${MODULES.file}.sigstore.json`),
] as const;

/** The format version whose packages and vectors the demo reads: the one spec/ stands on. */
const FORMAT = FORMAT_RELEASE.format;

/** The vectors of tiers the demo draws, by their names in format/vectors/tiers/. */
export const VECTORS = ["chain", "longest-chain", "olympiad-math", "two-graphs", "one-tier"];

/** A graph of the demo: what the element takes, and where it came from. */
export interface DemoGraph {
  readonly name: string;
  readonly source: string;
  readonly graph: Readonly<Record<string, unknown>>;
  readonly tiers: Readonly<Record<string, number>>;
  /** The module's manifest; a vector has none, and the page gives it one. */
  readonly manifest: Readonly<Record<string, unknown>> | null;
}

/**
 * An entry of the index the demo takes: a module at its latest version, and the release whose
 * files hold its package — an index keeps the entries of packages that earlier releases built
 * (format/README.md of spec, section 26).
 */
export interface Entry {
  readonly id: string;
  readonly version: string;
  readonly digest: string;
  readonly release: string;
}

/** Versions compared by their numbers, MAJOR.MINOR.PATCH. */
function newer(a: string, b: string): number {
  const [x, y] = [a, b].map((version) => version.split(".").map(Number));
  for (let i = 0; i < 3; i++) {
    const difference = (x?.[i] ?? 0) - (y?.[i] ?? 0);
    if (difference !== 0) return difference;
  }
  return 0;
}

/**
 * The modules of the index, each at its latest version of the format the demo reads that is not
 * withdrawn and names its package and its release, by ID. The index must be the one pinned: its bytes are held to the sha256.
 */
export function indexEntries(bytes: Uint8Array, pinned: string): Entry[] {
  const sha256 = sha256Of(bytes);
  if (sha256 !== pinned) throw new Error(`${MODULES.file} is sha256 ${sha256}, not ${pinned}`);
  const index = JSON.parse(Buffer.from(bytes).toString("utf8")) as {
    modules?: Record<string, Record<string, Record<string, unknown>>>;
  };
  return Object.entries(index.modules ?? {})
    .flatMap(([id, versions]) => {
      const readable = Object.entries(versions)
        .flatMap(([version, entry]) =>
          entry.module_format_version === FORMAT &&
          entry.withdrawn === undefined &&
          typeof entry.package_digest === "string" &&
          typeof entry.release === "string"
            ? [{ id, version, digest: entry.package_digest, release: entry.release }]
            : [],
        )
        .sort((a, b) => newer(b.version, a.version));
      return readable.slice(0, 1);
    })
    .sort((a, b) => Number(a.id > b.id) - Number(a.id < b.id));
}

/**
 * The manifest, the open view of the skill graph and the tiers of a package, read from its
 * inventory.json and server.json. The inventory must be the one the index names, by its sha256,
 * and the server part the one the inventory names. The open view of the graph is the graph
 * without its retired skills (formatv0/open of @altnovatrail/spec).
 */
export function openPackage(
  inventory: Uint8Array,
  server: Uint8Array,
  digest: string,
): Pick<DemoGraph, "manifest" | "graph" | "tiers"> {
  if (`sha256:${sha256Of(inventory)}` !== digest) {
    throw new Error(`inventory.json is not the package ${digest} the index names`);
  }
  const parts = JSON.parse(Buffer.from(inventory).toString("utf8")) as {
    server_part?: { digest?: string };
  };
  if (`sha256:${sha256Of(server)}` !== parts.server_part?.digest) {
    throw new Error(`server.json of ${digest} is not the server part its inventory names`);
  }
  const { manifest, skill_graph, skill_tiers } = JSON.parse(
    Buffer.from(server).toString("utf8"),
  ) as {
    manifest: Record<string, unknown>;
    skill_graph: Record<string, unknown>;
    skill_tiers: Record<string, number>;
  };
  const { retired_skills: _retired, ...graph } = skill_graph;
  return { manifest, graph, tiers: skill_tiers };
}

/** A vector of tiers, its YAML: the skill graph and the tiers the format computes for it. */
export function vectorOf(name: string, text: string): DemoGraph {
  const { skill_graph, skill_tiers } = parse(text) as {
    skill_graph?: Record<string, unknown>;
    skill_tiers?: Record<string, number>;
  };
  if (skill_graph === undefined || skill_tiers === undefined) {
    throw new Error(`the vector ${name} has no skill_graph and skill_tiers`);
  }
  return {
    name,
    source: `spec ${FORMAT_RELEASE.tag}, format/vectors/tiers/${name}.yaml`,
    graph: skill_graph,
    tiers: skill_tiers,
    manifest: null,
  };
}

/** One file of an archive in memory, which tar reads from its standard input. */
function fileOf(archive: Uint8Array, path: string): Buffer {
  return execFileSync(TAR, ["-xzOf", "-", path], { input: archive, maxBuffer: 1 << 26 });
}

async function download(url: string): Promise<Uint8Array> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return new Uint8Array(await response.arrayBuffer());
}

/** The graphs of the modules of the pinned index, each from the release its entry names. */
async function modules(): Promise<DemoGraph[]> {
  const index = await download(URLS[0]);
  return Promise.all(
    indexEntries(index, RELEASE.sha256).map(async ({ id, version, digest, release }) => {
      const archive = await download(URL_OF(release, `${digest.replace(":", "-")}.tar.gz`));
      const files = openPackage(
        fileOf(archive, "inventory.json"),
        fileOf(archive, "server.json"),
        digest,
      );
      return { name: id, source: `modules ${release}, ${id} ${version}`, ...files };
    }),
  );
}

/** The vectors of tiers of the format file, held to the sha256 the anchor skills' titles pin. */
async function vectors(): Promise<DemoGraph[]> {
  const format = await download(FORMAT_URLS[0]);
  const sha256 = sha256Of(format);
  if (sha256 !== SOURCE.sha256) {
    throw new Error(`${SOURCE.file} is sha256 ${sha256}, not ${SOURCE.sha256}`);
  }
  return VECTORS.map((name) =>
    vectorOf(
      name,
      fileOf(format, `format-${FORMAT}/format/vectors/tiers/${name}.yaml`).toString("utf8"),
    ),
  );
}

/** The graphs of the demo: the modules of the pinned index, then the vectors of the format file. */
export async function loadGraphs(): Promise<DemoGraph[]> {
  const [fromModules, fromFormat] = await Promise.all([modules(), vectors()]);
  return [...fromModules, ...fromFormat];
}

/** The source of demo/release.ts. */
export function render(sha256: string): string {
  return [
    "// Written by scripts/demo-data.ts from the module index of a release of modules, verified by",
    "// spec's release-verify and held by its sha256 since: `just demo-pin` writes it anew (R12 in",
    "// docs/decisions.md). Do not edit it by hand.",
    "",
    "/** The module index the demo's graphs come from, and its digest. */",
    "export const RELEASE = {",
    `  release: ${JSON.stringify(`${MODULES.repository} ${MODULES.tag}`)},`,
    `  file: ${JSON.stringify(MODULES.file)},`,
    `  sha256: ${JSON.stringify(sha256)},`,
    "} as const;",
    "",
  ].join("\n");
}

/** Verifies the index in PIN_FOLDER, with its bundle, by release-verify, and pins its sha256. */
function pin(): string {
  // The just that runs the recipe, by its path: none is looked up in PATH.
  const just = process.env.JUST;
  if (just === undefined) throw new Error("run it by just demo-pin, which names its just");
  const index = join(PIN_FOLDER, MODULES.file);
  execFileSync(
    just,
    [
      "-f",
      "spec/justfile",
      "release-verify",
      MODULES.repository,
      MODULES.tag,
      index,
      `${index}.sigstore.json`,
    ],
    { stdio: "inherit" },
  );
  const sha256 = sha256Of(readFileSync(index));
  writeFileSync(TARGET, render(sha256));
  return `wrote ${TARGET} from ${MODULES.file} of ${MODULES.repository} ${MODULES.tag}, sha256 ${sha256}`;
}

if (import.meta.main && process.argv[2] === "--urls") {
  console.log(URLS.join("\n"));
} else if (import.meta.main) {
  try {
    if (process.argv[2] !== "--pin") throw new Error("run it by just demo-pin");
    console.log(`demo-data: ${pin()}`);
  } catch (error) {
    console.error(`demo-data: ${(error as Error).message}`);
    process.exitCode = 1;
  }
}
