// After just build: the package's declarations the way a consumer's TypeScript takes them (R09 in
// docs/decisions.md).
//
//   node scripts/consumer.ts
//
// npm pack makes the package's archive, which is unpacked into a folder of its own as a consumer's
// node_modules would hold it, beside the packages of spec it names, linked from this repository's.
// Then tsc checks scripts/consumer/main.ts there twice, as NodeNext and as Bundler resolve modules,
// strict and without skipLibCheck: the element's name gives its type, the properties take the
// types of data, the event's type holds on the element and on the document, and what is wrong is
// refused. Run from the repository's root, after the build.

import { execFileSync } from "node:child_process";
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { TAR } from "./tar.ts";

/** How a consumer's TypeScript resolves modules: as Node does, and as a bundler does. */
export const RESOLUTIONS = ["NodeNext", "Bundler"] as const;

/** The packages the declarations name, which a consumer has beside the package. */
const BESIDE = ["@altnovatrail/spec", "@altnovatrail/contracts", "@bufbuild/protobuf"];

/** The consumer's tsconfig.json for a resolution of modules. */
export function configFor(resolution: (typeof RESOLUTIONS)[number]): object {
  return {
    compilerOptions: {
      target: "ES2022",
      module: resolution === "NodeNext" ? "NodeNext" : "Preserve",
      moduleResolution: resolution,
      lib: ["ES2022", "DOM", "DOM.Iterable"],
      types: [],
      strict: true,
      noEmit: true,
      skipLibCheck: false,
    },
    files: ["main.ts"],
  };
}

function main(): void {
  const repository = process.cwd();
  const folder = mkdtempSync(join(tmpdir(), "consumer-"));
  try {
    // The npm that comes with this very Node, run by it.
    const npm = join(
      dirname(process.execPath),
      "..",
      "lib",
      "node_modules",
      "npm",
      "bin",
      "npm-cli.js",
    );
    const packed = JSON.parse(
      execFileSync(
        process.execPath,
        [npm, "pack", "--json", "--ignore-scripts", "--pack-destination", folder],
        { encoding: "utf8" },
      ),
    ) as { filename: string }[];
    const archive = join(folder, packed[0]?.filename ?? "");
    const target = join(folder, "node_modules", "@altnovatrail", "skill-map");
    mkdirSync(target, { recursive: true });
    execFileSync(TAR, ["-xzf", archive, "-C", target, "--strip-components=1"]);
    for (const name of BESIDE) {
      const link = join(folder, "node_modules", name);
      mkdirSync(dirname(link), { recursive: true });
      symlinkSync(realpathSync(join(repository, "node_modules", name)), link, "dir");
    }
    copyFileSync(join(repository, "scripts", "consumer", "main.ts"), join(folder, "main.ts"));
    writeFileSync(join(folder, "package.json"), `${JSON.stringify({ type: "module" })}\n`);
    const tsc = resolve(repository, "node_modules", ".bin", "tsc");
    for (const resolution of RESOLUTIONS) {
      writeFileSync(join(folder, "tsconfig.json"), JSON.stringify(configFor(resolution)));
      execFileSync(tsc, ["-p", folder], { stdio: "inherit" });
      console.log(`consumer: ${resolution}: ok`);
    }
  } finally {
    rmSync(folder, { recursive: true, force: true });
  }
}

if (import.meta.main) {
  try {
    main();
  } catch (error) {
    // tsc has printed what does not hold; anything else failed before it ran, and says what.
    console.log(`consumer: ${(error as Error).message}`);
    process.exitCode = 1;
  }
}
