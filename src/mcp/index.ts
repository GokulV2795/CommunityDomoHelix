#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { DomoAuth } from "../core/auth/index.js";
import { registerAllTools } from "./tools/registry.js";

const auth = new DomoAuth({
  instance: process.env.DOMO_INSTANCE,
  devToken: process.env.DOMO_TOKEN,
});

const server = new McpServer({
  name: "domo-helix-mcp",
  version: "1.0.0",
});

registerAllTools(server, auth);

const transport = new StdioServerTransport();
await server.connect(transport);
