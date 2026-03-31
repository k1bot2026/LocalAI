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
});
