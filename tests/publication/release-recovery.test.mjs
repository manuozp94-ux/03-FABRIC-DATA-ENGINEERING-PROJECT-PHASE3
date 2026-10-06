import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  captureReleaseRecoverySnapshot,
  executeReleaseRecovery,
} from "../../platform/fabric/automation/materialize-release-recovery-state.mjs";
import { materializeReleaseCommunications } from "../../platform/fabric/automation/materialize-release-communications.mjs";

const RELEASE_A = "rls_fab001_20260401t100000z";
const RELEASE_B = "rls_fab001_20260402t100000z";

test("captures a recoverable snapshot for the current approved release and updates the release record", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "fabric-release-recovery-capture-"));

  try {
    const ctx = await seedRecoveryFixture({ tempRoot, currentReleaseId: RELEASE_A, lastKnownGoodId: RELEASE_A });
    const result = await captureReleaseRecoverySnapshot({
      releaseLedgerDir: ctx.releaseLedgerDir,
      publicationDir: ctx.publicationDir,
      publicMirrorDir: ctx.publicMirrorDir,
      siteReleaseDataDir: ctx.siteReleaseDataDir,
      recordedAtUtc: "2026-04-02T21:00:00.000Z",
    });

    const snapshotManifest = JSON.parse(await readFile(result.snapshot_manifest_path, "utf8"));
    const releaseRecord = JSON.parse(await readFile(ctx.releaseRecordPaths[RELEASE_A], "utf8"));

    assert.equal(snapshotManifest.release_id, RELEASE_A);
    assert.equal(
      releaseRecord.recovery_inputs.recoverable_snapshot_reference.endsWith("snapshot-manifest.json"),
      true,
    );
    assert.equal(
      (await readFile(path.join(path.dirname(result.snapshot_manifest_path), "publication/current/dim_product.json"), "utf8")).includes("release-a-product"),
      true,
    );
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("restores the last-known-good approved snapshot and records a recovery report", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "fabric-release-recovery-exec-"));

  try {
    const ctx = await seedRecoveryFixture({ tempRoot, currentReleaseId: RELEASE_B, lastKnownGoodId: RELEASE_A });
    await captureReleaseRecoverySnapshot({
      releaseLedgerDir: ctx.releaseLedgerDir,
      publicationDir: ctx.snapshotSourceDirs[RELEASE_A].publicationDir,
      publicMirrorDir: ctx.snapshotSourceDirs[RELEASE_A].publicMirrorDir,
      siteReleaseDataDir: ctx.snapshotSourceDirs[RELEASE_A].siteReleaseDataDir,
      releaseId: RELEASE_A,
      recordedAtUtc: "2026-04-02T21:05:00.000Z",
    });

    const result = await executeReleaseRecovery({
      releaseLedgerDir: ctx.releaseLedgerDir,
      publicationDir: ctx.publicationDir,
      publicMirrorDir: ctx.publicMirrorDir,
      siteReleaseDataDir: ctx.siteReleaseDataDir,
      recordedAtUtc: "2026-04-02T21:10:00.000Z",
      restoreReason: "failed_release_detected",
    });

    const currentReleasePointer = JSON.parse(
      await readFile(path.join(ctx.releaseLedgerDir, "current-release.json"), "utf8"),
    );
    const releaseIndex = JSON.parse(
      await readFile(path.join(ctx.releaseLedgerDir, "release-index.json"), "utf8"),
    );
    const restoredProduct = JSON.parse(
      await readFile(path.join(ctx.publicationDir, "dim_product.json"), "utf8"),
    );
    const mirroredProduct = JSON.parse(
      await readFile(path.join(ctx.publicMirrorDir, "dim_product.json"), "utf8"),
    );
    const currentStatus = JSON.parse(
      await readFile(path.join(ctx.releaseLedgerDir, "current-operational-status.json"), "utf8"),
    );

    assert.equal(result.recovery_report.failed_release_id, RELEASE_B);
    assert.equal(result.recovery_report.restored_release_id, RELEASE_A);
    assert.equal(currentReleasePointer.release_id, RELEASE_A);
    assert.equal(releaseIndex.current_release_id, RELEASE_A);
    assert.equal(restoredProduct[0].product_name, "release-a-product");
    assert.equal(mirroredProduct[0].product_name, "release-a-product");
    assert.equal(currentStatus.release_id, RELEASE_A);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("fails closed when the restore target does not have a recoverable snapshot manifest", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "fabric-release-recovery-blocked-"));

  try {
    const ctx = await seedRecoveryFixture({ tempRoot, currentReleaseId: RELEASE_B, lastKnownGoodId: RELEASE_A });

    await assert.rejects(
      () =>
        executeReleaseRecovery({
          releaseLedgerDir: ctx.releaseLedgerDir,
          publicationDir: ctx.publicationDir,
          publicMirrorDir: ctx.publicMirrorDir,
          siteReleaseDataDir: ctx.siteReleaseDataDir,
          recordedAtUtc: "2026-04-02T21:10:00.000Z",
        }),
      /requires a recoverable snapshot manifest/i,
    );
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

async function seedRecoveryFixture({ tempRoot, currentReleaseId, lastKnownGoodId }) {
  const releaseLedgerDir = path.join(tempRoot, "release-ledger");
  const releaseRecordDir = path.join(releaseLedgerDir, "releases");
  const publicationDir = path.join(tempRoot, "platform", "fabric", "publication", "current");
  const publicMirrorDir = path.join(tempRoot, "apps", "public-site", "src", "data", "publication", "current");
  const siteReleaseDataDir = path.join(tempRoot, "apps", "public-site", "src", "data", "release");
  const releaseRecordPaths = {
    [RELEASE_A]: path.join(releaseRecordDir, `${RELEASE_A}.json`),
    [RELEASE_B]: path.join(releaseRecordDir, `${RELEASE_B}.json`),
  };

  const snapshotSourceDirs = {
    [RELEASE_A]: {
      publicationDir: path.join(tempRoot, "snapshots-source", RELEASE_A, "publication", "current"),
      publicMirrorDir: path.join(tempRoot, "snapshots-source", RELEASE_A, "site", "data", "publication", "current"),
      siteReleaseDataDir: path.join(tempRoot, "snapshots-source", RELEASE_A, "site", "data", "release"),
    },
  };

  await writeReleaseRecord(releaseRecordPaths[RELEASE_A], buildReleaseRecord(RELEASE_A, "2026-04-01T10:00:00.000Z"));
  await writeReleaseRecord(releaseRecordPaths[RELEASE_B], buildReleaseRecord(RELEASE_B, "2026-04-02T10:00:00.000Z"));

  const releases = [RELEASE_B, RELEASE_A].map((releaseId) => ({
    release_id: releaseId,
    release_state: "published_approved",
    recorded_at_utc: releaseId === RELEASE_A ? "2026-04-01T10:00:00.000Z" : "2026-04-02T10:00:00.000Z",
    approved_refresh_timestamp_utc: releaseId === RELEASE_A ? "2026-04-01T09:00:00.000Z" : "2026-04-02T09:00:00.000Z",
    proof_refresh_status: "live_refresh_completed",
    coherence_promotion_status: "coherence_approved",
    runtime_execution_mode: "pipeline_notebook_activity",
    active_public_source_mode: "repo_mirror_transitional",
    serving_extract_status: "not_materialized",
    runtime_reconciliation_status: "aligned",
    release_record_path: releaseRecordPaths[releaseId],
  }));

  await writeJson(path.join(releaseLedgerDir, "release-index.json"), {
    generated_at_utc: "2026-04-02T10:00:00.000Z",
    current_release_id: currentReleaseId,
    last_known_good_release_id: lastKnownGoodId,
    releases,
  });
  await writeJson(path.join(releaseLedgerDir, "current-release.json"), {
    role: "current",
    release_id: currentReleaseId,
    release_record_path: releaseRecordPaths[currentReleaseId],
    recorded_at_utc: "2026-04-02T10:00:00.000Z",
  });
  await writeJson(path.join(releaseLedgerDir, "last-known-good-release.json"), {
    role: "last_known_good",
    release_id: lastKnownGoodId,
    release_record_path: releaseRecordPaths[lastKnownGoodId],
    recorded_at_utc: "2026-04-02T10:00:00.000Z",
  });

  await seedPublicationSurfaces(publicationDir, currentReleaseId);
  await seedPublicationSurfaces(publicMirrorDir, currentReleaseId);
  await materializeReleaseCommunications({
    releaseLedgerDir,
    siteDataDir: siteReleaseDataDir,
    releaseId: currentReleaseId,
    recordedAtUtc: "2026-04-02T10:10:00.000Z",
  });

  await seedPublicationSurfaces(snapshotSourceDirs[RELEASE_A].publicationDir, RELEASE_A);
  await seedPublicationSurfaces(snapshotSourceDirs[RELEASE_A].publicMirrorDir, RELEASE_A);
  await materializeReleaseCommunications({
    releaseLedgerDir,
    siteDataDir: snapshotSourceDirs[RELEASE_A].siteReleaseDataDir,
    releaseId: RELEASE_A,
    recordedAtUtc: "2026-04-02T10:15:00.000Z",
  });

  return {
    releaseLedgerDir,
    publicationDir,
    publicMirrorDir,
    siteReleaseDataDir,
    releaseRecordPaths,
    snapshotSourceDirs,
  };
}

function buildReleaseRecord(releaseId, recordedAtUtc) {
  return {
    release_id: releaseId,
    release_state: "published_approved",
    recorded_at_utc: recordedAtUtc,
    approved_data_state: {
      approved_refresh_timestamp_utc: recordedAtUtc,
    },
    validation_state: {
      coherence_promotion_status: "coherence_approved",
      coherence_promotable: true,
      proof_refresh_status: "live_refresh_completed",
      proof_refresh_completed_at_utc: recordedAtUtc,
      runtime_reconciliation_status: "aligned",
      runtime_traceability_complete: true,
    },
    public_proof_assets: {
      active_public_source_mode: "repo_mirror_transitional",
      active_public_source_reference: "apps/public-site/src/data/publication/current",
      target_public_source_mode: "fabric_serving_extract",
      target_public_source_reference: "fabric_public_serving_extract_pending",
      public_routes: ["/", "/case-study", "/technical-method", "/contact"],
    },
    runtime_execution_state: {
      runtime_execution_mode: "pipeline_notebook_activity",
      public_source_state: {
        active_mode: "repo_mirror_transitional",
        target_mode: "fabric_serving_extract",
        serving_extract_status: "not_materialized",
        serving_extract_produced: false,
        active_reference: "apps/public-site/src/data/publication/current",
        target_reference: "fabric_public_serving_extract_pending",
        serving_extract_artifact_path: "",
      },
    },
    recovery_inputs: {},
  };
}

async function writeReleaseRecord(filePath, value) {
  await writeJson(filePath, value);
}

async function seedPublicationSurfaces(dir, releaseId) {
  await mkdir(dir, { recursive: true });
  const suffix = releaseId === RELEASE_A ? "release-a-product" : "release-b-product";

  const files = {
    "dim_product.json": [{ product_name: suffix }],
    "dim_product_family.json": [{ product_family_name: "Family" }],
    "dim_account.json": [{ account_name: "Account" }],
    "dim_inventory_location.json": [{ location_name: "Location" }],
    "fact_demand_line.json": [{ demand_line_sk: `${releaseId}-d1` }],
    "fact_inventory_inbound.json": [{ inventory_inbound_sk: `${releaseId}-i1` }],
    "fact_inventory_snapshot.json": [{ inventory_snapshot_sk: `${releaseId}-s1` }],
  };

  for (const [filename, value] of Object.entries(files)) {
    await writeJson(path.join(dir, filename), value);
  }
}

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}
