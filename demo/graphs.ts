// The graphs the page draws (R12 in docs/decisions.md): example/fair-shares of the tests, the
// page's own graph of eight tiers, which no vector of the format has, then the modules of the first
// slice and spec's vectors of tiers, from virtual:demo-graphs. A vector has no manifest: the page
// gives it one of a module of its own name, in English, with one band.

import loaded from "virtual:demo-graphs";
import type { Manifest, SkillGraph } from "@altnovatrail/spec/formatv0/open";
import { GRAPH, MODULE, TIERS } from "../src/core/fair-shares.fixture.js";
import { EIGHT_TIERS, tiersOf } from "./eight-tiers.js";

/** A graph the page offers. */
export interface Choice {
  readonly name: string;
  readonly source: string;
  readonly graph: SkillGraph;
  readonly tiers: Readonly<Record<string, number>>;
  readonly manifest: Manifest;
}

/** A manifest of a module of the page's own, for a graph that comes without one. */
function manifestOf(id: string, title: string): Manifest {
  return {
    module_format_version: "0.3",
    id,
    version: "1.0.0",
    title,
    subject: "mathematics",
    audience: { grades: [3] },
    languages: { explanation: "en" },
    bands: [{ id: "b1", title: "Starter" }],
  } as unknown as Manifest;
}

export const CHOICES: readonly Choice[] = [
  {
    name: MODULE,
    source: "the tests' example, docs/architecture.md, section 3.2",
    graph: GRAPH,
    tiers: TIERS,
    manifest: manifestOf(MODULE, "Fair shares"),
  },
  {
    name: "example/eight-tiers",
    source: "the page's own, its tiers by the format's rule",
    graph: EIGHT_TIERS,
    tiers: tiersOf(EIGHT_TIERS),
    manifest: manifestOf("example/eight-tiers", "Eight tiers"),
  },
  ...loaded.map((graph) => ({
    ...graph,
    manifest: graph.manifest ?? manifestOf(`example/${graph.name}`, graph.name),
  })),
];
