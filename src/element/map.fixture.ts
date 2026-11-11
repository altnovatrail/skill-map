// What the element's tests share: the manifest of example/fair-shares, a map mounted on the page
// with its data, the tiles found by their role and name, and the device's time held at the
// fixture's NOW. useMap registers the hooks that hold the time and take the map off after a test.

import { afterEach, beforeEach, vi } from "vitest";
import { page } from "vitest/browser";
import { GRAPH, MODULE, NOW, SKILL_MAP, TIERS } from "../core/fair-shares.fixture.js";
import { type NovatrailSkillMap, TAG } from "./index.js";

export const MANIFEST = {
  module_format_version: "0.4",
  id: MODULE,
  version: "1.0.0",
  title: "Fair shares",
  subject: "mathematics",
  audience: { grades: [2] },
  languages: { explanation: "en" },
  bands: [{ id: "b1", title: "Starter" }],
} as unknown as NovatrailSkillMap["manifest"];

/** Lets the element follow what was assigned: it updates once, after the task. */
export const settled = () => new Promise((resolve) => setTimeout(resolve));

let map: NovatrailSkillMap | undefined;

/** The learner's view, the attributes a test mounts the map with unless it names others. */
const LEARNER: Readonly<Record<string, string>> = { view: "learner" };

/** A map of example/fair-shares on the page, with the attributes and the state given. */
export async function mount(
  attributes: Readonly<Record<string, string>> = LEARNER,
  state: NovatrailSkillMap["skillMap"] = SKILL_MAP,
  parent: HTMLElement = document.body,
): Promise<NovatrailSkillMap> {
  map = document.createElement(TAG);
  for (const [name, value] of Object.entries(attributes)) map.setAttribute(name, value);
  map.graph = GRAPH;
  map.tiers = TIERS;
  map.manifest = MANIFEST;
  map.skillMap = state;
  parent.append(map);
  await settled();
  return map;
}

/** A map the test builds itself, taken off after it as a mounted one is. */
export function adopt(element: NovatrailSkillMap): NovatrailSkillMap {
  map = element;
  return element;
}

/** The map the test mounted last. */
export function mounted(): NovatrailSkillMap {
  if (map === undefined) throw new Error("no map is mounted");
  return map;
}

export const tile = (name: string) => page.getByRole("button", { name, exact: true });
export const button = (name: string) => tile(name).element() as HTMLButtonElement;
export const shadow = () => mounted().shadowRoot as ShadowRoot;

/** The hooks of a file of the element's tests: the time held at NOW, and the map taken off. */
export function useMap(): void {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(NOW);
  });
  afterEach(() => {
    map?.remove();
    map = undefined;
    vi.useRealTimers();
  });
}
