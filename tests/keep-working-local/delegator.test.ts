import { describe, it, expect, vi } from "vitest";
import { Delegator } from "../../keep-working-local/src/delegator.js";

function createMockFetch(confidence: "high" | "medium" | "low" = "high", response: string = "done") {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      response, confidence,
      uncertainty_reason: confidence === "medium" ? "unsure" : null,
      escalation_recommended: confidence === "low",
      escalation_reason: confidence === "low" ? "too complex" : null,
      classification: { complexity: "simple", flags: [], pre_warning: null },
    }),
  });
}

describe("Delegator", () => {
  it("delegates simple task and returns result", async () => {
    const mockFetch = createMockFetch("high", "formatted code");
    const delegator = new Delegator("http://localhost:5577", mockFetch);
    const result = await delegator.delegateTask("format this code");
    expect(result.handled).toBe(true);
    expect(result.response).toBe("formatted code");
    expect(result.confidence).toBe("high");
    expect(result.needs_escalation).toBe(false);
  });
  it("flags low confidence tasks for escalation", async () => {
    const mockFetch = createMockFetch("low");
    const delegator = new Delegator("http://localhost:5577", mockFetch);
    const result = await delegator.delegateTask("architect a new system");
    expect(result.handled).toBe(true);
    expect(result.needs_escalation).toBe(true);
    expect(result.escalation_reason).toBe("too complex");
  });
  it("handles gateway connection failure gracefully", async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error("ECONNREFUSED"));
    const delegator = new Delegator("http://localhost:5577", mockFetch);
    const result = await delegator.delegateTask("do something");
    expect(result.handled).toBe(false);
    expect(result.error).toContain("ECONNREFUSED");
  });
});
