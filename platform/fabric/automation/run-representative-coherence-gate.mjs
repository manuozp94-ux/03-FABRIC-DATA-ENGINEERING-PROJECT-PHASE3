import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  parseRepresentativeCoherenceArgs,
  writeRepresentativeCoherenceReport,
} from "../validation/validate-representative-coherence.mjs";

export async function main(argv = process.argv.slice(2)) {
  const options = parseRepresentativeCoherenceArgs(argv);
  const report = await writeRepresentativeCoherenceReport(options);

  console.log(`Coherence gate status: ${report.promotion_status}`);
  console.log(`Wrote report: ${report.report_path}`);
  console.log(`Blocking failures: ${report.blocking_failure_count}`);

  if (!report.promotable) {
    process.exitCode = 1;
  }

  return report;
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
