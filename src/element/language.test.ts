import { describe, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import type { SkillChooseEvent } from "./index.js";
import { button, mount, mounted, settled, shadow, tile, useMap } from "./map.fixture.js";

// The map in Russian, by its own attribute lang (R91 spec, R92 spec; R10 in docs/decisions.md):
// the package's words are Russian, the titles stay in the explanation language, and an anchor
// skill's title in English.

useMap();

const details = () => shadow().getElementById("details")?.textContent ?? "";

describe("lang=ru", () => {
  test("the headings, the tiles and the map's language are Russian, and the titles are not", async () => {
    await mount({ view: "learner", lang: "ru" });
    expect([...shadow().querySelectorAll("h3")].map((heading) => heading.textContent)).toEqual([
      "Навыки других модулей",
      "Ярус 1 · Counting",
      "Ярус 2 · Sharing",
      "Ярус 3",
    ]);
    await expect.element(tile("Quarters, Ещё закрыт")).toBeVisible();
    await expect.element(tile("Multiplication table, Владеет")).toBeVisible();
    await expect.element(tile("Draw shares, Без оценки")).toBeVisible();
    expect(shadow().querySelector(".map")?.getAttribute("lang")).toBe("ru");
    expect(button("Quarters, Ещё закрыт").querySelector(".title")?.getAttribute("lang")).toBe("en");
  });

  test("a locked skill waits in Russian, and an open one is chosen by Заниматься", async () => {
    await mount({ view: "learner", lang: "ru" });
    await userEvent.click(tile("Quarters, Ещё закрыт"));
    expect(details()).toContain("Ждёт: Halves");
    expect(details()).toContain("Опирается на");
    await expect.element(tile("Halves, В работе, нужен раньше")).toBeVisible();
    await userEvent.click(tile("Share with a remainder, Можно начинать"));
    let chosen: string | undefined;
    mounted().addEventListener("skillchoose", (event: SkillChooseEvent) => {
      chosen = event.detail.skill;
    });
    await userEvent.click(page.getByRole("button", { name: "Заниматься" }));
    expect(chosen).toBe("example/fair-shares/skill/share-with-remainder");
  });

  test("the adult's numbers and days are Russian", async () => {
    await mount({ view: "adult", lang: "ru" });
    await userEvent.click(tile("Count objects, Освоено"));
    const day = new Intl.DateTimeFormat("ru", { dateStyle: "medium" }).format(
      new Date("2026-11-20T00:00:00Z"),
    );
    expect(details()).toContain("9 ответов");
    expect(details()).toContain("Полоса освоения: Starter");
    expect(details()).toContain(`Повторить ${day}`);
  });

  test("an anchor skill's holding and reason are Russian", async () => {
    await mount({ view: "learner", lang: "ru" });
    await userEvent.click(tile("Halves, В работе"));
    expect(details()).toContain(
      "Fractions of a whole — Не владеет — не освоен навык, который ему учит",
    );
  });
});

test("a new lang changes the words in place: the focus and the expanded skill stay", async () => {
  await mount({ view: "learner" });
  const quarters = button("Quarters, Locked");
  await userEvent.click(quarters);
  expect(document.activeElement).toBe(mounted());
  expect(shadow().activeElement).toBe(quarters);
  mounted().setAttribute("lang", "ru-RU");
  await settled();
  expect(button("Quarters, Ещё закрыт")).toBe(quarters);
  expect(shadow().activeElement).toBe(quarters);
  expect(quarters.getAttribute("aria-expanded")).toBe("true");
  expect(details()).toContain("Ждёт: Halves");
  mounted().removeAttribute("lang");
  await settled();
  expect(button("Quarters, Locked")).toBe(quarters);
});
