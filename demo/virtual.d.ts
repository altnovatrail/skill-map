// The module the demo's Vite configuration gives: the graphs of the modules of the pinned index
// and of spec's vectors of tiers (R12 in docs/decisions.md).
declare module "virtual:demo-graphs" {
  import type { Manifest, SkillGraph } from "@altnovatrail/spec/formatv0/open";

  const graphs: readonly {
    readonly name: string;
    readonly source: string;
    readonly graph: SkillGraph;
    readonly tiers: Readonly<Record<string, number>>;
    /** The module's manifest; a vector has none. */
    readonly manifest: Manifest | null;
  }[];
  export default graphs;
}
