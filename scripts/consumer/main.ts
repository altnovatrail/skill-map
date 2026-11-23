// What a consumer writes, type-checked by scripts/consumer.ts against the package as npm pack makes
// it: never built, and never checked by the repository's own programs.
import "@altnovatrail/skill-map";
import type { GetSkillMapResponse } from "@altnovatrail/contracts/novatrail/api/v1/progress_pb.js";
import type {
  NovatrailSkillMap,
  SkillChoose,
  SkillChooseEvent,
  SkillMapView,
} from "@altnovatrail/skill-map";
import { type SkillStatus, skillStates } from "@altnovatrail/skill-map/states";
import type { Manifest, SkillGraph } from "@altnovatrail/spec/formatv0/open";

declare const graph: SkillGraph;
declare const manifest: Manifest;
declare const skillMap: GetSkillMapResponse;

// The element's name gives the element's type.
const map: NovatrailSkillMap = document.createElement("novatrail-skill-map");
map.graph = graph;
map.tiers = { "count-objects": 1 };
map.manifest = manifest;
map.skillMap = skillMap;
map.skillMap = null;
const view: SkillMapView = "learner";
map.setAttribute("view", view);

// The event's type holds on the element and on the document alike.
map.addEventListener("skillchoose", (event) => {
  const chosen: SkillChooseEvent = event;
  const skill: string = chosen.detail.skill;
  console.log(skill);
});
document.addEventListener("skillchoose", (event) => {
  const detail: SkillChoose = event.detail;
  console.log(detail.skill);
});

// @ts-expect-error The state is the contract's answer, not any object.
map.skillMap = { skills: [] };
// @ts-expect-error A tier is a number.
map.tiers = { "count-objects": "1" };
// @ts-expect-error The detail is read only.
document.addEventListener("skillchoose", (event) => (event.detail.skill = ""));

// The rule of the states, for the module card: the same data in, a state or a mark per skill out.
const statuses: ReadonlyMap<string, SkillStatus> = skillStates(graph, skillMap, new Date());
const shown: SkillStatus | undefined = statuses.get("count-objects");
console.log(shown);
// @ts-expect-error The card has the answer: a map without state is the element's alone.
skillStates(graph, null, new Date());
// @ts-expect-error A state is one of the seven values, not any word.
const word: SkillStatus = "open";
console.log(word);
