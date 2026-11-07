import { expect, test } from "vitest";
import { headingLevel, languageOf, viewOf } from "./attributes.js";

test("view is learner or adult, and anything else, or nothing, is no view", () => {
  expect(viewOf("learner")).toBe("learner");
  expect(viewOf("adult")).toBe("adult");
  for (const other of [null, "", "Learner", "child", " adult"]) expect(viewOf(other)).toBeNull();
});

test("the level of headings is 2 to 6 as written, and 3 otherwise", () => {
  expect(["2", "3", "4", "5", "6"].map(headingLevel)).toEqual([2, 3, 4, 5, 6]);
  for (const other of [null, "", "1", "7", "02", "3.0", " 4", "four"]) {
    expect(headingLevel(other)).toBe(3);
  }
});

const KNOWN = new Set(["en", "ru", "zh-hant"]);

test("the language is found by cutting the tag from its end, whatever its case", () => {
  expect(languageOf("ru", KNOWN)).toBe("ru");
  expect(languageOf("ru-RU", KNOWN)).toBe("ru");
  expect(languageOf("RU-Cyrl-RU", KNOWN)).toBe("ru");
  expect(languageOf("en-GB", KNOWN)).toBe("en");
  expect(languageOf("zh-Hant-TW", KNOWN)).toBe("zh-hant");
});

test("a single subtag goes with what follows it: x and an extension mean nothing alone", () => {
  expect(languageOf("ru-x-school", KNOWN)).toBe("ru");
  expect(languageOf("ru-u-nu-latn", KNOWN)).toBe("ru");
  expect(languageOf("zh-hant-x-a", KNOWN)).toBe("zh-hant");
});

test("without the attribute, or with no language of the package in it, none", () => {
  for (const other of [null, "", "de", "de-DE", "zh", "constructor", "-", "x-ru", "r"]) {
    expect(languageOf(other, KNOWN)).toBeNull();
  }
});
