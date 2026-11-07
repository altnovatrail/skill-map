// Runs inside a frame whose Content-Security-Policy allows styles and scripts from its own origin
// alone, as a strict consumer's would (the second amendment of 2026-11-02 to R36 spec): it draws the
// map of example/fair-shares and tells the test what the policy refused, on window.cspResult.

// The imports are static: Vitest rewrites a dynamic import() into a call of its runner, which this
// frame does not have. The element draws nothing until the map is assigned below, after the
// listener is in place.
import { GRAPH, MODULE, SKILL_MAP, TIERS } from "../core/fair-shares.fixture.js";
import { TAG } from "./index.js";

interface Result {
  readonly violations: readonly string[];
  readonly display: string;
  readonly sheets: number;
  readonly inline: number;
}

const violations: string[] = [];
document.addEventListener("securitypolicyviolation", (event) => {
  violations.push(event.violatedDirective);
});

const map = document.createElement(TAG);
map.setAttribute("view", "learner");
map.graph = GRAPH;
map.tiers = TIERS;
map.manifest = { id: MODULE, languages: { explanation: "en" } } as never;
map.skillMap = SKILL_MAP;
document.body.append(map);
// The map is drawn in a microtask after the assignments, and a violation is reported by a task
// queued while it is drawn: the second turn of the loop comes after both.
await new Promise((resolve) => setTimeout(resolve));
await new Promise((resolve) => setTimeout(resolve));

const root = map.shadowRoot as ShadowRoot;
const list = root.querySelector("ul") as HTMLUListElement;
const result: Result = {
  violations: [...violations],
  display: getComputedStyle(list).display,
  sheets: root.adoptedStyleSheets.length,
  inline: root.querySelectorAll("style, [style]").length,
};
(window as unknown as { cspResult: Result }).cspResult = result;
