import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  GENERATION_CONTROL_FILENAMES,
  buildGenerationControlsToDirectory,
  parseGenerationControlArgs,
} from "./generation-controls-lib.mjs";

export async function main(argv = process.argv.slice(2)) {
  const options = parseGenerationControlArgs(argv);
  const result = await buildGenerationControlsToDirectory(options);

  console.log(`Built generation controls from ${result.publicationDir}`);
  console.log(`Wrote internal controls to ${result.outputDir}`);

  for (const [key, filename] of Object.entries(GENERATION_CONTROL_FILENAMES)) {
    const rowCount = result.controls[key].length;
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
