import { describe, it, expect, vi, beforeEach } from "vitest";
import { Gateway } from "../../gateway/src/gateway.js";
import type { OllamaClient } from "../../gateway/src/ollama.js";
import type { GatewayConfig } from "../../gateway/src/types.js";

function createMockClient(content: string) {
  return {
    chat: vi.fn().mockResolvedValue({
      message: { role: "assistant", content },
      done: true,
      prompt_eval_count: 50,
      eval_count: 30,
    }),
    isHealthy: vi.fn().mockResolvedValue(true),
    getModel: vi.fn().mockReturnValue("localai-coder"),
    getBaseUrl: vi.fn().mockReturnValue("http://localhost:11434"),
  } as unknown as OllamaClient;
}

const testConfig: GatewayConfig = {
  model: {
    name: "localai-coder",
    base: "qwen2.5-coder:7b-instruct",
    ollama_url: "http://localhost:11434",
    ctx_size: 8192,
    temperature: 0.3,
    top_p: 0.85,
    top_k: 40,
    repeat_penalty: 1.1,
  },
  gateway: {
    port: 5577,
    retry_on_medium: false,
    validate_code_output: true,
    prompt_augmentation: true,
  },
  confidence: { auto_accept: "high", review: "medium", escalate: "low" },
  local_delegation: {
    enabled: false,
    auto_accept_confidence: "high",
    review_confidence: "medium",
    escalate_confidence: "low",
    max_concurrent_local_tasks: 1,
  },
  skills_dir: "./skills",
};

describe("Gateway", () => {
  it("processes a simple request end-to-end", async () => {
    const client = createMockClient("Hello world!\n\n[CONFIDENCE: high]");
    const gw = new Gateway(client, testConfig);

    const result = await gw.process({ prompt: "say hello" });

    expect(result.response).toBe("Hello world!");
    expect(result.confidence).toBe("high");
    expect(result.escalation_recommended).toBe(false);
    expect(result.classification.complexity).toBe("moderate");
    expect(result.model).toBe("localai-coder");
    expect(result.usage.prompt_tokens).toBe(50);
    expect(result.usage.completion_tokens).toBe(30);
  });

  it("includes classification for complex tasks", async () => {
    const client = createMockClient(
      "Attempting debug...\n\n[CONFIDENCE: low]\n[ESCALATE: Needs multi-file reasoning]"
    );
    const gw = new Gateway(client, testConfig);

    const result = await gw.process({
      prompt: "debug why the server crashes on startup",
    });

    expect(result.confidence).toBe("low");
    expect(result.escalation_recommended).toBe(true);
    expect(result.escalation_reason).toBe("Needs multi-file reasoning");
    expect(result.classification.complexity).toBe("complex");
    expect(result.classification.flags).toContain("reasoning-heavy");
  });

  it("passes system prompt with file context to ollama", async () => {
    const client = createMockClient("Explained.\n\n[CONFIDENCE: high]");
    const gw = new Gateway(client, testConfig);

    await gw.process({
      prompt: "explain this",
      file_content: "const x = 1;",
      file_path: "test.ts",
    });

    const callArgs = (client.chat as ReturnType<typeof vi.fn>).mock.calls[0];
    const messages = callArgs[0];
    const systemMsg = messages.find(
      (m: { role: string }) => m.role === "system"
    );
    expect(systemMsg.content).toContain("test.ts");
    expect(systemMsg.content).toContain("const x = 1;");
  });

  it("retries on medium confidence when configured", async () => {
    const client = createMockClient("");
    (client.chat as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      message: {
        role: "assistant",
        content: "First attempt.\n\n[CONFIDENCE: medium]\n[UNCERTAIN: not sure about types]",
      },
      done: true,
      prompt_eval_count: 50,
      eval_count: 30,
    });
    (client.chat as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      message: {
        role: "assistant",
        content: "Reviewed and corrected.\n\n[CONFIDENCE: high]",
      },
      done: true,
      prompt_eval_count: 80,
      eval_count: 40,
    });

    const retryConfig = { ...testConfig, gateway: { ...testConfig.gateway, retry_on_medium: true } };
    const gw = new Gateway(client, retryConfig);

    const result = await gw.process({ prompt: "do something" });

    expect(result.confidence).toBe("high");
    expect(result.response).toBe("Reviewed and corrected.");
    expect(client.chat).toHaveBeenCalledTimes(2);
  });
});
