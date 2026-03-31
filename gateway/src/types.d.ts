export type ConfidenceLevel = "high" | "medium" | "low";
export interface TaskClassification {
    complexity: "simple" | "moderate" | "complex";
    flags: string[];
    pre_warning: string | null;
}
export interface ConfidenceResult {
    confidence: ConfidenceLevel;
    uncertainty_reason: string | null;
    escalation_recommended: boolean;
    escalation_reason: string | null;
}
export interface GatewayResponse {
    response: string;
    confidence: ConfidenceLevel;
    uncertainty_reason: string | null;
    escalation_recommended: boolean;
    escalation_reason: string | null;
    classification: TaskClassification;
    model: string;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}
export interface GatewayRequest {
    prompt: string;
    system?: string;
    file_content?: string;
    file_path?: string;
    skill?: string;
    max_tokens?: number;
    stream?: boolean;
}
export interface GatewayConfig {
    model: {
        name: string;
        base: string;
        ollama_url: string;
        ctx_size: number;
        temperature: number;
        top_p: number;
        top_k: number;
        repeat_penalty: number;
    };
    gateway: {
        port: number;
        retry_on_medium: boolean;
        validate_code_output: boolean;
        prompt_augmentation: boolean;
    };
    confidence: {
        auto_accept: ConfidenceLevel;
        review: ConfidenceLevel;
        escalate: ConfidenceLevel;
    };
    local_delegation: {
        enabled: boolean;
        auto_accept_confidence: ConfidenceLevel;
        review_confidence: ConfidenceLevel;
        escalate_confidence: ConfidenceLevel;
        max_concurrent_local_tasks: number;
    };
    skills_dir: string;
}
export interface OllamaMessage {
    role: "system" | "user" | "assistant";
    content: string;
}
export interface OllamaChatRequest {
    model: string;
    messages: OllamaMessage[];
    stream: boolean;
    options?: {
        temperature?: number;
        top_p?: number;
        top_k?: number;
        repeat_penalty?: number;
        num_ctx?: number;
    };
}
export interface OllamaChatResponse {
    message: {
        role: string;
        content: string;
    };
    done: boolean;
    total_duration?: number;
    prompt_eval_count?: number;
    eval_count?: number;
}
//# sourceMappingURL=types.d.ts.map