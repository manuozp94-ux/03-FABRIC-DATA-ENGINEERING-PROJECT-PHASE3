import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  REPRESENTATIVE_PLAN_FILENAMES,
  REPRESENTATIVE_PUBLIC_FILENAMES,
  buildRepresentativeMarketToDirectory,
  parseRepresentativeMarketArgs,
} from "./representative-market-lib.mjs";

export async function main(argv = process.argv.slice(2)) {
  const options = parseRepresentativeMarketArgs(argv);
  const result = await buildRepresentativeMarketToDirectory(options);

  console.log(`Built representative public package from ${result.seedDir}`);
  console.log(`Wrote representative public tables to ${result.outputDir}`);
  console.log(`Wrote representative internal tables to ${result.internalDir}`);

  for (const [key, filename] of Object.entries(REPRESENTATIVE_PUBLIC_FILENAMES)) {
    console.log(`- ${filename}: ${result.representativePackage[key].length} rows`);
  }

  for (const [key, filename] of Object.entries(REPRESENTATIVE_PLAN_FILENAMES)) {
    const rowCount =
      result.seedArchetypes[key]?.length
      ?? result.plans[key]?.length
      ?? 0;
    console.log(`- ${filename}: ${rowCount} rows`);
  }

  return result;
}

const isEntrypoint =
  process.argv[1]
  && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isEntrypoint) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
