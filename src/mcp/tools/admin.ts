import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { DomoAuth } from "../../core/auth/index.js";
import { listUsers, getUser, listGroups, listPdpPolicies, whoami } from "../../core/api/index.js";
import { toMcpResponse } from "../output.js";

export function registerAdminTools(server: McpServer, auth: DomoAuth): void {
  server.tool(
    "domo_user_list",
    "List users in the Domo instance.",
    { limit: z.number().optional().describe("Max results (default 50)"), offset: z.number().optional().describe("Pagination offset") },
    async ({ limit, offset }) => toMcpResponse(await listUsers(auth, { limit, offset }))
  );

  server.tool(
    "domo_user_get",
    "Get details for a specific user including role, groups, and permissions.",
    { userId: z.string().describe("The user ID") },
    async ({ userId }) => toMcpResponse(await getUser(auth, userId))
  );

  server.tool(
    "domo_group_list",
    "List groups in the Domo instance.",
    { limit: z.number().optional().describe("Max results (default 50)"), offset: z.number().optional().describe("Pagination offset") },
    async ({ limit, offset }) => toMcpResponse(await listGroups(auth, { limit, offset }))
  );

  server.tool(
    "domo_pdp_list",
    "List PDP (Personalized Data Permissions) policies for a dataset.",
    { datasetId: z.string().describe("The dataset ID") },
    async ({ datasetId }) => toMcpResponse(await listPdpPolicies(auth, datasetId))
  );

  server.tool(
    "domo_whoami",
    "Get the currently authenticated user's information. Verifies auth is working.",
    {},
    async () => toMcpResponse(await whoami(auth))
  );
}
