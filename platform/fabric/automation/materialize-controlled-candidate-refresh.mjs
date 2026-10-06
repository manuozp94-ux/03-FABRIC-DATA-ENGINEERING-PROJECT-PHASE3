import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  PUBLIC_OUTPUT_FILENAMES,
  buildControlledCandidatePackageToDirectory,
  parseControlledRefreshArgs,
} from "./controlled-candidate-refresh-lib.mjs";

export async function main(argv = process.argv.slice(2)) {
  const options = parseControlledRefreshArgs(argv);
  const result = await buildControlledCandidatePackageToDirectory(options);

  console.log(`Built controlled candidate refresh from ${result.approvedDir}`);
  console.log(`Used generation controls from ${result.controlsDir}`);
  console.log(`Wrote candidate outputs to ${result.outputDir}`);

  for (const [key, filename] of Object.entries(PUBLIC_OUTPUT_FILENAMES)) {
    const rowCount = result.candidatePackage[key].length;
    console.log(`- ${filename}: ${rowCount} rows`);
  }

  console.log(`Generated dates: ${result.candidatePackage.metadata.generated_dates.join(", ")}`);
  console.log(`Report: ${result.reportPath}`);

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
