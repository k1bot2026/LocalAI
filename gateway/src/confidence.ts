import type { ConfidenceLevel, ConfidenceResult } from "./types.js";

const CONFIDENCE_REGEX = /\[CONFIDENCE:\s*(high|medium|low)\s*\]/i;
const UNCERTAIN_REGEX = /\[UNCERTAIN:\s*(.+?)\s*\]/i;
const ESCALATE_REGEX = /\[ESCALATE:\s*(.+?)\s*\]/i;

export function parseConfidence(text: string): ConfidenceResult {
  const confidenceMatch = text.match(CONFIDENCE_REGEX);
  const uncertainMatch = text.match(UNCERTAIN_REGEX);
  const escalateMatch = text.match(ESCALATE_REGEX);

  if (!confidenceMatch) {
    return {
      confidence: "medium",
      uncertainty_reason: "Model did not provide confidence assessment",
      escalation_recommended: false,
      escalation_reason: null,
    };
  }

  const confidence = confidenceMatch[1].toLowerCase() as ConfidenceLevel;
  const uncertainty_reason = uncertainMatch ? uncertainMatch[1] : null;
  const escalation_reason = escalateMatch ? escalateMatch[1] : null;
  const escalation_recommended = confidence === "low";

  return {
    confidence,
    uncertainty_reason,
    escalation_recommended,
    escalation_reason,
  };
}

export function stripConfidenceTags(text: string): string {
  return text
    .replace(/\n*\[CONFIDENCE:\s*.+?\]/gi, "")
    .replace(/\n*\[UNCERTAIN:\s*.+?\]/gi, "")
    .replace(/\n*\[ESCALATE:\s*.+?\]/gi, "")
    .trim();
}
