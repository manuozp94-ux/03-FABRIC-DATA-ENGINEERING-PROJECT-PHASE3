import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { buildDimensionsToDirectory } from "../../platform/fabric/automation/dimension-build-lib.mjs";
import {
  REQUIRED_ARTIFACT_FILENAMES,
  syncCurrentPackageToPublicSite,
} from "../../platform/fabric/automation/sync-current-package-to-public-site.mjs";

const FIXED_TIMESTAMP = "2026-03-29T00:22:41.942Z";

test("syncs only the approved current package artifacts into the public-site mirror", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "fabric-publication-sync-"));
  const sourcePackageDir = path.join(tempRoot, "current");
  const destinationDir = path.join(tempRoot, "web", "current");

  try {
    await buildDimensionsToDirectory({
      outputDir: sourcePackageDir,
      loadTimestampUtc: FIXED_TIMESTAMP,
    });

    await mkdir(destinationDir, { recursive: true });
    await writeFile(path.join(destinationDir, "stale.json"), "{\"old\":true}\n", "utf8");

    const result = await syncCurrentPackageToPublicSite({
      sourcePackageDir,
      destinationDir,
      unsafeAllowExternalSource: true,
      unsafeAllowExternalDestination: true,
    });

    assert.deepEqual(result.syncedArtifacts, REQUIRED_ARTIFACT_FILENAMES);

    const destinationFiles = (await readdir(destinationDir)).sort();
    assert.deepEqual(destinationFiles, REQUIRED_ARTIFACT_FILENAMES);

    const sourceProduct = await readFile(path.join(sourcePackageDir, "dim_product.json"), "utf8");
    const destinationProduct = await readFile(
      path.join(destinationDir, "dim_product.json"),
      "utf8",
    );
    assert.equal(destinationProduct, sourceProduct);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("fails closed and preserves the destination mirror when source artifacts are not approved", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "fabric-publication-sync-invalid-"));
  const sourcePackageDir = path.join(tempRoot, "current");
  const destinationDir = path.join(tempRoot, "web", "current");

  try {
    await buildDimensionsToDirectory({
      outputDir: sourcePackageDir,
      loadTimestampUtc: FIXED_TIMESTAMP,
    });

    await mkdir(destinationDir, { recursive: true });
    await writeFile(path.join(destinationDir, "sentinel.json"), "{\"keep\":true}\n", "utf8");
    await writeFile(path.join(sourcePackageDir, "unexpected.txt"), "unsafe\n", "utf8");

    await assert.rejects(
      syncCurrentPackageToPublicSite({
        sourcePackageDir,
        destinationDir,
        unsafeAllowExternalSource: true,
        unsafeAllowExternalDestination: true,
      }),
      /unexpected artifacts/,
    );

    const destinationFiles = await readdir(destinationDir);
    assert.deepEqual(destinationFiles, ["sentinel.json"]);
    const sentinel = await readFile(path.join(destinationDir, "sentinel.json"), "utf8");
    assert.equal(sentinel, "{\"keep\":true}\n");
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("rejects non-approved source packages before the destination mirror changes", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "fabric-publication-sync-source-boundary-"));
  const sourcePackageDir = path.join(tempRoot, "candidate");
  const destinationDir = path.join(tempRoot, "web", "current");

  try {
    await buildDimensionsToDirectory({
      outputDir: sourcePackageDir,
      loadTimestampUtc: FIXED_TIMESTAMP,
    });

    await mkdir(destinationDir, { recursive: true });
    await writeFile(path.join(destinationDir, "sentinel.json"), "{\"keep\":true}\n", "utf8");

    await assert.rejects(
      syncCurrentPackageToPublicSite({
        sourcePackageDir,
        destinationDir,
        unsafeAllowExternalDestination: true,
      }),
      /non-approved source package/,
    );

    const destinationFiles = await readdir(destinationDir);
    assert.deepEqual(destinationFiles, ["sentinel.json"]);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("rejects non-approved destination mirrors before any external path is modified", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "fabric-publication-sync-destination-boundary-"));
  const sourcePackageDir = path.join(tempRoot, "current");
  const destinationDir = path.join(tempRoot, "web", "outside");

  try {
    await buildDimensionsToDirectory({
      outputDir: sourcePackageDir,
      loadTimestampUtc: FIXED_TIMESTAMP,
    });

    await assert.rejects(
      syncCurrentPackageToPublicSite({
        sourcePackageDir,
        destinationDir,
        unsafeAllowExternalSource: true,
      }),
      /non-approved destination mirror/,
    );

    await assert.rejects(readdir(destinationDir), { code: "ENOENT" });
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});
