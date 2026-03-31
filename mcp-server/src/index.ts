#!/usr/bin/env node
// mcp-server/src/index.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { TOOL_DEFINITIONS, buildToolHandlers } from "./tools.js";

const GATEWAY_URL = process.env.LOCALAI_GATEWAY_URL ?? "http://localhost:5577";

const server = new Server(
  { name: "localai-mcp", version: "0.1.0" },
  { capabilities: { tools: {} } }
);

const handlers = buildToolHandlers(GATEWAY_URL);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOL_DEFINITIONS,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const handler = handlers[name as keyof typeof handlers];
  if (!handler) {
    return { content: [{ type: "text" as const, text: `Unknown tool: ${name}` }], isError: true };
  }
  return handler(args as any);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("LocalAI MCP server running on stdio");
}

main().catch((error) => {
  console.error("Failed to start MCP server:", error);
  process.exit(1);
});
