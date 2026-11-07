// The icons of the map's states, marks and holdings (R10 in docs/decisions.md; R78 spec): Material
// Symbols, in the style Rounded and in outline, from the npm package of the set at the version
// package-lock.json pins, and of it only the icons the map shows. It writes the module the tree
// draws them from and NOTICE, which names the set the package embeds:
//
//   just icons                      write src/element/icons.ts and NOTICE
//   node scripts/icons.ts --check   write nothing, and fail unless both are what it would write
//
// ci-lint runs the check: a module edited by hand, or a new version of the set without the icons
// written again, fails it. Nothing goes to the network, now or when the element runs: the paths are
// in the build. The module comes out as Biome formats it, by the Biome package-lock.json pins, so
// ci-lint's format check passes it as it is. Run from the repository's root, as the recipes run it:
// the paths it writes are the root's. As canvas's scripts/icons.ts does it (R46 canvas).

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { getIconData, iconToSVG } from "@iconify/utils";
import type { Holding, MapState } from "../src/core/states.ts";

/** The npm package of the set. */
const SET = "@iconify-json/material-symbols";
/** What the script writes, from the repository's root. */
export const MODULE = "src/element/icons.ts";
export const NOTICE = "NOTICE";

/** A value the map shows by an icon: a state, a mark or an anchor skill's holding (R03). */
export type Value = MapState | "rubric" | "none" | Holding;

/**
 * The base of each value's icon, as the author chose them (R10). Each is drawn in outline,
 * `<base>-outline-rounded`: a tile has nothing chosen to fill, and its expansion is aria-expanded.
 * None runs along the line, so none is mirrored right to left, and none is in the table of
 * architecture 6 of spec: each is a value of skill-map alone.
 */
export const TABLE = {
  review: "update",
  mastered: "check-circle",
  practising: "timelapse",
  ready: "lock-open-right",
  locked: "lock",
  rubric: "rate-review",
  none: "remove-done",
  held: "verified",
  "not-held": "radio-button-unchecked",
  unknown: "question-mark",
} as const satisfies Record<Value, string>;

/** An icon as the tree draws it: its view box, and the paths it fills in the text's colour. */
export interface Drawn {
  readonly viewBox: string;
  readonly paths: readonly string[];
}

/** The set as the script reads it: its icons and aliases, as Iconify's utilities take them. */
export type IconSet = Parameters<typeof getIconData>[0];

/** A path of the set, as Material Symbols draws every icon: filled with the colour of the text. */
const PATH = /<path fill="currentColor" d="([^"]+)"\/>/y;

/**
 * An icon of the set, by its name, an alias too, as the tree draws it. A name the set does not
 * have stops the script, and so does an icon made of anything but filled paths: the tree would
 * draw it otherwise than the set does.
 */
export function drawn(set: IconSet, name: string): Drawn {
  const data = getIconData(set, name);
  if (data === null) throw new Error(`icons: ${SET} has no icon ${name}`);
  const { attributes, body } = iconToSVG(data);
  const paths: string[] = [];
  PATH.lastIndex = 0;
  for (let match = PATH.exec(body); match !== null; match = PATH.exec(body)) {
    paths.push(match[1] as string);
    if (PATH.lastIndex === body.length) return { viewBox: attributes.viewBox, paths };
  }
  throw new Error(`icons: ${name} is not filled paths alone: ${body.slice(0, 80)}`);
}

/** The module the tree draws the icons from, as the script writes it before Biome formats it. */
export function module(
  set: IconSet,
  version: string,
  table: Readonly<Record<string, string>> = TABLE,
): string {
  const rows = Object.entries(table).map(([value, base]) => {
    const name = `${base}-outline-rounded`;
    return `${JSON.stringify(value)}: ${JSON.stringify({ name, ...drawn(set, name) })},`;
  });
  return `// Written by scripts/icons.ts — \`just icons\` — from ${SET} ${version}:
// Material Symbols by Google, under the Apache License 2.0 (R10 in docs/decisions.md; R78 spec).
// ci-lint fails unless it is what the script writes, so it is never edited by hand.

/**
 * The icon of each value the map shows by one — a state, a mark, an anchor skill's holding — by
 * the value: its name in the set, its view box and its paths, which the tree fills in the colour of
 * the text.
 */
export const ICONS = {
${rows.join("\n")}
} as const;

/** A value the map shows by an icon. */
export type IconValue = keyof typeof ICONS;
`;
}

/** NOTICE: what the package embeds of others' work, beside its own license, the same Apache-2.0. */
export function notice(version: string): string {
  return `@altnovatrail/skill-map

The package embeds icons of Material Symbols, by Google, under the Apache License, Version 2.0,
the license in LICENSE: https://github.com/google/material-design-icons. They come from the npm
package ${SET} ${version}, and the package holds only the icons of the
map's states, marks and holdings.
`;
}

/** What differs between the files the script would write and the files there are. */
export function differences(
  wanted: Readonly<Record<string, string>>,
  read: (path: string) => string | undefined,
): string[] {
  return Object.entries(wanted)
    .filter(([path, text]) => read(path) !== text)
    .map(([path]) => `icons: ${path} is not what scripts/icons.ts writes; run just icons`);
}

/**
 * Biome's script, as package-lock.json pins it, by its path in node_modules and run by this Node:
 * no program is looked up in PATH, as scripts/package.ts runs npm.
 */
const BIOME = fileURLToPath(new URL("../node_modules/@biomejs/biome/bin/biome", import.meta.url));

/** Biome's format of a module, read from standard input. */
function formatted(text: string, path: string): string {
  return execFileSync(process.execPath, [BIOME, "format", `--stdin-file-path=${path}`], {
    input: text,
    encoding: "utf8",
  });
}

async function main(check: boolean): Promise<string[]> {
  const { version } = createRequire(import.meta.url)(`${SET}/package.json`) as { version: string };
  // The set's thousands of icons are read only here, not by whoever imports the module's helpers.
  const { icons, info } = await import("@iconify-json/material-symbols");
  // The set the table was read from: its name and its license, as the package of the set says them.
  if (info.name !== "Material Symbols" || info.license.spdx !== "Apache-2.0") {
    return [`icons: ${SET} ${version} is ${info.name} under ${info.license.spdx}`];
  }
  const wanted = {
    [MODULE]: formatted(module(icons, version), MODULE),
    [NOTICE]: notice(version),
  };
  if (check) {
    return differences(wanted, (path) => {
      try {
        return readFileSync(path, "utf8");
      } catch {
        return undefined;
      }
    });
  }
  for (const [path, text] of Object.entries(wanted)) writeFileSync(path, text);
  return [];
}

if (import.meta.main) {
  const problems = await main(process.argv.includes("--check"));
  for (const problem of problems) console.log(problem);
  console.log(problems.length === 0 ? "icons: ok" : `icons: ${problems.length} problems`);
  process.exitCode = problems.length === 0 ? 0 : 1;
}
