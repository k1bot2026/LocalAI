// gateway/src/index.ts
import { createApp } from "./server.js";
import { Gateway } from "./gateway.js";
import { OllamaClient } from "./ollama.js";
import type { GatewayConfig } from "./types.js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const configPath = resolve(import.meta.dirname, "../../config/default.json");
const config: GatewayConfig = JSON.parse(readFileSync(configPath, "utf-8"));

const client = new OllamaClient(config.model.ollama_url, config.model.name);
const gateway = new Gateway(client, config);
const app = createApp(gateway);

const port = config.gateway.port;
app.listen(port, () => {
  console.log(`LocalAI Gateway running on http://localhost:${port}`);
  console.log(`Model: ${config.model.name} (${config.model.base})`);
  console.log(`Health: http://localhost:${port}/health`);
  console.log(`API: http://localhost:${port}/v1/chat/completions`);
});
