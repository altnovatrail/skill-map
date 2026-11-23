// Written by scripts/taxonomy.ts from the format file of a release of spec, verified by spec's
// release-verify and held by its sha256 since: `just taxonomy` writes it anew. Do not
// edit it by hand: ci-lint checks it against the file.

/** The format file the titles come from, and its digest. */
export const SOURCE = {
  release: "spec v0.19.12",
  file: "format-0.4.tar.gz",
  sha256: "3e6e54e1ce93cca9a0a42a3b8a100f3ab2be99010dde14e914ea860de522bff3",
} as const;

/** The English title of each anchor skill of the shared taxonomy, by ID. */
export const ANCHOR_TITLES: Readonly<Record<string, string>> = {
  "core.division-with-remainder": "Division with a remainder",
  "core.fractions-of-a-whole": "Fractions of a whole",
  "core.linear-equations": "Linear equations",
  "core.multiplication-table": "Multiplication table",
};
