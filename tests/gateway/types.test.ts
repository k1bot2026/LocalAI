import { describe, it, expect } from "vitest";
import type {
  ConfidenceLevel,
  GatewayResponse,
  GatewayRequest,
  TaskClassification,
} from "../../gateway/src/types.js";

describe("types", () => {
  it("GatewayResponse has required shape", () => {
    const response: GatewayResponse = {
      response: "hello",
      confidence: "high",
      uncertainty_reason: null,
      escalation_recommended: false,
      escalation_reason: null,
      classification: {
        complexity: "simple",
        flags: [],
        pre_warning: null,
      },
      model: "localai-coder",
      usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
    };
    expect(response.confidence).toBe("high");
    expect(response.escalation_recommended).toBe(false);
  });

  it("GatewayRequest allows optional fields", () => {
    const minimal: GatewayRequest = { prompt: "test" };
    expect(minimal.prompt).toBe("test");
    expect(minimal.file_content).toBeUndefined();

    const full: GatewayRequest = {
      prompt: "test",
      system: "be helpful",
      file_content: "const x = 1;",
      file_path: "src/x.ts",
      skill: "code-review",
      max_tokens: 1000,
      stream: false,
    };
    expect(full.skill).toBe("code-review");
  });
});
