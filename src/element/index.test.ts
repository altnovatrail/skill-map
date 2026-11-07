import { expect, test, vi } from "vitest";
import { NovatrailSkillMap, TAG } from "./index.js";

test("importing the entry point registers <novatrail-skill-map> with an open shadow root", () => {
  expect(customElements.get(TAG)).toBe(NovatrailSkillMap);
  const element = document.createElement("novatrail-skill-map");
  expect(element).toBeInstanceOf(NovatrailSkillMap);
  expect(element.shadowRoot?.mode).toBe("open");
});

test("a second copy of the entry point leaves the first registration, throws nothing and says so", async () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  try {
    // A query makes the bundler load the module again, as a second copy of the package would be.
    const secondCopy = "./index.ts?second-copy";
    const second: { NovatrailSkillMap: unknown } = await import(/* @vite-ignore */ secondCopy);
    expect(second.NovatrailSkillMap).not.toBe(NovatrailSkillMap);
    expect(customElements.get(TAG)).toBe(NovatrailSkillMap);
    expect(warn).toHaveBeenCalledOnce();
  } finally {
    warn.mockRestore();
  }
});
