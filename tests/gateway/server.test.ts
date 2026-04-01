// tests/gateway/server.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../../gateway/src/server.js";
import type { Gateway } from "../../gateway/src/gateway.js";

function createMockGateway() {
  return {
    process: vi.fn().mockResolvedValue({
      response: "Hello!",
      confidence: "high",
      uncertainty_reason: null,
      escalation_recommended: false,
      escalation_reason: null,
      classification: { complexity: "simple", flags: [], pre_warning: null },
      model: "localai-coder",
      usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
    }),
  } as unknown as Gateway;
}

describe("Express API", () => {
  let mockGateway: Gateway;
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    mockGateway = createMockGateway();
    app = createApp(mockGateway);
  });

  it("GET /health returns ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  it("POST /v1/chat/completions returns OpenAI-compatible format", async () => {
    const res = await request(app)
      .post("/v1/chat/completions")
      .send({ messages: [{ role: "user", content: "hello" }] });

    expect(res.status).toBe(200);
    expect(res.body.choices[0].message.content).toBe("Hello!");
    expect(res.body.choices[0].message.role).toBe("assistant");
    expect(res.body.model).toBe("localai-coder");
    expect(res.body.usage.total_tokens).toBe(15);
    expect(res.body.localai_metadata.confidence).toBe("high");
    expect(res.body.localai_metadata.escalation_recommended).toBe(false);
  });

  it("POST /v1/localai/query returns gateway response directly", async () => {
    const res = await request(app)
      .post("/v1/localai/query")
      .send({ prompt: "hello" });

    expect(res.status).toBe(200);
    expect(res.body.response).toBe("Hello!");
    expect(res.body.confidence).toBe("high");
  });

  it("returns 400 on missing messages", async () => {
    const res = await request(app)
      .post("/v1/chat/completions")
      .send({});
    expect(res.status).toBe(400);
  });

  describe("POST /v1/messages (Anthropic Messages API)", () => {
    it("returns Anthropic-compatible response format", async () => {
      const res = await request(app)
        .post("/v1/messages")
        .set("anthropic-version", "2023-06-01")
        .set("x-api-key", "sk-test")
        .send({
          model: "qwen-2.5-coder-7b",
          max_tokens: 4096,
          messages: [{ role: "user", content: "Hello" }],
        });

      expect(res.status).toBe(200);
      expect(res.body.type).toBe("message");
      expect(res.body.role).toBe("assistant");
      expect(res.body.content).toEqual([{ type: "text", text: "Hello!" }]);
      expect(res.body.model).toBe("localai-coder");
      expect(res.body.stop_reason).toBe("end_turn");
      expect(res.body.stop_sequence).toBeNull();
      expect(res.body.usage.input_tokens).toBe(10);
      expect(res.body.usage.output_tokens).toBe(5);
      expect(res.body.id).toMatch(/^msg_localai_\d+$/);
    });

    it("extracts system prompt from top-level string", async () => {
      await request(app)
        .post("/v1/messages")
        .send({
          model: "qwen-2.5-coder-7b",
          max_tokens: 1024,
          system: "You are helpful",
          messages: [{ role: "user", content: "Hi" }],
        });

      expect((mockGateway.process as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith(
        expect.objectContaining({ system: "You are helpful", prompt: "Hi" })
      );
    });

    it("extracts system prompt from array of content blocks", async () => {
      await request(app)
        .post("/v1/messages")
        .send({
          model: "qwen-2.5-coder-7b",
          max_tokens: 1024,
          system: [{ type: "text", text: "Block one" }, { type: "text", text: "Block two" }],
          messages: [{ role: "user", content: "Hi" }],
        });

      expect((mockGateway.process as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith(
        expect.objectContaining({ system: "Block one\nBlock two" })
      );
    });

    it("handles content blocks array in user messages", async () => {
      await request(app)
        .post("/v1/messages")
        .send({
          model: "qwen-2.5-coder-7b",
          max_tokens: 1024,
          messages: [
            { role: "user", content: [{ type: "text", text: "Part A" }, { type: "text", text: "Part B" }] },
          ],
        });

      expect((mockGateway.process as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith(
        expect.objectContaining({ prompt: "Part A\nPart B" })
      );
    });

    it("returns 400 when messages array is missing", async () => {
      const res = await request(app)
        .post("/v1/messages")
        .send({ model: "qwen-2.5-coder-7b", max_tokens: 1024 });

      expect(res.status).toBe(400);
      expect(res.body.type).toBe("error");
      expect(res.body.error.type).toBe("invalid_request_error");
    });

    it("returns 502 on gateway error", async () => {
      (mockGateway.process as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("Ollama down"));

      const res = await request(app)
        .post("/v1/messages")
        .send({ messages: [{ role: "user", content: "Hi" }] });

      expect(res.status).toBe(502);
      expect(res.body.type).toBe("error");
      expect(res.body.error.type).toBe("api_error");
    });
  });

  describe("POST /v1/messages/count_tokens", () => {
    it("estimates tokens from string content", async () => {
      const res = await request(app)
        .post("/v1/messages/count_tokens")
        .send({
          messages: [{ role: "user", content: "Hello world" }],
        });

      expect(res.status).toBe(200);
      // "Hello world" = 11 chars, ceil(11/4) = 3
      expect(res.body.input_tokens).toBe(3);
    });

    it("includes system prompt in token count", async () => {
      const res = await request(app)
        .post("/v1/messages/count_tokens")
        .send({
          system: "Be helpful",
          messages: [{ role: "user", content: "Hi" }],
        });

      // "Be helpful" = 10, "Hi" = 2, total = 12, ceil(12/4) = 3
      expect(res.status).toBe(200);
      expect(res.body.input_tokens).toBe(3);
    });

    it("handles content blocks in messages and system", async () => {
      const res = await request(app)
        .post("/v1/messages/count_tokens")
        .send({
          system: [{ type: "text", text: "AB" }],
          messages: [{ role: "user", content: [{ type: "text", text: "CD" }] }],
        });

      // 2 + 2 = 4, ceil(4/4) = 1
      expect(res.status).toBe(200);
      expect(res.body.input_tokens).toBe(1);
    });
  });
});
