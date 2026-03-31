// tests/cli/format.test.ts
import { describe, it, expect } from "vitest";
import { formatConfidence, formatResponse } from "../../cli/src/format.js";

describe("formatConfidence", () => {
  it("formats high confidence in green", () => {
    const result = formatConfidence("high");
    expect(result).toContain("high");
    expect(result).toContain("\x1b[32m");
  });
  it("formats medium confidence in yellow", () => {
    const result = formatConfidence("medium");
    expect(result).toContain("medium");
    expect(result).toContain("\x1b[33m");
  });
  it("formats low confidence in red", () => {
    const result = formatConfidence("low");
    expect(result).toContain("low");
    expect(result).toContain("\x1b[31m");
  });
});

describe("formatResponse", () => {
  it("formats a high-confidence response", () => {
    const result = formatResponse({
      response: "Hello world",
      confidence: "high",
      uncertainty_reason: null,
      escalation_recommended: false,
      escalation_reason: null,
    });
    expect(result).toContain("Hello world");
    expect(result).toContain("high");
  });
  it("includes uncertainty reason for medium confidence", () => {
    const result = formatResponse({
      response: "Some output",
      confidence: "medium",
      uncertainty_reason: "Not sure about types",
      escalation_recommended: false,
      escalation_reason: null,
    });
    expect(result).toContain("Not sure about types");
  });
  it("includes escalation warning for low confidence", () => {
    const result = formatResponse({
      response: "Attempted output",
      confidence: "low",
      uncertainty_reason: null,
      escalation_recommended: true,
      escalation_reason: "Needs multi-file reasoning",
    });
    expect(result).toContain("Needs multi-file reasoning");
    expect(result).toContain("ESCALATION");
  });
});
