import type {
  GatewayConfig,
  GatewayRequest,
  GatewayResponse,
  OllamaMessage,
} from "./types.js";
import type { OllamaClient } from "./ollama.js";
import { classifyTask } from "./classifier.js";
import { parseConfidence, stripConfidenceTags } from "./confidence.js";
import { buildSystemPrompt } from "./prompts.js";

export class Gateway {
  constructor(
    private client: OllamaClient,
    private config: GatewayConfig
  ) {}

  async process(request: GatewayRequest): Promise<GatewayResponse> {
    const classification = classifyTask(request.prompt);

    const systemPrompt = buildSystemPrompt({
      file_path: request.file_path,
      file_content: request.file_content,
      custom_system: request.system,
      augment_reasoning:
        this.config.gateway.prompt_augmentation &&
        classification.flags.includes("reasoning-heavy"),
      augment_code_only: false,
    });

    const messages: OllamaMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: request.prompt },
    ];

    const ollamaResponse = await this.client.chat(messages, {
      temperature: this.config.model.temperature,
      top_p: this.config.model.top_p,
      top_k: this.config.model.top_k,
      repeat_penalty: this.config.model.repeat_penalty,
      num_ctx: this.config.model.ctx_size,
    });

    const rawContent = ollamaResponse.message.content;
    const confidenceResult = parseConfidence(rawContent);
    const cleanResponse = stripConfidenceTags(rawContent);

    if (
      this.config.gateway.retry_on_medium &&
      confidenceResult.confidence === "medium"
    ) {
      const reviewMessages: OllamaMessage[] = [
        ...messages,
        { role: "assistant", content: rawContent },
        {
          role: "user",
          content:
            "Review your previous answer. Is it correct? If you find issues, provide the corrected version. End with your confidence assessment.",
        },
      ];

      const reviewResponse = await this.client.chat(reviewMessages, {
        temperature: this.config.model.temperature,
        top_p: this.config.model.top_p,
        top_k: this.config.model.top_k,
        repeat_penalty: this.config.model.repeat_penalty,
        num_ctx: this.config.model.ctx_size,
      });

      const reviewContent = reviewResponse.message.content;
      const reviewConfidence = parseConfidence(reviewContent);
      const reviewClean = stripConfidenceTags(reviewContent);

      return {
        response: reviewClean,
        confidence: reviewConfidence.confidence,
        uncertainty_reason: reviewConfidence.uncertainty_reason,
        escalation_recommended: reviewConfidence.escalation_recommended,
        escalation_reason: reviewConfidence.escalation_reason,
        classification,
        model: this.client.getModel(),
        usage: {
          prompt_tokens: reviewResponse.prompt_eval_count ?? 0,
          completion_tokens: reviewResponse.eval_count ?? 0,
          total_tokens:
            (reviewResponse.prompt_eval_count ?? 0) +
            (reviewResponse.eval_count ?? 0),
        },
      };
    }

    return {
      response: cleanResponse,
      confidence: confidenceResult.confidence,
      uncertainty_reason: confidenceResult.uncertainty_reason,
      escalation_recommended: confidenceResult.escalation_recommended,
      escalation_reason: confidenceResult.escalation_reason,
      classification,
      model: this.client.getModel(),
      usage: {
        prompt_tokens: ollamaResponse.prompt_eval_count ?? 0,
        completion_tokens: ollamaResponse.eval_count ?? 0,
        total_tokens:
          (ollamaResponse.prompt_eval_count ?? 0) +
          (ollamaResponse.eval_count ?? 0),
      },
    };
  }
}
