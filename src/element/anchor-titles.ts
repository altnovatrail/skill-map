// Written by scripts/taxonomy.ts from the format file of a release of spec, verified by spec's
// release-verify and held by its sha256 since: `just taxonomy` writes it anew. Do not
// edit it by hand: ci-lint checks it against the file.

/** The format file the titles come from, and its digest. */
export const SOURCE = {
  release: "spec v0.19.17",
  file: "format-0.4.tar.gz",
  sha256: "b7b87661dc69eed3c85142d8aba8c452327b22e4bf9a392c1b59e54e0289f551",
} as const;

/** The English title of each anchor skill of the shared taxonomy, by ID. */
export const ANCHOR_TITLES: Readonly<Record<string, string>> = {
  "core.division-with-remainder": "Division with a remainder",
  "core.fractions-of-a-whole": "Fractions of a whole",
  "core.linear-equations": "Linear equations",
  "core.multiplication-table": "Multiplication table",
};
