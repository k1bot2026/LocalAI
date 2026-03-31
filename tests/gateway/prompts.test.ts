import { describe, it, expect } from "vitest";
import { buildSystemPrompt, loadSkillPrompt } from "../../gateway/src/prompts.js";

describe("buildSystemPrompt", () => {
  it("returns base self-awareness prompt", () => {
    const prompt = buildSystemPrompt({});
    expect(prompt).toContain("You are LocalAI");
    expect(prompt).toContain("[CONFIDENCE:");
    expect(prompt).toContain("Strengths");
    expect(prompt).toContain("Limitations");
  });

  it("appends file context when provided", () => {
    const prompt = buildSystemPrompt({
      file_path: "src/app.ts",
      file_content: "const x = 1;",
    });
    expect(prompt).toContain("src/app.ts");
    expect(prompt).toContain("const x = 1;");
  });

  it("appends step-by-step instruction for reasoning tasks", () => {
    const prompt = buildSystemPrompt({ augment_reasoning: true });
    expect(prompt).toContain("Think step by step");
  });

  it("appends code-only instruction for code generation", () => {
    const prompt = buildSystemPrompt({ augment_code_only: true });
    expect(prompt).toContain("Output only the code");
  });
});

describe("loadSkillPrompt", () => {
  it("returns null for non-existent skill", () => {
    const result = loadSkillPrompt("nonexistent", "/fake/path");
    expect(result).toBeNull();
  });
});
