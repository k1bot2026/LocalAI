import { describe, it, expect } from "vitest";
import { classifyTask } from "../../gateway/src/classifier.js";

describe("classifyTask", () => {
  it("classifies simple formatting tasks as simple", () => {
    const result = classifyTask("format this code properly");
    expect(result.complexity).toBe("simple");
    expect(result.flags).toEqual([]);
    expect(result.pre_warning).toBeNull();
  });

  it("classifies rename tasks as simple", () => {
    const result = classifyTask("rename the variable foo to bar");
    expect(result.complexity).toBe("simple");
  });

  it("classifies add comment tasks as simple", () => {
    const result = classifyTask("add a comment explaining this function");
    expect(result.complexity).toBe("simple");
  });

  it("flags debug tasks as reasoning-heavy", () => {
    const result = classifyTask("debug why the auth middleware fails on POST");
    expect(result.complexity).toBe("complex");
    expect(result.flags).toContain("reasoning-heavy");
  });

  it("flags architecture tasks as reasoning-heavy", () => {
    const result = classifyTask("architect a new microservice for payments");
    expect(result.complexity).toBe("complex");
    expect(result.flags).toContain("reasoning-heavy");
  });

  it("flags security-sensitive tasks", () => {
    const result = classifyTask("review the authentication flow for vulnerabilities");
    expect(result.complexity).toBe("complex");
    expect(result.flags).toContain("security-sensitive");
  });

  it("flags crypto tasks as security-sensitive", () => {
    const result = classifyTask("implement encryption for user passwords");
    expect(result.flags).toContain("security-sensitive");
  });

  it("flags multi-file requests as complex", () => {
    const result = classifyTask(
      "update src/app.ts, src/routes.ts, and src/middleware.ts to add logging"
    );
    expect(result.complexity).toBe("complex");
    expect(result.flags).toContain("multi-file");
  });

  it("flags long prompts as potentially complex", () => {
    const longPrompt = "do something ".repeat(200);
    const result = classifyTask(longPrompt);
    expect(result.flags).toContain("long-prompt");
    expect(result.pre_warning).not.toBeNull();
  });

  it("classifies moderate tasks", () => {
    const result = classifyTask("write a unit test for the calculateTotal function");
    expect(result.complexity).toBe("moderate");
  });

  it("classifies why-does questions as complex", () => {
    const result = classifyTask("why does this function return undefined sometimes?");
    expect(result.complexity).toBe("complex");
    expect(result.flags).toContain("reasoning-heavy");
  });
});
