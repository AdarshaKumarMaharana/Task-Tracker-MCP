import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { create_taskHandler } from "./tools/create_task.js";

/**
 * Build a fresh MCP server instance.
 *
 * We export a FACTORY rather than a singleton so the HTTP
 * transport can hand each new session its own `McpServer`.
 * The MCP SDK rejects a second `initialize` on the same
 * Server instance, so a per-session factory is mandatory
 * for the streamable-http transport.
 */
export function createServer(): McpServer {
  const server = new McpServer({
    name: "Task Tracker MCP 003",
    version: "0.1.0",
  });

  // ---------- Tools ----------
  server.registerTool("create_task", {
    description: "Creates a new task with title, optional description, and priority. Returns the task ID",
    inputSchema: { title: z.string(), description: z.string().optional(), priority: z.string().optional() },
  }, create_taskHandler);

  return server;
}
