import { expect, test } from "vitest";
import { configFor, RELEASED, RESOLUTIONS, releasedArchive } from "./consumer.ts";

test("the consumer is checked as Node and as a bundler resolve modules, strict, with no skipLibCheck", () => {
  expect(RESOLUTIONS).toEqual(["NodeNext", "Bundler"]);
  expect(configFor("NodeNext")).toMatchObject({
    compilerOptions: {
      module: "NodeNext",
      moduleResolution: "NodeNext",
      strict: true,
      skipLibCheck: false,
    },
    files: ["main.ts"],
  });
  expect(configFor("Bundler")).toMatchObject({
    compilerOptions: { module: "Preserve", moduleResolution: "Bundler", types: [] },
  });
});

const NAME = "@altnovatrail/skill-map";

test("the release's archive is the one archive of the package among its files, at any version", () => {
  expect(releasedArchive(["LICENSE", "SHA256SUMS", "altnovatrail-skill-map-0.1.3.tgz"], NAME)).toBe(
    "altnovatrail-skill-map-0.1.3.tgz",
  );
});

test("no archive of the package, or two, is no release to take", () => {
  expect(() => releasedArchive(["LICENSE", "altnovatrail-canvas-0.1.0.tgz"], NAME)).toThrow(
    `${RELEASED}/ holds 0 archives of ${NAME}, not one`,
  );
  expect(() =>
    releasedArchive(["altnovatrail-skill-map-0.1.0.tgz", "altnovatrail-skill-map-0.1.1.tgz"], NAME),
  ).toThrow("holds 2 archives");
});

test("an archive of another package whose name the stem begins, or of no version, is not the release's", () => {
  expect(() =>
    releasedArchive(
      ["altnovatrail-skill-map-extra-0.1.0.tgz", "altnovatrail-skill-map-x.tgz"],
      NAME,
    ),
  ).toThrow("holds 0 archives");
});
