// mcp-server/src/tools.ts

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, unknown>;
    required: string[];
  };
}

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    name: "local_ai_query",
    description: "Send a prompt to the local AI model (Qwen2.5-Coder-7B). Returns a response with confidence assessment. Use for simple coding tasks, explanations, documentation, and formatting. Check the confidence field to decide whether to trust the output.",
    inputSchema: {
      type: "object",
      properties: {
        prompt: { type: "string", description: "The prompt/instruction to send to the local model" },
        system: { type: "string", description: "Optional additional system prompt context" },
        file_path: { type: "string", description: "Optional file path for context" },
        file_content: { type: "string", description: "Optional file content for context" },
      },
      required: ["prompt"],
    },
  },
  {
    name: "local_ai_code_edit",
    description: "Send a file and instruction to the local AI for code editing. The model will return the edited code with confidence assessment. Best for single-file edits: formatting, renaming, adding comments, simple refactoring.",
    inputSchema: {
      type: "object",
      properties: {
        file_path: { type: "string", description: "Path to the file being edited" },
        file_content: { type: "string", description: "Current content of the file" },
        instruction: { type: "string", description: "What edit to make to the file" },
      },
      required: ["file_path", "file_content", "instruction"],
    },
  },
  {
    name: "local_ai_summarize",
    description: "Send content to the local AI for summarization. Returns a concise summary with confidence. Good for summarizing files, documentation, logs, and diffs.",
    inputSchema: {
      type: "object",
      properties: {
        content: { type: "string", description: "The content to summarize" },
        focus: { type: "string", description: "Optional focus area for the summary" },
      },
      required: ["content"],
    },
  },
];

type FetchFn = typeof globalThis.fetch;

interface ToolResult {
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
}

export function buildToolHandlers(gatewayUrl: string, fetchFn: FetchFn = globalThis.fetch) {
  async function callGateway(body: Record<string, unknown>): Promise<ToolResult> {
    try {
      const response = await fetchFn(`${gatewayUrl}/v1/localai/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const text = await response.text();
        return { content: [{ type: "text", text: `Gateway error (${response.status}): ${text}` }], isError: true };
      }

      const data = await response.json();
      const meta = [
        `[Confidence: ${data.confidence}]`,
        data.uncertainty_reason ? `[Uncertain: ${data.uncertainty_reason}]` : null,
        data.escalation_recommended ? `[ESCALATION RECOMMENDED: ${data.escalation_reason}]` : null,
      ].filter(Boolean).join("\n");

      return { content: [{ type: "text", text: `${data.response}\n\n---\n${meta}` }] };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return { content: [{ type: "text", text: `Failed to reach LocalAI gateway: ${message}` }], isError: true };
    }
  }

  return {
    local_ai_query: async (args: { prompt: string; system?: string; file_path?: string; file_content?: string }) => {
      return callGateway({ prompt: args.prompt, system: args.system, file_path: args.file_path, file_content: args.file_content });
    },
    local_ai_code_edit: async (args: { file_path: string; file_content: string; instruction: string }) => {
      return callGateway({
        prompt: args.instruction,
        file_path: args.file_path,
        file_content: args.file_content,
        system: "You are editing a file. Return ONLY the complete edited file content. No explanations before or after the code.",
      });
    },
    local_ai_summarize: async (args: { content: string; focus?: string }) => {
      const prompt = args.focus
        ? `Summarize the following content, focusing on: ${args.focus}\n\n${args.content}`
        : `Summarize the following content concisely:\n\n${args.content}`;
      return callGateway({ prompt });
    },
  };
}
