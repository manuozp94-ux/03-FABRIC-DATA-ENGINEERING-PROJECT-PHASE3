import { readFile } from "node:fs/promises";
import path from "node:path";


export const prerender = false;

const POWER_BI_SCOPE = "https://analysis.windows.net/powerbi/api/.default";

type ReportArtifact = {
  report: {
    id: string;
    displayName: string;
    workspaceId: string;
  };
  page_name?: string;
};

type SemanticArtifact = {
  semantic_model: {
    id: string;
    displayName: string;
    workspaceId: string;
  };
};

type PowerBIReport = {
  id: string;
  name: string;
  datasetId?: string;
  embedUrl: string;
  webUrl?: string;
};

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

function requireEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

async function readJsonFile<T>(filePath: string): Promise<T> {
  const raw = await readFile(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

async function loadArtifacts() {
  const repoRoot = process.env.PROJECT_REPO_ROOT?.trim();
  if (!repoRoot) {
    throw new Error("Missing PROJECT_REPO_ROOT environment variable.");
  }

  const reportArtifactPath = path.join(
    repoRoot,
    "_bmad-output",
    "test-artifacts",
    "fabric-proof",
    "fab001",
    "report-live",
    "report-shell-report.json",
  );
  const semanticArtifactPath = path.join(
    repoRoot,
    "_bmad-output",
    "test-artifacts",
    "fabric-proof",
    "fab001",
    "semantic-model-live",
    "materialization-report.json",
  );

  const [reportArtifact, semanticArtifact] = await Promise.all([
    readJsonFile<ReportArtifact>(reportArtifactPath),
    readJsonFile<SemanticArtifact>(semanticArtifactPath),
  ]);

  return { reportArtifact, semanticArtifact };
}

async function getPowerBIToken(tenantId: string, clientId: string, clientSecret: string) {
  const response = await fetch(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        scope: POWER_BI_SCOPE,
        grant_type: "client_credentials",
      }),
    },
  );

  const payload = await response.json();
  if (!response.ok || !payload.access_token) {
    throw new Error(`Power BI token request failed (${response.status}).`);
  }

  return payload.access_token as string;
}

async function getReportMetadata(accessToken: string, workspaceId: string, reportId: string) {
  const response = await fetch(
    `https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/reports/${reportId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  const payload = (await response.json()) as PowerBIReport;
  if (!response.ok || !payload.embedUrl) {
    throw new Error(`Power BI report metadata request failed (${response.status}).`);
  }

  return payload;
}

async function generateEmbedToken(
  accessToken: string,
  reportId: string,
  datasetId: string,
  workspaceId: string,
) {
  const response = await fetch("https://api.powerbi.com/v1.0/myorg/GenerateToken", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      reports: [{ id: reportId }],
      datasets: [{ id: datasetId }],
      targetWorkspaces: [{ id: workspaceId }],
      lifetimeInMinutes: 60,
    }),
  });

  const payload = await response.json();
  if (!response.ok || !payload.token) {
    throw new Error(`Power BI embed token request failed (${response.status}).`);
  }

  return payload as { token: string; expiration?: string };
}

export async function GET() {
  try {
    const tenantId = requireEnv("FABRIC_TENANT_ID");
    const clientId = requireEnv("FABRIC_CLIENT_ID");
    const clientSecret = requireEnv("FABRIC_CLIENT_SECRET");
    const { reportArtifact, semanticArtifact } = await loadArtifacts();

    const workspaceId =
      process.env.FABRIC_WORKSPACE_ID?.trim()
      || reportArtifact.report.workspaceId
      || semanticArtifact.semantic_model.workspaceId;
    const reportId =
      process.env.POWERBI_REPORT_ID?.trim()
      || reportArtifact.report.id;
    const pageDisplayName =
      process.env.POWERBI_PAGE_DISPLAY_NAME?.trim()
      || reportArtifact.page_name
      || "Supply Chain Decision View";

    if (!workspaceId || !reportId) {
      throw new Error("Missing bounded proof identifiers for the Power BI report.");
    }

    const accessToken = await getPowerBIToken(tenantId, clientId, clientSecret);
    const report = await getReportMetadata(accessToken, workspaceId, reportId);
    const datasetId =
      report.datasetId
      || process.env.POWERBI_SEMANTIC_MODEL_ID?.trim()
      || semanticArtifact.semantic_model.id;

    if (!datasetId) {
      throw new Error("Missing dataset or semantic model identifier for embed.");
    }

    const embedToken = await generateEmbedToken(accessToken, reportId, datasetId, workspaceId);

    return jsonResponse({
      artifactLabel: "bounded proof",
      reportId,
      reportName: report.name || reportArtifact.report.displayName,
      workspaceId,
      datasetId,
      pageDisplayName,
      embedUrl: report.embedUrl,
      webUrl: report.webUrl ?? null,
      accessToken: embedToken.token,
      expiration: embedToken.expiration ?? null,
      tokenType: "Embed",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown embed configuration error.";
    return jsonResponse(
      {
        error: "powerbi_embed_config_unavailable",
        message,
      },
      503,
    );
  }
}
