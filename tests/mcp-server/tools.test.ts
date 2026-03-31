// tests/mcp-server/tools.test.ts
import { describe, it, expect, vi } from "vitest";
import { buildToolHandlers, TOOL_DEFINITIONS } from "../../mcp-server/src/tools.js";

describe("TOOL_DEFINITIONS", () => {
  it("defines local_ai_query tool", () => {
    const query = TOOL_DEFINITIONS.find((t) => t.name === "local_ai_query");
    expect(query).toBeDefined();
    expect(query!.inputSchema.properties).toHaveProperty("prompt");
  });
  it("defines local_ai_code_edit tool", () => {
    const edit = TOOL_DEFINITIONS.find((t) => t.name === "local_ai_code_edit");
    expect(edit).toBeDefined();
    expect(edit!.inputSchema.properties).toHaveProperty("file_path");
    expect(edit!.inputSchema.properties).toHaveProperty("instruction");
  });
  it("defines local_ai_summarize tool", () => {
    const summarize = TOOL_DEFINITIONS.find((t) => t.name === "local_ai_summarize");
    expect(summarize).toBeDefined();
    expect(summarize!.inputSchema.properties).toHaveProperty("content");
  });
});

describe("buildToolHandlers", () => {
  it("handles local_ai_query", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        response: "test response",
        confidence: "high",
        uncertainty_reason: null,
        escalation_recommended: false,
        escalation_reason: null,
      }),
    });
    const handlers = buildToolHandlers("http://localhost:5577", mockFetch);
    const result = await handlers.local_ai_query({ prompt: "hello" });
    expect(result.content[0].text).toContain("test response");
    expect(result.content[0].text).toContain("high");
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:5577/v1/localai/query",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("hello") })
    );
  });
  it("handles local_ai_code_edit", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        response: "edited code here",
        confidence: "medium",
        uncertainty_reason: "unsure about import style",
        escalation_recommended: false,
        escalation_reason: null,
      }),
    });
    const handlers = buildToolHandlers("http://localhost:5577", mockFetch);
    const result = await handlers.local_ai_code_edit({
      file_path: "src/app.ts",
      file_content: "const x = 1;",
      instruction: "add type annotation",
    });
    expect(result.content[0].text).toContain("edited code here");
    expect(result.content[0].text).toContain("medium");
  });
});
