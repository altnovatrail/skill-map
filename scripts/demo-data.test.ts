import { readFileSync } from "node:fs";
import { expect, test } from "vitest";
import { RELEASE } from "../demo/release.ts";
import {
  indexEntries,
  MODULES,
  openPackage,
  render,
  sha256Of,
  TARGET,
  URLS,
  vectorOf,
} from "./demo-data.ts";

const bytes = (text: string) => new TextEncoder().encode(text);

const INDEX = bytes(
  JSON.stringify({
    module_format_version: "0.4",
    modules: {
      "z/last": {
        "0.1.0": { module_format_version: "0.4", package_digest: "sha256:z", release: "v0.1.0" },
      },
      "a/first": {
        "0.9.0": { module_format_version: "0.4", package_digest: "sha256:old", release: "v0.1.0" },
        "0.10.0": { module_format_version: "0.4", package_digest: "sha256:new", release: "v0.2.0" },
        "0.11.0": { module_format_version: "0.4", package_digest: "sha256:no-release" },
        "1.0.0": {
          module_format_version: "0.4",
          package_digest: "sha256:gone",
          withdrawn: { reason: "x" },
        },
        "2.0.0": { module_format_version: "0.9", package_digest: "sha256:later" },
      },
      "b/none": { "1.0.0": { module_format_version: "0.9", package_digest: "sha256:b" } },
    },
  }),
);

test("the index is the pinned one, and gives each module its latest version that is readable, not withdrawn and held by a release", () => {
  expect(indexEntries(INDEX, sha256Of(INDEX))).toEqual([
    { id: "a/first", version: "0.10.0", digest: "sha256:new", release: "v0.2.0" },
    { id: "z/last", version: "0.1.0", digest: "sha256:z", release: "v0.1.0" },
  ]);
  expect(() => indexEntries(INDEX, "0".repeat(64))).toThrow(
    `module-index.json is sha256 ${sha256Of(INDEX)}, not ${"0".repeat(64)}`,
  );
});

const SERVER = bytes(
  JSON.stringify({
    manifest: { id: "a/first" },
    skill_graph: { tiers: ["One"], skills: { s: { title: "S" } }, retired_skills: { r: {} } },
    skill_tiers: { s: 1 },
    tasks: {},
  }),
);
const INVENTORY = bytes(
  JSON.stringify({ server_part: { digest: `sha256:${sha256Of(SERVER)}`, size: SERVER.length } }),
);
const DIGEST = `sha256:${sha256Of(INVENTORY)}`;

test("a package gives its manifest, the open view of its graph and its tiers along the chain of digests", () => {
  expect(openPackage(INVENTORY, SERVER, DIGEST)).toEqual({
    manifest: { id: "a/first" },
    graph: { tiers: ["One"], skills: { s: { title: "S" } } },
    tiers: { s: 1 },
  });
});

test("a link of the chain that does not hold refuses the package: an inventory or a server part changed", () => {
  const changed = (from: Uint8Array) => {
    const copy = from.slice();
    copy[copy.length - 2] = (copy[copy.length - 2] ?? 0) ^ 1;
    return copy;
  };
  expect(() => openPackage(changed(INVENTORY), SERVER, DIGEST)).toThrow(
    `inventory.json is not the package ${DIGEST} the index names`,
  );
  expect(() => openPackage(INVENTORY, changed(SERVER), DIGEST)).toThrow(
    `server.json of ${DIGEST} is not the server part its inventory names`,
  );
});

test("a vector of tiers gives its graph and its tiers, and one without them is refused", () => {
  const vector = vectorOf(
    "chain",
    "# a note\nskill_graph:\n  skills:\n    a: { title: A, assessability: verdict }\nskill_tiers:\n  a: 1\n",
  );
  expect(vector).toEqual({
    name: "chain",
    source: "spec v0.15.0, format/vectors/tiers/chain.yaml",
    graph: { skills: { a: { title: "A", assessability: "verdict" } } },
    tiers: { a: 1 },
    manifest: null,
  });
  expect(() => vectorOf("empty", "skill_graph: {}\n")).toThrow(
    "has no skill_graph and skill_tiers",
  );
});

test("the pinned digest in the demo is what render writes for it, and names the release the script reads", () => {
  expect(RELEASE.sha256).toMatch(/^[0-9a-f]{64}$/);
  expect(readFileSync(TARGET, "utf8")).toBe(render(RELEASE.sha256));
  expect(RELEASE.release).toBe(`${MODULES.repository} ${MODULES.tag}`);
  expect(URLS).toEqual([
    "https://github.com/altnovatrail/modules/releases/download/v0.2.5/module-index.json",
    "https://github.com/altnovatrail/modules/releases/download/v0.2.5/module-index.json.sigstore.json",
  ]);
});
