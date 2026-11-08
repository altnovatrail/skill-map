import { expect, test } from "vitest";
import { described, download } from "./download.ts";

const URL = "https://example.org/file";

/** A fetch that answers in turn, an error thrown or a status, and the pauses it was given. */
function scripted(answers: readonly (Error | number)[]) {
  const pauses: number[] = [];
  let calls = 0;
  const tries = {
    get: async () => {
      const answer = answers[calls++] ?? 200;
      if (answer instanceof Error) throw answer;
      return new Response(answer === 200 ? "bytes" : "", { status: answer });
    },
    pause: async (milliseconds: number) => {
      pauses.push(milliseconds);
    },
  };
  return { tries, pauses, calls: () => calls };
}

const failed = (code: string) => new TypeError("fetch failed", { cause: { code } });

test("a failure of the network is tried again, after pauses that grow, and the bytes come", async () => {
  const fetch = scripted([failed("ECONNRESET"), 503, 200]);
  const bytes = await download(URL, fetch.tries);
  expect(new TextDecoder().decode(bytes)).toBe("bytes");
  expect(fetch.pauses).toEqual([2000, 4000]);
});

test("after the last attempt the error names the URL, the cause and the attempts", async () => {
  const fetch = scripted([failed("ECONNREFUSED"), failed("ECONNREFUSED"), failed("ETIMEDOUT")]);
  await expect(download(URL, fetch.tries)).rejects.toThrow(
    `${URL}: fetch failed (ETIMEDOUT), after 3 attempts`,
  );
  expect(fetch.calls()).toBe(3);
});

test("an answer that will not change is not tried again", async () => {
  const fetch = scripted([404]);
  await expect(download(URL, fetch.tries)).rejects.toThrow(`${URL}: HTTP 404`);
  expect(fetch.calls()).toBe(1);
});

test("too many requests is tried again", async () => {
  const fetch = scripted([429, 200]);
  await expect(download(URL, fetch.tries)).resolves.toHaveLength(5);
});

test("a failure is described with its cause, its message or as it is", () => {
  expect(described(failed("ENOTFOUND"))).toBe("fetch failed (ENOTFOUND)");
  expect(described(new TypeError("fetch failed", { cause: new Error("socket hang up") }))).toBe(
    "fetch failed (socket hang up)",
  );
  expect(described(new Error("plain"))).toBe("plain");
  expect(described("text")).toBe("text");
});
