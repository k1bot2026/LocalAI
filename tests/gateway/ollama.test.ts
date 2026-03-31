// tests/gateway/ollama.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { OllamaClient } from "../../gateway/src/ollama.js";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("OllamaClient", () => {
  let client: OllamaClient;

  beforeEach(() => {
    client = new OllamaClient("http://localhost:11434", "localai-coder");
    mockFetch.mockReset();
  });

  it("sends chat request with correct format", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: { role: "assistant", content: "Hello\n\n[CONFIDENCE: high]" },
        done: true,
        prompt_eval_count: 10,
        eval_count: 5,
      }),
    });

    const result = await client.chat(
      [{ role: "user", content: "hello" }],
      { temperature: 0.3 }
    );

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe("http://localhost:11434/api/chat");
    const body = JSON.parse(options.body);
    expect(body.model).toBe("localai-coder");
    expect(body.messages[0]).toEqual({ role: "user", content: "hello" });
    expect(body.stream).toBe(false);
    expect(result.message.content).toBe("Hello\n\n[CONFIDENCE: high]");
  });

  it("throws on non-ok response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => "Internal Server Error",
    });

    await expect(
      client.chat([{ role: "user", content: "hello" }])
    ).rejects.toThrow("Ollama request failed (500)");
  });

  it("checks health via /api/tags", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ models: [{ name: "localai-coder" }] }),
    });

    const healthy = await client.isHealthy();
    expect(healthy).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:11434/api/tags",
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });

  it("returns unhealthy on network error", async () => {
    mockFetch.mockRejectedValueOnce(new Error("ECONNREFUSED"));
    const healthy = await client.isHealthy();
    expect(healthy).toBe(false);
  });
});
