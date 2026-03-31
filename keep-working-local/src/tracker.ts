export interface TrackerStats {
  local_completed: number;
  paid_completed: number;
  parked: number;
  escalated: number;
  savings_percent: number;
}

export class Tracker {
  private localCompleted = 0;
  private paidCompleted = 0;
  private parked = 0;
  private escalated = 0;

  recordLocalComplete(): void { this.localCompleted++; }
  recordPaidComplete(): void { this.paidCompleted++; }
  recordParked(): void { this.parked++; }
  recordEscalated(): void { this.escalated++; }

  getStats(): TrackerStats {
    const total = this.localCompleted + this.paidCompleted;
    const savings_percent = total === 0 ? 0 : Math.round((this.localCompleted / total) * 100);
    return {
      local_completed: this.localCompleted,
      paid_completed: this.paidCompleted,
      parked: this.parked,
      escalated: this.escalated,
      savings_percent,
    };
  }

  formatStatus(mode: string): string {
    const stats = this.getStats();
    return [
      `Mode: ${mode}`,
      `Tasks completed (local): ${stats.local_completed}`,
      `Tasks completed (paid): ${stats.paid_completed}`,
      `Tasks parked (needs-paid): ${stats.parked}`,
      `Tasks escalated: ${stats.escalated}`,
      `Estimated token savings: ~${stats.savings_percent}%`,
    ].join("\n");
  }

  reset(): void {
    this.localCompleted = 0;
    this.paidCompleted = 0;
    this.parked = 0;
    this.escalated = 0;
  }
}
