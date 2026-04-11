import type { DomoAuth } from "../auth/index.js";
import type { DomoResult } from "./types.js";
import { ok, fail } from "./types.js";

export async function listEtls(
  auth: DomoAuth,
  opts: { limit?: number; offset?: number } = {}
): Promise<DomoResult> {
  const res = await auth.fetch(
    `/api/dataprocessing/v1/dataflows?limit=${opts.limit ?? 50}&offset=${opts.offset ?? 0}`
  );
  if (!res.ok) return fail(res);
  return ok(await res.json());
}

export async function getEtl(auth: DomoAuth, dataflowId: string): Promise<DomoResult> {
  const res = await auth.fetch(`/api/dataprocessing/v1/dataflows/${dataflowId}`);
  if (!res.ok) return fail(res);
  return ok(await res.json());
}

export async function createEtl(auth: DomoAuth, definition: Record<string, unknown>): Promise<DomoResult> {
  if (!definition.databaseType) definition.databaseType = "MAGIC";
  const res = await auth.fetch("/api/dataprocessing/v1/dataflows", {
    method: "POST",
    body: JSON.stringify(definition),
  });
  if (!res.ok) return fail(res);
  return ok(await res.json());
}

export async function updateEtl(auth: DomoAuth, dataflowId: string, definition: unknown): Promise<DomoResult> {
  const res = await auth.fetch(`/api/dataprocessing/v1/dataflows/${dataflowId}`, {
    method: "PUT",
    body: JSON.stringify(definition),
  });
  if (!res.ok) return fail(res);
  return ok(await res.json());
}

export async function runEtl(auth: DomoAuth, dataflowId: string): Promise<DomoResult> {
  const res = await auth.fetch(
    `/api/dataprocessing/v1/dataflows/${dataflowId}/executions`,
    { method: "POST" }
  );
  if (!res.ok) return fail(res);
  return ok(await res.json());
}

export async function getEtlExecutionStatus(
  auth: DomoAuth,
  dataflowId: string,
  executionId: string
): Promise<DomoResult> {
  const res = await auth.fetch(
    `/api/dataprocessing/v1/dataflows/${dataflowId}/executions/${executionId}`
  );
  if (!res.ok) return fail(res);
  return ok(await res.json());
}
