import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { DomoAuth } from "../../core/auth/index.js";
import { registerDataTools } from "./data.js";
import { registerAnalyticsTools } from "./analytics.js";
import { registerCustomAppTools } from "./custom-app.js";
import { registerAdminTools } from "./admin.js";

/**
 * Register all tool groups on the MCP server.
 *
 * Order matters conceptually: data is the foundation, analytics is native-first,
 * custom-app is the supplement, admin is operational.
 */
export function registerAllTools(server: McpServer, auth: DomoAuth): void {
  registerDataTools(server, auth);
  registerAnalyticsTools(server, auth);
  registerCustomAppTools(server, auth);
  registerAdminTools(server, auth);
}
