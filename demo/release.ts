// Written by scripts/demo-data.ts from the module index of a release of modules, verified by
// spec's release-verify and held by its sha256 since: `just demo-pin` writes it anew (R12 in
// docs/decisions.md). Do not edit it by hand.

/** The module index the demo's graphs come from, and its digest. */
export const RELEASE = {
  release: "modules v0.2.5",
  file: "module-index.json",
  sha256: "cebf23cf94456ef313ca00c97ca05db7fccb2575780f8dfd899623ea60aaec6a",
} as const;
