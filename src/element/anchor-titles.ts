// Written by scripts/taxonomy.ts from the format file of a release of spec, verified by spec's
// release-verify and held by its sha256 since: `just taxonomy` writes it anew. Do not
// edit it by hand: ci-lint checks it against the file.

/** The format file the titles come from, and its digest. */
export const SOURCE = {
  release: "spec v0.19.20",
  file: "format-0.4.tar.gz",
  sha256: "86cec2c83c905514ea6f3b2ffc8cbe0741f518fb96ac4f94a562adf123a8505e",
} as const;

/** The English title of each anchor skill of the shared taxonomy, by ID. */
export const ANCHOR_TITLES: Readonly<Record<string, string>> = {
  "core.division-with-remainder": "Division with a remainder",
  "core.fractions-of-a-whole": "Fractions of a whole",
  "core.linear-equations": "Linear equations",
  "core.multiplication-table": "Multiplication table",
};
