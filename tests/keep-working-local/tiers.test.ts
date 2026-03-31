import { describe, it, expect } from "vitest";
import { TierManager } from "../../keep-working-local/src/tiers.js";

describe("TierManager", () => {
  it("starts in off mode", () => {
    const tm = new TierManager();
    expect(tm.getMode()).toBe("off");
    expect(tm.isLocalEnabled()).toBe(false);
  });
  it("switches to assist mode", () => {
    const tm = new TierManager();
    tm.setMode("assist");
    expect(tm.getMode()).toBe("assist");
    expect(tm.isLocalEnabled()).toBe(true);
    expect(tm.isPaidLead()).toBe(true);
  });
  it("switches to full mode", () => {
    const tm = new TierManager();
    tm.setMode("full");
    expect(tm.getMode()).toBe("full");
    expect(tm.isLocalEnabled()).toBe(true);
    expect(tm.isPaidLead()).toBe(false);
  });
  it("switches back to off", () => {
    const tm = new TierManager();
    tm.setMode("full");
    tm.setMode("off");
    expect(tm.getMode()).toBe("off");
    expect(tm.isLocalEnabled()).toBe(false);
  });
  it("shouldDelegateToLocal returns false when off", () => {
    const tm = new TierManager();
    expect(tm.shouldDelegateToLocal("simple")).toBe(false);
  });
  it("shouldDelegateToLocal delegates simple tasks in assist mode", () => {
    const tm = new TierManager();
    tm.setMode("assist");
    expect(tm.shouldDelegateToLocal("simple")).toBe(true);
    expect(tm.shouldDelegateToLocal("moderate")).toBe(true);
    expect(tm.shouldDelegateToLocal("complex")).toBe(false);
  });
  it("shouldDelegateToLocal delegates all tasks in full mode", () => {
    const tm = new TierManager();
    tm.setMode("full");
    expect(tm.shouldDelegateToLocal("simple")).toBe(true);
    expect(tm.shouldDelegateToLocal("moderate")).toBe(true);
    expect(tm.shouldDelegateToLocal("complex")).toBe(true);
  });
});
