import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  FINANCIAL_FOUNDATION_FILENAMES,
  buildFinancialFoundationToDirectory,
  parseFinancialFoundationArgs,
} from "./financial-analytics-lib.mjs";

export async function main(argv = process.argv.slice(2)) {
  const options = parseFinancialFoundationArgs(argv);
  const result = await buildFinancialFoundationToDirectory(options);

  console.log(`Built financial analytics foundation from ${result.publicationDir}`);
  console.log(`Using financial controls from ${result.controlsDir}`);
  console.log(`Wrote financial foundation tables to ${result.outputDir}`);
  console.log(`Wrote financial foundation report to ${result.reportPath}`);

  for (const [key, filename] of Object.entries(FINANCIAL_FOUNDATION_FILENAMES)) {
    console.log(`- ${filename}: ${result.foundation[key].length} rows`);
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
