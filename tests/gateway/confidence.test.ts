import { describe, it, expect } from "vitest";
import { parseConfidence, stripConfidenceTags } from "../../gateway/src/confidence.js";

describe("parseConfidence", () => {
  it("extracts high confidence", () => {
    const text = "Here is the code.\n\n[CONFIDENCE: high]";
    const result = parseConfidence(text);
    expect(result.confidence).toBe("high");
    expect(result.uncertainty_reason).toBeNull();
    expect(result.escalation_recommended).toBe(false);
    expect(result.escalation_reason).toBeNull();
  });

  it("extracts medium confidence with uncertainty", () => {
    const text = "Here is the code.\n\n[CONFIDENCE: medium]\n[UNCERTAIN: Not sure about the import path]";
    const result = parseConfidence(text);
    expect(result.confidence).toBe("medium");
    expect(result.uncertainty_reason).toBe("Not sure about the import path");
    expect(result.escalation_recommended).toBe(false);
  });

  it("extracts low confidence with escalation", () => {
    const text = "I attempted this but...\n\n[CONFIDENCE: low]\n[ESCALATE: This requires multi-file reasoning]";
    const result = parseConfidence(text);
    expect(result.confidence).toBe("low");
    expect(result.escalation_recommended).toBe(true);
    expect(result.escalation_reason).toBe("This requires multi-file reasoning");
  });

  it("defaults to medium when no confidence tag found", () => {
    const text = "Here is some output without tags.";
    const result = parseConfidence(text);
    expect(result.confidence).toBe("medium");
    expect(result.uncertainty_reason).toBe("Model did not provide confidence assessment");
  });

  it("handles confidence tag with extra whitespace", () => {
    const text = "Output.\n\n[CONFIDENCE:   high  ]";
    const result = parseConfidence(text);
    expect(result.confidence).toBe("high");
  });

  it("handles case-insensitive confidence values", () => {
    const text = "Output.\n\n[CONFIDENCE: High]";
    const result = parseConfidence(text);
    expect(result.confidence).toBe("high");
  });
});

describe("stripConfidenceTags", () => {
  it("removes confidence tag from output", () => {
    const text = "Here is the code.\n\n[CONFIDENCE: high]";
    expect(stripConfidenceTags(text)).toBe("Here is the code.");
  });

  it("removes confidence, uncertain, and escalate tags", () => {
    const text = "Output.\n\n[CONFIDENCE: low]\n[UNCERTAIN: something]\n[ESCALATE: reason]";
    expect(stripConfidenceTags(text)).toBe("Output.");
  });

  it("returns original text when no tags present", () => {
    const text = "No tags here.";
    expect(stripConfidenceTags(text)).toBe("No tags here.");
  });
});
