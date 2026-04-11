import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { DomoAuth } from "../../core/auth/index.js";
import { listDatasets, getDataset, getDatasetSchema, queryDataset, createDataset, uploadDataset, createDatasetWithData, search, listEtls, getEtl, createEtl, updateEtl, runEtl, getEtlExecutionStatus } from "../../core/api/index.js";
import { toMcpResponse } from "../output.js";

export function registerDataTools(server: McpServer, auth: DomoAuth): void {
  // ── Datasets ────────────────────────────────────────────────────────

  server.tool(
    "domo_dataset_list",
    "List datasets in the Domo instance. Returns dataset IDs, names, row counts, and last updated timestamps.",
    { limit: z.number().optional().describe("Max datasets to return (default 50, max 50)"), offset: z.number().optional().describe("Pagination offset"), nameContains: z.string().optional().describe("Filter by name substring") },
    async (args) => toMcpResponse(await listDatasets(auth, args))
  );

  server.tool(
    "domo_dataset_get",
    "Get metadata for a specific dataset: schema, row count, owner, last updated.",
    { datasetId: z.string().describe("The dataset ID") },
    async ({ datasetId }) => toMcpResponse(await getDataset(auth, datasetId))
  );

  server.tool(
    "domo_dataset_schema",
    "Get the full column schema for a dataset including column names, types, and AI metadata.",
    { datasetId: z.string().describe("The dataset ID") },
    async ({ datasetId }) => toMcpResponse(await getDatasetSchema(auth, datasetId))
  );

  server.tool(
    "domo_dataset_query",
    "Run a SQL query against a Domo dataset. Use 'table' as the table name.",
    { datasetId: z.string().describe("The dataset ID to query"), sql: z.string().describe("SQL query (use 'table' as the table name)") },
    async ({ datasetId, sql }) => toMcpResponse(await queryDataset(auth, datasetId, sql))
  );

  server.tool(
    "domo_dataset_create",
    "Create a new empty dataset with a defined schema.",
    { name: z.string().describe("Dataset name"), columns: z.string().describe("JSON array of column defs"), description: z.string().optional().describe("Dataset description") },
    async ({ name, columns, description }) => toMcpResponse(await createDataset(auth, { name, columns: JSON.parse(columns), description }))
  );

  server.tool(
    "domo_dataset_upload",
    "Upload CSV data into an existing dataset (handles chunking, commit, and indexing).",
    { datasetId: z.string().describe("The dataset ID"), csvData: z.string().describe("CSV string with header row and data rows"), updateMethod: z.string().optional().describe("REPLACE (default) or APPEND") },
    async ({ datasetId, csvData, updateMethod }) => toMcpResponse(await uploadDataset(auth, datasetId, csvData, updateMethod))
  );

  server.tool(
    "domo_dataset_create_with_data",
    "Create a new dataset AND populate it with CSV data in one operation.",
    { name: z.string().describe("Dataset name"), columns: z.string().describe("JSON array of column defs"), csvData: z.string().describe("CSV string with header row"), description: z.string().optional().describe("Dataset description") },
    async ({ name, columns, csvData, description }) => toMcpResponse(await createDatasetWithData(auth, { name, columns: JSON.parse(columns), csvData, description }))
  );

  server.tool(
    "domo_search",
    "Search across Domo for datasets, cards, pages, and other entities.",
    { query: z.string().describe("Search query"), entities: z.string().optional().describe("Comma-separated entity types: CARD, PAGE, DATASET"), limit: z.number().optional().describe("Max results (default 20)") },
    async ({ query, entities, limit }) => {
      const entityList = entities ? entities.split(",").map(e => e.trim()) : undefined;
      return toMcpResponse(await search(auth, query, { entities: entityList, limit }));
    }
  );

  // ── Magic ETL ───────────────────────────────────────────────────────

  server.tool(
    "domo_etl_list",
    "List Magic ETL dataflows.",
    { limit: z.number().optional().describe("Max results (default 50)"), offset: z.number().optional().describe("Pagination offset") },
    async (args) => toMcpResponse(await listEtls(auth, args))
  );

  server.tool(
    "domo_etl_get",
    "Get the full definition of a Magic ETL dataflow.",
    { dataflowId: z.string().describe("The dataflow ID") },
    async ({ dataflowId }) => toMcpResponse(await getEtl(auth, dataflowId))
  );

  server.tool(
    "domo_etl_create",
    "Create a Magic ETL dataflow (databaseType forced to MAGIC).",
    { definition: z.string().describe("Full dataflow JSON definition") },
    async ({ definition }) => toMcpResponse(await createEtl(auth, JSON.parse(definition)))
  );

  server.tool(
    "domo_etl_update",
    "Update an existing Magic ETL dataflow (PUT replaces entire definition).",
    { dataflowId: z.string().describe("The dataflow ID"), definition: z.string().describe("Full updated dataflow JSON definition") },
    async ({ dataflowId, definition }) => toMcpResponse(await updateEtl(auth, dataflowId, JSON.parse(definition)))
  );

  server.tool(
    "domo_etl_run",
    "Trigger a Magic ETL dataflow execution.",
    { dataflowId: z.string().describe("The dataflow ID") },
    async ({ dataflowId }) => toMcpResponse(await runEtl(auth, dataflowId))
  );

  server.tool(
    "domo_etl_execution_status",
    "Check the status of a Magic ETL execution.",
    { dataflowId: z.string().describe("The dataflow ID"), executionId: z.string().describe("The execution ID") },
    async ({ dataflowId, executionId }) => toMcpResponse(await getEtlExecutionStatus(auth, dataflowId, executionId))
  );
}
