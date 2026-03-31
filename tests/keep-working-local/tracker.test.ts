import { describe, it, expect } from "vitest";
import { Tracker } from "../../keep-working-local/src/tracker.js";

describe("Tracker", () => {
  it("starts with zero counts", () => {
    const t = new Tracker();
    const stats = t.getStats();
    expect(stats.local_completed).toBe(0);
    expect(stats.paid_completed).toBe(0);
    expect(stats.parked).toBe(0);
    expect(stats.escalated).toBe(0);
  });
  it("tracks local completions", () => {
    const t = new Tracker();
    t.recordLocalComplete();
    t.recordLocalComplete();
    expect(t.getStats().local_completed).toBe(2);
  });
  it("tracks paid completions", () => {
    const t = new Tracker();
    t.recordPaidComplete();
    expect(t.getStats().paid_completed).toBe(1);
  });
  it("tracks parked tasks", () => {
    const t = new Tracker();
    t.recordParked();
    expect(t.getStats().parked).toBe(1);
  });
  it("tracks escalations", () => {
    const t = new Tracker();
    t.recordEscalated();
    expect(t.getStats().escalated).toBe(1);
  });
  it("calculates savings percentage", () => {
    const t = new Tracker();
    t.recordLocalComplete(); t.recordLocalComplete(); t.recordLocalComplete();
    t.recordPaidComplete();
    expect(t.getStats().savings_percent).toBe(75);
  });
  it("returns 0 savings when no tasks completed", () => {
    const t = new Tracker();
    expect(t.getStats().savings_percent).toBe(0);
  });
  it("formats status string", () => {
    const t = new Tracker();
    t.recordLocalComplete(); t.recordPaidComplete(); t.recordParked();
    const status = t.formatStatus("assist");
    expect(status).toContain("assist");
    expect(status).toContain("1");
  });
  it("resets counters", () => {
    const t = new Tracker();
    t.recordLocalComplete(); t.recordPaidComplete();
    t.reset();
    expect(t.getStats().local_completed).toBe(0);
    expect(t.getStats().paid_completed).toBe(0);
  });
});
