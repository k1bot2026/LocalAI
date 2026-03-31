// cli/src/format.ts
type ConfidenceLevel = "high" | "medium" | "low";

const COLORS = {
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  dim: "\x1b[2m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
} as const;

const CONFIDENCE_COLORS: Record<ConfidenceLevel, string> = {
  high: COLORS.green,
  medium: COLORS.yellow,
  low: COLORS.red,
};

export function formatConfidence(level: ConfidenceLevel): string {
  const color = CONFIDENCE_COLORS[level];
  return `${color}[${level}]${COLORS.reset}`;
}

export function formatResponse(data: {
  response: string;
  confidence: ConfidenceLevel;
  uncertainty_reason: string | null;
  escalation_recommended: boolean;
  escalation_reason: string | null;
}): string {
  const parts: string[] = [];

  parts.push(data.response);
  parts.push(`\n${COLORS.dim}${"─".repeat(40)}${COLORS.reset}`);
  parts.push(`Confidence: ${formatConfidence(data.confidence)}`);

  if (data.uncertainty_reason) {
    parts.push(`${COLORS.yellow}Uncertain: ${data.uncertainty_reason}${COLORS.reset}`);
  }

  if (data.escalation_recommended && data.escalation_reason) {
    parts.push(`${COLORS.red}${COLORS.bold}ESCALATION RECOMMENDED: ${data.escalation_reason}${COLORS.reset}`);
  }

  return parts.join("\n");
}
