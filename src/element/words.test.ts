import { expect, test } from "vitest";
import { formatsOf, formOf, type Plural, WORDS, type Words, wordsFor } from "./words.js";

/** The places of a template: {tier}, {skills}. */
const places = (text: string) => [...text.matchAll(/\{([a-z]+)\}/g)].map(([, name]) => name).sort();

/** Each phrase of a table by its key, the forms of a phrase with a number each by their own. */
function phrases(words: Words): Map<string, string> {
  const found = new Map<string, string>();
  const walk = (value: unknown, key: string) => {
    if (typeof value === "string") found.set(key, value);
    else if (typeof value === "object" && value !== null) {
      for (const [inner, item] of Object.entries(value)) walk(item, `${key}.${inner}`);
    }
  };
  walk(words, "");
  return found;
}

test("the package has its words in each language of the interface, English and Russian", () => {
  expect([...WORDS.keys()]).toEqual(["en", "ru"]);
  for (const [lang, words] of WORDS) expect(words.lang).toBe(lang);
});

test("each phrase of every language has the places English has, and a form other", () => {
  const english = phrases(wordsFor("en"));
  for (const words of WORDS.values()) {
    for (const [key, text] of phrases(words)) {
      // A form of a phrase with a number has the places of English's other.
      const base = key.replace(/^(\.evidence)\.[a-z]+$/, "$1.other");
      expect(places(text), `${words.lang}${key}`).toEqual(places(english.get(base) ?? ""));
    }
    for (const key of english.keys()) {
      if (!key.startsWith(".evidence.")) expect(phrases(words).has(key), key).toBe(true);
    }
    expect(words.evidence.other).toBeDefined();
  }
});

/** A phrase with a number as the language says it. */
function said(words: Words, phrase: Plural, count: number): string {
  return formOf(phrase, count, formatsOf(words)).replace("{count}", String(count));
}

test("Russian names the answers in the form CLDR gives each number", () => {
  const ru = wordsFor("ru");
  expect([0, 1, 2, 5, 11, 21, 22, 25, 111].map((count) => said(ru, ru.evidence, count))).toEqual([
    "0 ответов",
    "1 ответ",
    "2 ответа",
    "5 ответов",
    "11 ответов",
    "21 ответ",
    "22 ответа",
    "25 ответов",
    "111 ответов",
  ]);
  // A number without a form of its own takes other.
  expect(said(ru, { other: "{count} x" }, 1)).toBe("1 x");
});

test("English names one answer and many", () => {
  const en = wordsFor("en");
  expect([0, 1, 2].map((count) => said(en, en.evidence, count))).toEqual([
    "0 answers",
    "1 answer",
    "2 answers",
  ]);
});

test("the words are found by the attribute lang, and English stands in for the rest", () => {
  expect(wordsFor("ru-RU").lang).toBe("ru");
  expect(wordsFor("EN-gb").lang).toBe("en");
  expect(wordsFor("de").lang).toBe("en");
  expect(wordsFor(null).lang).toBe("en");
  expect(formatsOf(wordsFor("ru"))).toBe(formatsOf(wordsFor("ru-RU")));
});
