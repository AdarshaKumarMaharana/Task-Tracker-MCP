// Load .env BEFORE anything else so `process.env.MCP_AUTH_TOKEN`
// is populated when the auth middleware runs. Without this
// import, every request fails with 401 even though the token
// file is right next to package.json.
import "dotenv/config";
import express from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { server } from "./server.js";

const app = express();
app.use(express.json());

// Structured request logging.
app.use((req, _res, next) => {
  const t0 = Date.now();
  _res.on("finish", () => {
    console.log(JSON.stringify({ ts: new Date().toISOString(), method: req.method, path: req.path, status: _res.statusCode, ms: Date.now() - t0 }));
  });
  next();
});

// CORS.
const ALLOWED_ORIGINS = "*";
app.use((req, res, next) => {
  const origin = req.headers.origin || "";
  const allow = ALLOWED_ORIGINS === "*" ? "*" : (ALLOWED_ORIGINS.split(",").map((s: string) => s.trim()).includes(origin) ? origin : "");
  if (allow) res.setHeader("Access-Control-Allow-Origin", allow);
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

function requireAuth(req: any, res: any, next: any) {
  const header = req.headers["authorization"] || "";
  const expected = `Bearer ${process.env.MCP_AUTH_TOKEN || ""}`;
  if (!process.env.MCP_AUTH_TOKEN || header !== expected) {
    return res.status(401).json({ error: "unauthorized" });
  }
  next();
}

app.get("/healthz", (_req, res) => res.json({ ok: true }));

const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
await server.connect(transport);
app.use(requireAuth);
app.all("/mcp", async (req, res) => { await transport.handleRequest(req, res, req.body); });

const port = Number(process.env.PORT || 3500);
app.listen(port, () => { console.log(`MCP server listening on http://localhost:${port}/mcp`); });
