export interface DelegationResult {
  handled: boolean;
  response?: string;
  confidence?: "high" | "medium" | "low";
  needs_escalation: boolean;
  escalation_reason?: string;
  error?: string;
}

type FetchFn = typeof globalThis.fetch;

export class Delegator {
  constructor(
    private gatewayUrl: string,
    private fetchFn: FetchFn = globalThis.fetch
  ) {}

  async delegateTask(taskDescription: string, fileContent?: string, filePath?: string): Promise<DelegationResult> {
    try {
      const response = await this.fetchFn(`${this.gatewayUrl}/v1/localai/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: taskDescription, file_content: fileContent, file_path: filePath }),
      });

      if (!response.ok) {
        const text = await response.text();
        return { handled: false, needs_escalation: true, error: `Gateway returned ${response.status}: ${text}` };
      }

      const data = await response.json();
      return {
        handled: true,
        response: data.response,
        confidence: data.confidence,
        needs_escalation: data.escalation_recommended ?? false,
        escalation_reason: data.escalation_reason ?? undefined,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return { handled: false, needs_escalation: true, error: `Failed to reach LocalAI gateway: ${message}` };
    }
  }
}
