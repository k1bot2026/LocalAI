import { readFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";

const SELF_AWARENESS_PATH = resolve(
  import.meta.dirname,
  "../../config/prompts/self-awareness.md"
);

let cachedSelfAwareness: string | null = null;

function getSelfAwarenessPrompt(): string {
  if (cachedSelfAwareness) return cachedSelfAwareness;
  try {
    cachedSelfAwareness = readFileSync(SELF_AWARENESS_PATH, "utf-8");
  } catch {
    cachedSelfAwareness = [
      "You are LocalAI, a local coding assistant.",
      "End every response with [CONFIDENCE: high|medium|low].",
      "If uncertain, add [UNCERTAIN: reason]. If unable, add [ESCALATE: reason].",
    ].join("\n");
  }
  return cachedSelfAwareness;
}

export interface PromptOptions {
  file_path?: string;
  file_content?: string;
  augment_reasoning?: boolean;
  augment_code_only?: boolean;
  custom_system?: string;
}

export function buildSystemPrompt(options: PromptOptions): string {
  const parts: string[] = [];

  parts.push(getSelfAwarenessPrompt());

  if (options.custom_system) {
    parts.push(`\n## Additional Instructions\n\n${options.custom_system}`);
  }

  if (options.file_path && options.file_content) {
    parts.push(
      `\n## File Context\n\nYou are working with the file \`${options.file_path}\`:\n\n\`\`\`\n${options.file_content}\n\`\`\``
    );
  }

  if (options.augment_reasoning) {
    parts.push(
      "\n## Approach\n\nThink step by step. Break the problem down before answering."
    );
  }

  if (options.augment_code_only) {
    parts.push(
      "\n## Output Format\n\nOutput only the code, no explanation. No markdown fences unless the output is a markdown file."
    );
  }

  return parts.join("\n");
}

export function loadSkillPrompt(
  skillName: string,
  skillsDir: string
): string | null {
  const candidates = [
    join(skillsDir, `${skillName}.md`),
    join(skillsDir, ...skillName.split("/")),
  ];

  if (!skillName.endsWith(".md")) {
    candidates.push(join(skillsDir, `${skillName}.md`));
  }

  for (const candidate of candidates) {
    const resolved = candidate.endsWith(".md") ? candidate : `${candidate}.md`;
    if (existsSync(resolved)) {
      return readFileSync(resolved, "utf-8");
    }
  }

  return null;
}

export function _resetCache(): void {
  cachedSelfAwareness = null;
}
