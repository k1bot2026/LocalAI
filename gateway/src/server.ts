// gateway/src/server.ts
import express, { type Request, type Response } from "express";
import type { Gateway } from "./gateway.js";

export function createApp(gateway: Gateway) {
  const app = express();
  app.use(express.json());

  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.post("/v1/chat/completions", async (req: Request, res: Response) => {
    const { messages, max_tokens } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: "messages array is required" });
      return;
    }

    const userMessages = messages.filter((m: { role: string }) => m.role === "user");
    const lastUserMessage = userMessages[userMessages.length - 1];
    const systemMessages = messages.filter((m: { role: string }) => m.role === "system");
    const systemPrompt = systemMessages.map((m: { content: string }) => m.content).join("\n");

    try {
      const result = await gateway.process({
        prompt: lastUserMessage?.content ?? "",
        system: systemPrompt || undefined,
        max_tokens,
      });

      res.json({
        id: `localai-${Date.now()}`,
        object: "chat.completion",
        created: Math.floor(Date.now() / 1000),
        model: result.model,
        choices: [{
          index: 0,
          message: { role: "assistant", content: result.response },
          finish_reason: "stop",
        }],
        usage: result.usage,
        localai_metadata: {
          confidence: result.confidence,
          uncertainty_reason: result.uncertainty_reason,
          escalation_recommended: result.escalation_recommended,
          escalation_reason: result.escalation_reason,
          classification: result.classification,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(502).json({ error: `Gateway error: ${message}` });
    }
  });

  app.post("/v1/localai/query", async (req: Request, res: Response) => {
    const { prompt, system, file_content, file_path, skill, max_tokens } = req.body;

    if (!prompt) {
      res.status(400).json({ error: "prompt is required" });
      return;
    }

    try {
      const result = await gateway.process({ prompt, system, file_content, file_path, skill, max_tokens });
      res.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(502).json({ error: `Gateway error: ${message}` });
    }
  });

  return app;
}
