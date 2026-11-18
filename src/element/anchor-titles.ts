// Written by scripts/taxonomy.ts from the format file of a release of spec, verified by spec's
// release-verify and held by its sha256 since: `just taxonomy` writes it anew (R09 in
// docs/decisions.md). Do not edit it by hand: ci-lint checks it against the file.

/** The format file the titles come from, and its digest. */
export const SOURCE = {
  release: "spec v0.18.27",
  file: "format-0.4.tar.gz",
  sha256: "0f1e45b146d874473c1cf7646215f84b2a56828f0d89a05987934df15af3a91f",
} as const;

/** The English title of each anchor skill of the shared taxonomy, by ID (R50 spec). */
export const ANCHOR_TITLES: Readonly<Record<string, string>> = {
  "core.division-with-remainder": "Division with a remainder",
  "core.fractions-of-a-whole": "Fractions of a whole",
  "core.linear-equations": "Linear equations",
  "core.multiplication-table": "Multiplication table",
};
