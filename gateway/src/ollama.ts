// gateway/src/ollama.ts
import type { OllamaMessage, OllamaChatRequest, OllamaChatResponse } from "./types.js";

export class OllamaClient {
  constructor(
    private baseUrl: string,
    private model: string
  ) {}

  async chat(
    messages: OllamaMessage[],
    options?: {
      temperature?: number;
      top_p?: number;
      top_k?: number;
      repeat_penalty?: number;
      num_ctx?: number;
    }
  ): Promise<OllamaChatResponse> {
    const body: OllamaChatRequest = {
      model: this.model,
      messages,
      stream: false,
      options,
    };

    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Ollama request failed (${response.status}): ${text}`);
    }

    return response.json() as Promise<OllamaChatResponse>;
  }

  async isHealthy(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        signal: AbortSignal.timeout(3000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  getModel(): string {
    return this.model;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }
}
