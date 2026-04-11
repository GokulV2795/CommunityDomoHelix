import type { DomoAuth } from "../auth/index.js";
import type { DomoResult } from "./types.js";
import { ok, fail } from "./types.js";

export async function listDatasets(
  auth: DomoAuth,
  opts: { limit?: number; offset?: number; nameContains?: string } = {}
): Promise<DomoResult> {
  const params = new URLSearchParams({
    limit: String(Math.min(opts.limit ?? 50, 50)),
    offset: String(opts.offset ?? 0),
  });
  if (opts.nameContains) params.set("nameLike", opts.nameContains);
  const res = await auth.fetch(`/api/data/v3/datasources?${params}`);
  if (!res.ok) return fail(res);
  const data = (await res.json()) as { dataSources: unknown[] };
  return ok(data.dataSources);
}

export async function getDataset(auth: DomoAuth, datasetId: string): Promise<DomoResult> {
  const res = await auth.fetch(`/api/data/v3/datasources/${datasetId}`);
  if (!res.ok) return fail(res);
  return ok(await res.json());
}

export async function getDatasetSchema(auth: DomoAuth, datasetId: string): Promise<DomoResult> {
  const res = await auth.fetch(`/api/data/v3/datasources/${datasetId}/schema`);
  if (!res.ok) return fail(res);
  const data = (await res.json()) as { schemaContract?: { schema?: { columns?: unknown[] } } };
  return ok(data.schemaContract?.schema?.columns ?? []);
}

export async function queryDataset(auth: DomoAuth, datasetId: string, sql: string): Promise<DomoResult> {
  const res = await auth.fetch(`/api/query/v1/execute/${datasetId}`, {
    method: "POST",
    body: JSON.stringify({ sql }),
  });
  if (!res.ok) return fail(res);
  return ok(await res.json());
}

export async function createDataset(
  auth: DomoAuth,
  opts: { name: string; columns: unknown[]; description?: string }
): Promise<DomoResult> {
  const res = await auth.fetch("/api/data/v2/datasources", {
    method: "POST",
    body: JSON.stringify({
      dataSourceName: opts.name,
      description: opts.description,
      schema: { columns: opts.columns },
    }),
  });
  if (!res.ok) return fail(res);
  return ok(await res.json());
}

export async function uploadDataset(
  auth: DomoAuth,
  datasetId: string,
  csvData: string,
  updateMethod = "REPLACE"
): Promise<DomoResult> {
  // Step 1: Get streamId
  let dsRes = await auth.fetch(`/api/data/v3/datasources/${datasetId}`);
  let ds = (await dsRes.json()) as { streamId?: number };
  let streamId = ds.streamId;

  if (!streamId) {
    await auth.fetch(`/api/data/v3/datasources/${datasetId}/uploads/`, { method: "POST" });
    dsRes = await auth.fetch(`/api/data/v3/datasources/${datasetId}`);
    ds = (await dsRes.json()) as { streamId?: number };
    streamId = ds.streamId;
  }
  if (!streamId) {
    return { ok: false, status: 500, message: `No streamId found for dataset ${datasetId}.` };
  }

  // Step 2: Create execution
  const execRes = await auth.fetch(`/api/data/v1/streams/${streamId}/executions`, {
    method: "POST",
    body: JSON.stringify({ updateMethod }),
  });
  if (!execRes.ok) return fail(execRes);
  const exec = (await execRes.json()) as { executionId: number };
  const execId = exec.executionId;

  // Step 3: Upload parts (~10MB chunks)
  const PART_SIZE = 10 * 1024 * 1024;
  const csvBytes = new TextEncoder().encode(csvData);
  const totalParts = Math.max(1, Math.ceil(csvBytes.length / PART_SIZE));

  for (let partNum = 1; partNum <= totalParts; partNum++) {
    const start = (partNum - 1) * PART_SIZE;
    const end = Math.min(partNum * PART_SIZE, csvBytes.length);
    const partData = new TextDecoder().decode(csvBytes.slice(start, end));

    const partRes = await auth.fetch(
      `/api/data/v1/streams/${streamId}/executions/${execId}/part/${partNum}`,
      { method: "PUT", headers: { "Content-Type": "text/csv" }, body: partData }
    );
    if (!partRes.ok) {
      return { ok: false, status: partRes.status, message: `Part ${partNum}/${totalParts} failed: ${await partRes.text()}` };
    }
  }

  // Step 4: Commit
  const commitRes = await auth.fetch(
    `/api/data/v1/streams/${streamId}/executions/${execId}/commit`,
    { method: "PUT" }
  );
  if (!commitRes.ok) {
    return { ok: false, status: commitRes.status, message: `Commit failed: ${await commitRes.text()}` };
  }

  // Step 5: Index
  await auth.fetch(`/api/data/v3/datasources/${datasetId}/indexes`, {
    method: "POST",
    body: "{}",
  });

  return ok({
    success: true, datasetId, executionId: execId, streamId,
    parts: totalParts, bytes: csvBytes.length, method: updateMethod, indexed: true,
  });
}

export async function createDatasetWithData(
  auth: DomoAuth,
  opts: { name: string; columns: unknown[]; csvData: string; description?: string }
): Promise<DomoResult> {
  // Step 1: Create dataset
  const createRes = await auth.fetch("/api/data/v2/datasources", {
    method: "POST",
    body: JSON.stringify({
      dataSourceName: opts.name,
      description: opts.description,
      schema: { columns: opts.columns },
    }),
  });
  if (!createRes.ok) return fail(createRes);
  const created = (await createRes.json()) as { dataSource?: { dataSourceId: string } };
  const datasetId = created.dataSource?.dataSourceId;

  // Step 2: Init upload
  const initRes = await auth.fetch(`/api/data/v3/datasources/${datasetId}/uploads/`, { method: "POST" });
  if (!initRes.ok) {
    return { ok: false, status: initRes.status, message: `Created ${datasetId} but upload init failed: ${await initRes.text()}` };
  }
  const upload = (await initRes.json()) as { uploadId: number };

  // Step 3: Get streamId
  const dsRes = await auth.fetch(`/api/data/v3/datasources/${datasetId}`);
  const ds = (await dsRes.json()) as { streamId: number };

  // Step 4: Upload CSV
  const partRes = await auth.fetch(
    `/api/data/v3/datasources/${datasetId}/uploads/${upload.uploadId}/parts/1`,
    { method: "PUT", headers: { "Content-Type": "text/csv" }, body: opts.csvData }
  );
  if (!partRes.ok) {
    return { ok: false, status: partRes.status, message: `Created ${datasetId} but upload failed: ${await partRes.text()}` };
  }

  // Step 5: Commit
  await auth.fetch(
    `/api/data/v1/streams/${ds.streamId}/executions/${upload.uploadId}/commit`,
    { method: "PUT" }
  );

  // Step 6: Index
  await auth.fetch(`/api/data/v3/datasources/${datasetId}/indexes`, {
    method: "POST",
    body: "{}",
  });

  const rowCount = opts.csvData.split("\n").filter(line => line.trim()).length - 1;
  return ok({
    success: true, datasetId, name: opts.name, streamId: ds.streamId,
    estimatedRows: rowCount, indexed: true,
    note: "Data will be queryable within ~10-15 seconds.",
  });
}
