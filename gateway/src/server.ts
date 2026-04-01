// gateway/src/server.ts
import express, { type Request, type Response } from "express";
import type { Gateway } from "./gateway.js";

export function createApp(gateway: Gateway) {
  const app = express();
  app.use(express.json({ limit: "50mb" }));

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

  // Anthropic Messages API compatible endpoint
  // Acts as a smart proxy: local models handled locally, Claude models forwarded to Anthropic
  app.post("/v1/messages", async (req: Request, res: Response) => {
    const { model, max_tokens, messages, system, stream } = req.body;

    // If the model is a Claude model, proxy to the real Anthropic API
    const isClaudeModel = model && (model.startsWith("claude-") || model.startsWith("claude3"));
    if (isClaudeModel) {
      try {
        const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
        if (!anthropicApiKey) {
          res.status(500).json({
            type: "error",
            error: { type: "authentication_error", message: "ANTHROPIC_API_KEY not set — cannot proxy to Anthropic API" },
          });
          return;
        }

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          "x-api-key": anthropicApiKey,
          "anthropic-version": (req.headers["anthropic-version"] as string) ?? "2023-06-01",
        };
        if (req.headers["anthropic-beta"]) {
          headers["anthropic-beta"] = req.headers["anthropic-beta"] as string;
        }

        const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers,
          body: JSON.stringify(req.body),
        });

        // Forward status and headers
        res.status(anthropicRes.status);
        const contentType = anthropicRes.headers.get("content-type");
        if (contentType) res.setHeader("Content-Type", contentType);

        // Stream the response body through (handles both JSON and SSE streaming)
        if (anthropicRes.body) {
          const reader = anthropicRes.body.getReader();
          const pump = async (): Promise<void> => {
            const { done, value } = await reader.read();
            if (done) { res.end(); return; }
            res.write(value);
            return pump();
          };
          await pump();
        } else {
          const data = await anthropicRes.text();
          res.send(data);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        res.status(502).json({
          type: "error",
          error: { type: "api_error", message: `Anthropic proxy error: ${message}` },
        });
      }
      return;
    }

    // Local model handling
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({
        type: "error",
        error: { type: "invalid_request_error", message: "messages array is required" },
      });
      return;
    }

    // Extract system prompt from top-level field (string or array of content blocks)
    let systemPrompt: string | undefined;
    if (typeof system === "string") {
      systemPrompt = system;
    } else if (Array.isArray(system)) {
      systemPrompt = system
        .filter((block: { type: string }) => block.type === "text")
        .map((block: { text: string }) => block.text)
        .join("\n");
    }

    // Extract the last user message content (string or content blocks array)
    const userMessages = messages.filter((m: { role: string }) => m.role === "user");
    const lastUserMessage = userMessages[userMessages.length - 1];
    let prompt = "";
    if (lastUserMessage) {
      if (typeof lastUserMessage.content === "string") {
        prompt = lastUserMessage.content;
      } else if (Array.isArray(lastUserMessage.content)) {
        prompt = lastUserMessage.content
          .filter((block: { type: string }) => block.type === "text")
          .map((block: { text: string }) => block.text)
          .join("\n");
      }
    }

    try {
      const result = await gateway.process({
        prompt,
        system: systemPrompt,
        max_tokens,
      });

      res.json({
        id: `msg_localai_${Date.now()}`,
        type: "message",
        role: "assistant",
        content: [{ type: "text", text: result.response }],
        model: result.model,
        stop_reason: "end_turn",
        stop_sequence: null,
        usage: {
          input_tokens: result.usage.prompt_tokens,
          output_tokens: result.usage.completion_tokens,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(502).json({
        type: "error",
        error: { type: "api_error", message: `Gateway error: ${message}` },
      });
    }
  });

  // Anthropic token counting endpoint
  // Proxies to Anthropic for Claude models, estimates locally for local models
  app.post("/v1/messages/count_tokens", async (req: Request, res: Response) => {
    const { model, messages, system } = req.body;

    const isClaudeModel = model && (model.startsWith("claude-") || model.startsWith("claude3"));
    if (isClaudeModel) {
      try {
        const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
        if (!anthropicApiKey) {
          res.status(500).json({ type: "error", error: { type: "authentication_error", message: "ANTHROPIC_API_KEY not set" } });
          return;
        }
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          "x-api-key": anthropicApiKey,
          "anthropic-version": (req.headers["anthropic-version"] as string) ?? "2023-06-01",
        };
        if (req.headers["anthropic-beta"]) {
          headers["anthropic-beta"] = req.headers["anthropic-beta"] as string;
        }
        const anthropicRes = await fetch("https://api.anthropic.com/v1/messages/count_tokens", {
          method: "POST",
          headers,
          body: JSON.stringify(req.body),
        });
        const data = await anthropicRes.json();
        res.status(anthropicRes.status).json(data);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        res.status(502).json({ type: "error", error: { type: "api_error", message: `Anthropic proxy error: ${message}` } });
      }
      return;
    }

    let totalChars = 0;

    // Count system prompt characters
    if (typeof system === "string") {
      totalChars += system.length;
    } else if (Array.isArray(system)) {
      for (const block of system) {
        if (block.type === "text") totalChars += block.text.length;
      }
    }

    // Count message characters
    if (Array.isArray(messages)) {
      for (const msg of messages) {
        if (typeof msg.content === "string") {
          totalChars += msg.content.length;
        } else if (Array.isArray(msg.content)) {
          for (const block of msg.content) {
            if (block.type === "text") totalChars += block.text.length;
          }
        }
      }
    }

    res.json({ input_tokens: Math.ceil(totalChars / 4) });
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
