export type LocalMode = "off" | "assist" | "full";
export type TaskComplexity = "simple" | "moderate" | "complex";

export class TierManager {
  private mode: LocalMode = "off";

  getMode(): LocalMode { return this.mode; }
  setMode(mode: LocalMode): void { this.mode = mode; }
  isLocalEnabled(): boolean { return this.mode !== "off"; }
  isPaidLead(): boolean { return this.mode === "assist"; }

  shouldDelegateToLocal(complexity: TaskComplexity): boolean {
    switch (this.mode) {
      case "off": return false;
      case "assist": return complexity === "simple" || complexity === "moderate";
      case "full": return true;
    }
  }
}
