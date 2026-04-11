import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { DomoAuth } from "../../core/auth/index.js";
import { listCustomApps, queryAppdb, runCodeEngine } from "../../core/api/index.js";
import { toMcpResponse } from "../output.js";

export function registerCustomAppTools(server: McpServer, auth: DomoAuth): void {
  server.tool(
    "domo_custom_app_list",
    "List published custom apps. Only use custom apps when native Domo cards cannot achieve the required visualization.",
    { limit: z.number().optional().describe("Max results (default 50)"), offset: z.number().optional().describe("Pagination offset") },
    async ({ limit, offset }) => toMcpResponse(await listCustomApps(auth, { limit, offset }))
  );

  server.tool(
    "domo_appdb_query",
    "Query an AppDB collection. AppDB is a document database for custom app state management.",
    { collectionName: z.string().describe("The AppDB collection name"), query: z.string().optional().describe("JSON query filter") },
    async ({ collectionName, query }) => toMcpResponse(await queryAppdb(auth, collectionName, query ? JSON.parse(query) : {}))
  );

  server.tool(
    "domo_code_engine_run",
    "Invoke a Code Engine function. Server-side JS execution for custom app backends.",
    { packageAlias: z.string().describe("The package alias"), functionName: z.string().describe("The function name"), params: z.string().optional().describe("JSON parameters") },
    async ({ packageAlias, functionName, params }) => toMcpResponse(await runCodeEngine(auth, packageAlias, functionName, params ? JSON.parse(params) : {}))
  );
}
