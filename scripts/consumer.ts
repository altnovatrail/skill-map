// After just build: the package's declarations the way a consumer's TypeScript takes them (R09 in
// docs/decisions.md).
//
//   node scripts/consumer.ts             the archive npm pack makes of the tree, in ci-test
//   node scripts/consumer.ts --release   the archive just release-files wrote into dist/
//
// npm pack makes the package's archive, which is unpacked into a folder of its own as a consumer's
// node_modules would hold it, beside the packages of spec it names, linked from this repository's.
// Then tsc checks scripts/consumer/main.ts there twice, as NodeNext and as Bundler resolve modules,
// strict and without skipLibCheck: the element's name gives its type, the properties take the
// types of data, the event's type holds on the element and on the document, and what is wrong is
// refused. With --release it takes the archive that goes out, at the release's version, rather
// than packing one (R13): the one archive of the package in RELEASED, a folder the script names
// itself, so that nothing of the command line goes into a path. Run from the repository's root,
// after the build.

import { execFileSync } from "node:child_process";
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { archiveStem } from "./release.ts";
import { TAR } from "./tar.ts";

/** Where just release-files writes the release's files, the archive among them. */
export const RELEASED = "dist";

/**
 * The archive of the package among the release's files: the one file npm pack names for it, at a
 * version MAJOR.MINOR.PATCH — `altnovatrail-skill-map-0.1.0.tgz`. None, or more than one, is no
 * release to take.
 */
export function releasedArchive(files: readonly string[], name: string): string {
  const stem = archiveStem(name);
  const archives = files.filter(
    (file) => file.startsWith(stem) && /^\d+\.\d+\.\d+\.tgz$/.test(file.slice(stem.length)),
  );
  if (archives.length !== 1) {
    throw new Error(`${RELEASED}/ holds ${archives.length} archives of ${name}, not one`);
  }
  return archives[0] as string;
}

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

/** The archive npm pack makes of the tree, in the folder given. */
function packed(folder: string): string {
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
  const made = JSON.parse(
    execFileSync(
      process.execPath,
      [npm, "pack", "--json", "--ignore-scripts", "--pack-destination", folder],
      { encoding: "utf8" },
    ),
  ) as { filename: string }[];
  return join(folder, made[0]?.filename ?? "");
}

function main(release: boolean): void {
  const repository = process.cwd();
  const folder = mkdtempSync(join(tmpdir(), "consumer-"));
  try {
    const { name } = JSON.parse(readFileSync("package.json", "utf8")) as { name: string };
    const archive = release
      ? join(repository, RELEASED, releasedArchive(readdirSync(RELEASED), name))
      : packed(folder);
    console.log(`consumer: ${basename(archive)}`);
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
    const argument = process.argv[2];
    if (argument !== undefined && argument !== "--release") {
      throw new Error(`${argument} is no argument of it: none, or --release`);
    }
    main(argument === "--release");
  } catch (error) {
    // tsc has printed what does not hold; anything else failed before it ran, and says what.
    console.log(`consumer: ${(error as Error).message}`);
    process.exitCode = 1;
  }
}
