import { expect, test } from "vitest";
import { configFor, RESOLUTIONS } from "./consumer.ts";

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
