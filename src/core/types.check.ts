// Type-checked by ci-lint and never built: the types of the data the map draws resolve as the
// package's code imports them (R04; R08 in docs/decisions.md). The graph's open view comes from
// @altnovatrail/spec, a dependency of the package, since its declarations will name it. The state
// of the skills comes from @altnovatrail/contracts, a dependency of development: the package
// imports its types alone, and app, which holds it among its dependencies, gives them its own copy.
import type {
  AnchorSkillState,
  GetSkillMapResponse,
  SkillState,
} from "@altnovatrail/contracts/novatrail/api/v1/progress_pb.js";
import type { Manifest, SkillGraph } from "@altnovatrail/spec/formatv0/open";

export type Data = readonly [
  SkillGraph,
  Manifest,
  GetSkillMapResponse,
  SkillState,
  AnchorSkillState,
];
