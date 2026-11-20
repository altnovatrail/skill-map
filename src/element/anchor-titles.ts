// Written by scripts/taxonomy.ts from the format file of a release of spec, verified by spec's
// release-verify and held by its sha256 since: `just taxonomy` writes it anew (R09). Do not
// edit it by hand: ci-lint checks it against the file.

/** The format file the titles come from, and its digest. */
export const SOURCE = {
  release: "spec v0.19.4",
  file: "format-0.4.tar.gz",
  sha256: "606f44318c629d240d018ccf68cd56028c9e088d05b4f9fd4dd6882d2d4cb20e",
} as const;

/** The English title of each anchor skill of the shared taxonomy, by ID (R50 spec). */
export const ANCHOR_TITLES: Readonly<Record<string, string>> = {
  "core.division-with-remainder": "Division with a remainder",
  "core.fractions-of-a-whole": "Fractions of a whole",
  "core.linear-equations": "Linear equations",
  "core.multiplication-table": "Multiplication table",
};
