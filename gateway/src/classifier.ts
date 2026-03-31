import type { TaskClassification } from "./types.js";

const SIMPLE_PATTERNS = [
  /\b(format|lint|prettier|indent)\b/i,
  /\b(rename|replace)\b.*\b(variable|function|class|method|param)\b/i,
  /\badd\s+(a\s+)?comment/i,
  /\badd\s+(jsdoc|docstring|tsdoc)/i,
  /\bgitignore\b/i,
  /\bgenerate\s+(a\s+)?(config|configuration)\b/i,
  /\bcommit\s+message\b/i,
];

const REASONING_PATTERNS = [
  /\bdebug\b/i,
  /\bwhy\s+(does|is|do|are|did|was|were)\b/i,
  /\barchitect\b/i,
  /\bdesign\s+(a\s+)?(system|architecture|distributed)/i,
  /\brefactor\s+(the\s+)?(entire|whole|codebase|project)\b/i,
  /\bmigrat(e|ion)\b/i,
  /\boptimiz(e|ation)\b/i,
];

const SECURITY_PATTERNS = [
  /\b(security|vulnerabilit|exploit)/i,
  /\b(auth|authenticat|authorizat)/i,
  /\b(crypto|encrypt|decrypt|hash|password|secret|token)/i,
  /\b(xss|csrf|injection|sanitiz)/i,
];

const MULTI_FILE_PATTERN = /(\b\w+\/\w+\.\w+\b.*){3,}/;

const LONG_PROMPT_THRESHOLD = 2000;

export function classifyTask(prompt: string): TaskClassification {
  const flags: string[] = [];
  let complexity: TaskClassification["complexity"] = "moderate";
  let pre_warning: string | null = null;

  const isSimple = SIMPLE_PATTERNS.some((p) => p.test(prompt));

  const isReasoningHeavy = REASONING_PATTERNS.some((p) => p.test(prompt));
  if (isReasoningHeavy) flags.push("reasoning-heavy");

  const isSecuritySensitive = SECURITY_PATTERNS.some((p) => p.test(prompt));
  if (isSecuritySensitive) flags.push("security-sensitive");

  const isMultiFile = MULTI_FILE_PATTERN.test(prompt);
  if (isMultiFile) flags.push("multi-file");

  const isLongPrompt = prompt.length > LONG_PROMPT_THRESHOLD;
  if (isLongPrompt) {
    flags.push("long-prompt");
    pre_warning = "Prompt exceeds 2000 characters. Context may be truncated for the local model.";
  }

  if (flags.length === 0 && isSimple) {
    complexity = "simple";
  } else if (
    flags.includes("reasoning-heavy") ||
    flags.includes("security-sensitive") ||
    flags.includes("multi-file")
  ) {
    complexity = "complex";
  } else {
    complexity = "moderate";
  }

  return { complexity, flags, pre_warning };
}
