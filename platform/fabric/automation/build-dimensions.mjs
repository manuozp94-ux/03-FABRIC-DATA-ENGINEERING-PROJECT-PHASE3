import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  OUTPUT_FILENAMES,
  buildDimensionsToDirectory,
  parseBuildArgs,
} from "./dimension-build-lib.mjs";

export async function main(argv = process.argv.slice(2)) {
  const options = parseBuildArgs(argv);
  const result = await buildDimensionsToDirectory(options);

  console.log(`Built governed dimensions from ${result.sourceDir}`);
  console.log(`Wrote publication-safe outputs to ${result.outputDir}`);

  for (const [key, filename] of Object.entries(OUTPUT_FILENAMES)) {
    const rowCount = result.dimensions[key].length;
    console.log(`- ${filename}: ${rowCount} rows`);
  }

  return result;
}

const isEntrypoint =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isEntrypoint) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
