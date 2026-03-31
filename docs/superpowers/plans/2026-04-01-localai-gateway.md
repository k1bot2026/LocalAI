# LocalAI Gateway Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local AI gateway on Mac Mini M4 that wraps Ollama + Qwen2.5-Coder-7B with self-awareness, confidence scoring, and three interfaces (CLI, MCP server, OpenAI-compatible API), plus keep-working integration with three delegation tiers.

**Architecture:** A TypeScript monorepo with four packages — gateway (Express API server + core logic), mcp-server (MCP stdio server), cli (Commander.js CLI), and keep-working-local (keep-working plugin integration). The gateway wraps Ollama, injects self-awareness system prompts, parses confidence from responses, and pre-classifies tasks. All three interfaces share the same core logic.

**Tech Stack:** TypeScript, Express, @modelcontextprotocol/sdk, Commander.js, Ollama, Qwen2.5-Coder-7B-Instruct, launchd, Vitest for tests.

---

## File Structure

```
/Volumes/ProjectData/LocalAI/
├── package.json                          # Monorepo root (npm workspaces)
├── tsconfig.base.json                    # Shared TypeScript config
├── gateway/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── types.ts                      # Shared types: Confidence, ClassifiedTask, GatewayResponse
│       ├── prompts.ts                    # System prompt builder from self-awareness.md template
│       ├── classifier.ts                 # Pre-classification heuristics
│       ├── confidence.ts                 # Response parsing, confidence extraction
│       ├── ollama.ts                     # Ollama HTTP client wrapper
│       ├── gateway.ts                    # Core orchestrator: classify → prompt → call → parse
│       ├── server.ts                     # Express server: /v1/chat/completions + /health
│       └── index.ts                      # Entry point: starts Express server
├── mcp-server/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── tools.ts                      # MCP tool definitions (query, code_edit, summarize)
│       └── index.ts                      # MCP stdio server entry point
├── cli/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── format.ts                     # Terminal formatting: confidence colors, output
│       └── index.ts                      # CLI entry point: Commander.js setup
├── keep-working-local/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── delegator.ts                  # Task classification + delegation to local
│       ├── tiers.ts                      # Tier management (off/assist/full)
│       ├── tracker.ts                    # Stats: tasks delegated, escalated, savings
│       └── index.ts                      # Plugin entry point
├── config/
│   ├── default.json                      # Default gateway settings
│   └── prompts/
│       └── self-awareness.md             # Self-awareness system prompt template
├── skills/                               # Prompt chain templates (markdown files)
│   ├── code-review.md
│   ├── explain-code.md
│   ├── write-tests.md
│   ├── refactor.md
│   ├── commit-message.md
│   ├── summarize.md
│   ├── doc-writer.md
│   ├── research/
│   │   ├── codebase-explore.md
│   │   ├── doc-lookup.md
│   │   ├── tech-compare.md
│   │   ├── dependency-audit.md
│   │   └── changelog-digest.md
│   ├── design/
│   │   ├── api-design.md
│   │   ├── db-schema.md
│   │   ├── component-spec.md
│   │   ├── wireframe-text.md
│   │   ├── system-diagram.md
│   │   └── design-review.md
│   ├── generation/
│   │   ├── scaffold-project.md
│   │   ├── dockerfile.md
│   │   ├── ci-pipeline.md
│   │   ├── config-file.md
│   │   ├── test-scaffold.md
│   │   ├── migration.md
│   │   └── boilerplate.md
│   └── architecture/
│       ├── pattern-recommend.md
│       ├── dependency-map.md
│       ├── migration-plan.md
│       ├── architecture-review.md
│       ├── decision-record.md
│       └── scaling-basics.md
├── scripts/
│   ├── install.sh                        # One-command full setup
│   ├── uninstall.sh                      # Clean removal
│   └── com.localai.gateway.plist         # launchd service definition
└── tests/
    ├── gateway/
    │   ├── classifier.test.ts
    │   ├── confidence.test.ts
    │   ├── prompts.test.ts
    │   ├── ollama.test.ts
    │   ├── gateway.test.ts
    │   └── server.test.ts
    ├── mcp-server/
    │   └── tools.test.ts
    ├── cli/
    │   └── format.test.ts
    └── keep-working-local/
        ├── delegator.test.ts
        ├── tiers.test.ts
        └── tracker.test.ts
```

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.base.json`
- Create: `gateway/package.json`
- Create: `gateway/tsconfig.json`
- Create: `mcp-server/package.json`
- Create: `mcp-server/tsconfig.json`
- Create: `cli/package.json`
- Create: `cli/tsconfig.json`
- Create: `keep-working-local/package.json`
- Create: `keep-working-local/tsconfig.json`

- [ ] **Step 1: Create root package.json with workspaces**

```json
{
  "name": "localai",
  "version": "0.1.0",
  "private": true,
  "workspaces": [
    "gateway",
    "mcp-server",
    "cli",
    "keep-working-local"
  ],
  "scripts": {
    "build": "npm run build --workspaces",
    "test": "vitest run",
    "test:watch": "vitest",
    "dev:gateway": "npm run dev -w gateway",
    "dev:cli": "npm run dev -w cli"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "vitest": "^3.0.0",
    "@types/node": "^22.0.0"
  }
}
```

- [ ] **Step 2: Create tsconfig.base.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  }
}
```

- [ ] **Step 3: Create gateway/package.json**

```json
{
  "name": "@localai/gateway",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "dev": "tsx watch src/index.ts",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "express": "^5.0.0"
  },
  "devDependencies": {
    "@types/express": "^5.0.0",
    "tsx": "^4.0.0"
  }
}
```

- [ ] **Step 4: Create gateway/tsconfig.json**

```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

- [ ] **Step 5: Create mcp-server/package.json**

```json
{
  "name": "@localai/mcp-server",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "dist/index.js",
  "bin": {
    "localai-mcp": "dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0"
  }
}
```

- [ ] **Step 6: Create mcp-server/tsconfig.json**

```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

- [ ] **Step 7: Create cli/package.json**

```json
{
  "name": "@localai/cli",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "dist/index.js",
  "bin": {
    "local-ai": "dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsx src/index.ts"
  },
  "dependencies": {
    "commander": "^13.0.0"
  }
}
```

- [ ] **Step 8: Create cli/tsconfig.json**

```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

- [ ] **Step 9: Create keep-working-local/package.json**

```json
{
  "name": "@localai/keep-working-local",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc"
  }
}
```

- [ ] **Step 10: Create keep-working-local/tsconfig.json**

```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

- [ ] **Step 11: Install dependencies**

Run: `cd /Volumes/ProjectData/LocalAI && npm install`
Expected: Successful install, node_modules created, all workspaces linked.

- [ ] **Step 12: Commit**

```bash
git init
git add package.json tsconfig.base.json gateway/package.json gateway/tsconfig.json mcp-server/package.json mcp-server/tsconfig.json cli/package.json cli/tsconfig.json keep-working-local/package.json keep-working-local/tsconfig.json
git commit -m "chore: scaffold monorepo with four workspace packages"
```

---

### Task 2: Config & Self-Awareness Prompt

**Files:**
- Create: `config/default.json`
- Create: `config/prompts/self-awareness.md`

- [ ] **Step 1: Create config/default.json**

```json
{
  "model": {
    "name": "localai-coder",
    "base": "qwen2.5-coder:7b-instruct",
    "ollama_url": "http://localhost:11434",
    "ctx_size": 8192,
    "temperature": 0.3,
    "top_p": 0.85,
    "top_k": 40,
    "repeat_penalty": 1.1
  },
  "gateway": {
    "port": 5577,
    "retry_on_medium": false,
    "validate_code_output": true,
    "prompt_augmentation": true
  },
  "confidence": {
    "auto_accept": "high",
    "review": "medium",
    "escalate": "low"
  },
  "local_delegation": {
    "enabled": false,
    "auto_accept_confidence": "high",
    "review_confidence": "medium",
    "escalate_confidence": "low",
    "max_concurrent_local_tasks": 1
  },
  "skills_dir": "./skills"
}
```

- [ ] **Step 2: Create config/prompts/self-awareness.md**

```markdown
You are LocalAI, a capable local coding assistant running Qwen2.5-Coder-7B on a Mac Mini M4.

## Your Strengths (handle confidently)

- Single-file code edits, formatting, linting fixes
- Boilerplate and config generation from clear specifications
- Code summarization and explanation
- Documentation, comments, changelogs, and commit messages
- Git commit messages and simple git operations
- File search, grep, content extraction
- Test execution and basic result interpretation
- Simple refactoring within a single file
- Standard Dockerfiles, basic CI workflows
- CRUD API design, relational database schemas
- Design pattern recommendations for common problems
- Dependency listing and basic analysis
- Text-based wireframes and Mermaid diagrams

## Your Limitations (flag uncertainty)

- Multi-file architectural changes or cross-file refactoring
- Complex debugging requiring deep reasoning chains
- Tasks requiring understanding of more than ~4000 tokens of context
- Novel algorithm design or optimization
- Security-sensitive code review (auth, crypto, input validation)
- Distributed system design (consensus, sharding, sagas)
- Complex tradeoff analysis with multiple competing concerns
- Zero-downtime migration strategies
- Tasks where you are unsure about the codebase's conventions
- Evaluative recommendations ("which is best for X?")

## Response Rules

1. End EVERY response with exactly one of:
   - `[CONFIDENCE: high]` — you are confident in the quality and correctness
   - `[CONFIDENCE: medium]` — you completed the task but have specific uncertainties (explain them)
   - `[CONFIDENCE: low]` — this task likely exceeds your abilities (explain why and recommend escalation)

2. If your confidence is medium, add a line: `[UNCERTAIN: <brief explanation>]`

3. If your confidence is low, add a line: `[ESCALATE: <reason this needs a more capable model>]`

4. NEVER hallucinate file paths, function names, API endpoints, or library methods. If you don't know, say "I don't know" or "I cannot verify this."

5. If a task feels too complex for you, say so BEFORE attempting it — don't produce low-quality output silently.

6. When working with code, prefer showing the actual code over describing what to do.

7. Be concise. Lead with the answer, not the reasoning.
```

- [ ] **Step 3: Commit**

```bash
git add config/
git commit -m "feat: add default config and self-awareness prompt template"
```

---

### Task 3: Shared Types

**Files:**
- Create: `gateway/src/types.ts`
- Test: `tests/gateway/types.test.ts` (type-check only)

- [ ] **Step 1: Write the types file**

```typescript
// gateway/src/types.ts

export type ConfidenceLevel = "high" | "medium" | "low";

export interface TaskClassification {
  complexity: "simple" | "moderate" | "complex";
  flags: string[];
  pre_warning: string | null;
}

export interface ConfidenceResult {
  confidence: ConfidenceLevel;
  uncertainty_reason: string | null;
  escalation_recommended: boolean;
  escalation_reason: string | null;
}

export interface GatewayResponse {
  response: string;
  confidence: ConfidenceLevel;
  uncertainty_reason: string | null;
  escalation_recommended: boolean;
  escalation_reason: string | null;
  classification: TaskClassification;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface GatewayRequest {
  prompt: string;
  system?: string;
  file_content?: string;
  file_path?: string;
  skill?: string;
  max_tokens?: number;
  stream?: boolean;
}

export interface GatewayConfig {
  model: {
    name: string;
    base: string;
    ollama_url: string;
    ctx_size: number;
    temperature: number;
    top_p: number;
    top_k: number;
    repeat_penalty: number;
  };
  gateway: {
    port: number;
    retry_on_medium: boolean;
    validate_code_output: boolean;
    prompt_augmentation: boolean;
  };
  confidence: {
    auto_accept: ConfidenceLevel;
    review: ConfidenceLevel;
    escalate: ConfidenceLevel;
  };
  local_delegation: {
    enabled: boolean;
    auto_accept_confidence: ConfidenceLevel;
    review_confidence: ConfidenceLevel;
    escalate_confidence: ConfidenceLevel;
    max_concurrent_local_tasks: number;
  };
  skills_dir: string;
}

export interface OllamaMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OllamaChatRequest {
  model: string;
  messages: OllamaMessage[];
  stream: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    top_k?: number;
    repeat_penalty?: number;
    num_ctx?: number;
  };
}

export interface OllamaChatResponse {
  message: {
    role: string;
    content: string;
  };
  done: boolean;
  total_duration?: number;
  prompt_eval_count?: number;
  eval_count?: number;
}
```

- [ ] **Step 2: Write a type-check test**

```typescript
// tests/gateway/types.test.ts
import { describe, it, expect } from "vitest";
import type {
  ConfidenceLevel,
  GatewayResponse,
  GatewayRequest,
  TaskClassification,
} from "../../gateway/src/types.js";

describe("types", () => {
  it("GatewayResponse has required shape", () => {
    const response: GatewayResponse = {
      response: "hello",
      confidence: "high",
      uncertainty_reason: null,
      escalation_recommended: false,
      escalation_reason: null,
      classification: {
        complexity: "simple",
        flags: [],
        pre_warning: null,
      },
      model: "localai-coder",
      usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
    };
    expect(response.confidence).toBe("high");
    expect(response.escalation_recommended).toBe(false);
  });

  it("GatewayRequest allows optional fields", () => {
    const minimal: GatewayRequest = { prompt: "test" };
    expect(minimal.prompt).toBe("test");
    expect(minimal.file_content).toBeUndefined();

    const full: GatewayRequest = {
      prompt: "test",
      system: "be helpful",
      file_content: "const x = 1;",
      file_path: "src/x.ts",
      skill: "code-review",
      max_tokens: 1000,
      stream: false,
    };
    expect(full.skill).toBe("code-review");
  });
});
```

- [ ] **Step 3: Create vitest.config.ts at root**

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
  },
});
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /Volumes/ProjectData/LocalAI && npx vitest run tests/gateway/types.test.ts`
Expected: 2 tests pass.

- [ ] **Step 5: Commit**

```bash
git add gateway/src/types.ts tests/gateway/types.test.ts vitest.config.ts
git commit -m "feat: add shared types for gateway, requests, and responses"
```

---

### Task 4: Task Pre-Classifier

**Files:**
- Create: `gateway/src/classifier.ts`
- Test: `tests/gateway/classifier.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// tests/gateway/classifier.test.ts
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /Volumes/ProjectData/LocalAI && npx vitest run tests/gateway/classifier.test.ts`
Expected: FAIL — cannot find module `../../gateway/src/classifier.js`

- [ ] **Step 3: Implement the classifier**

```typescript
// gateway/src/classifier.ts
import type { TaskClassification } from "./types.js";

const SIMPLE_PATTERNS = [
  /\b(format|lint|prettier|indent)\b/i,
  /\b(rename|replace)\b.*\b(variable|function|class|method|param)\b/i,
  /\badd\s+(a\s+)?comment/i,
  /\badd\s+(jsdoc|docstring|tsdoc)/i,
  /\bgitignore\b/i,
  /\bgenerate\s+(a\s+)?(config|configuration)\b/i,
  /\bcommit\s+message\b/i,
];

const REASONING_PATTERNS = [
  /\bdebug\b/i,
  /\bwhy\s+(does|is|do|are|did|was|were)\b/i,
  /\barchitect\b/i,
  /\bdesign\s+(a\s+)?(system|architecture|distributed)/i,
  /\brefactor\s+(the\s+)?(entire|whole|codebase|project)\b/i,
  /\bmigrat(e|ion)\b/i,
  /\boptimiz(e|ation)\b/i,
];

const SECURITY_PATTERNS = [
  /\b(security|vulnerabilit|exploit)\b/i,
  /\b(auth|authenticat|authorizat)\b/i,
  /\b(crypto|encrypt|decrypt|hash|password|secret|token)\b/i,
  /\b(xss|csrf|injection|sanitiz)\b/i,
];

const MULTI_FILE_PATTERN = /(\b\w+\/\w+\.\w+\b.*){3,}/;

const LONG_PROMPT_THRESHOLD = 2000;

export function classifyTask(prompt: string): TaskClassification {
  const flags: string[] = [];
  let complexity: TaskClassification["complexity"] = "moderate";
  let pre_warning: string | null = null;

  // Check for simple patterns first
  const isSimple = SIMPLE_PATTERNS.some((p) => p.test(prompt));

  // Check for complexity signals
  const isReasoningHeavy = REASONING_PATTERNS.some((p) => p.test(prompt));
  if (isReasoningHeavy) flags.push("reasoning-heavy");

  const isSecuritySensitive = SECURITY_PATTERNS.some((p) => p.test(prompt));
  if (isSecuritySensitive) flags.push("security-sensitive");

  const isMultiFile = MULTI_FILE_PATTERN.test(prompt);
  if (isMultiFile) flags.push("multi-file");

  const isLongPrompt = prompt.length > LONG_PROMPT_THRESHOLD;
  if (isLongPrompt) {
    flags.push("long-prompt");
    pre_warning =
      "Prompt exceeds 2000 characters. Context may be truncated for the local model.";
  }

  // Determine overall complexity
  if (flags.length === 0 && isSimple) {
    complexity = "simple";
  } else if (
    flags.includes("reasoning-heavy") ||
    flags.includes("security-sensitive") ||
    flags.includes("multi-file")
  ) {
    complexity = "complex";
  } else {
    complexity = "moderate";
  }

  return { complexity, flags, pre_warning };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /Volumes/ProjectData/LocalAI && npx vitest run tests/gateway/classifier.test.ts`
Expected: All 11 tests pass.

- [ ] **Step 5: Commit**

```bash
git add gateway/src/classifier.ts tests/gateway/classifier.test.ts
git commit -m "feat: add task pre-classifier with heuristic complexity detection"
```

---

### Task 5: Confidence Parser

**Files:**
- Create: `gateway/src/confidence.ts`
- Test: `tests/gateway/confidence.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// tests/gateway/confidence.test.ts
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
    const text =
      "Here is the code.\n\n[CONFIDENCE: medium]\n[UNCERTAIN: Not sure about the import path]";
    const result = parseConfidence(text);
    expect(result.confidence).toBe("medium");
    expect(result.uncertainty_reason).toBe("Not sure about the import path");
    expect(result.escalation_recommended).toBe(false);
  });

  it("extracts low confidence with escalation", () => {
    const text =
      "I attempted this but...\n\n[CONFIDENCE: low]\n[ESCALATE: This requires multi-file reasoning]";
    const result = parseConfidence(text);
    expect(result.confidence).toBe("low");
    expect(result.escalation_recommended).toBe(true);
    expect(result.escalation_reason).toBe("This requires multi-file reasoning");
  });

  it("defaults to medium when no confidence tag found", () => {
    const text = "Here is some output without tags.";
    const result = parseConfidence(text);
    expect(result.confidence).toBe("medium");
    expect(result.uncertainty_reason).toBe(
      "Model did not provide confidence assessment"
    );
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
    const text =
      "Output.\n\n[CONFIDENCE: low]\n[UNCERTAIN: something]\n[ESCALATE: reason]";
    expect(stripConfidenceTags(text)).toBe("Output.");
  });

  it("returns original text when no tags present", () => {
    const text = "No tags here.";
    expect(stripConfidenceTags(text)).toBe("No tags here.");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /Volumes/ProjectData/LocalAI && npx vitest run tests/gateway/confidence.test.ts`
Expected: FAIL — cannot find module.

- [ ] **Step 3: Implement confidence parser**

```typescript
// gateway/src/confidence.ts
import type { ConfidenceLevel, ConfidenceResult } from "./types.js";

const CONFIDENCE_REGEX = /\[CONFIDENCE:\s*(high|medium|low)\s*\]/i;
const UNCERTAIN_REGEX = /\[UNCERTAIN:\s*(.+?)\s*\]/i;
const ESCALATE_REGEX = /\[ESCALATE:\s*(.+?)\s*\]/i;

export function parseConfidence(text: string): ConfidenceResult {
  const confidenceMatch = text.match(CONFIDENCE_REGEX);
  const uncertainMatch = text.match(UNCERTAIN_REGEX);
  const escalateMatch = text.match(ESCALATE_REGEX);

  if (!confidenceMatch) {
    return {
      confidence: "medium",
      uncertainty_reason: "Model did not provide confidence assessment",
      escalation_recommended: false,
      escalation_reason: null,
    };
  }

  const confidence = confidenceMatch[1].toLowerCase() as ConfidenceLevel;
  const uncertainty_reason = uncertainMatch ? uncertainMatch[1] : null;
  const escalation_reason = escalateMatch ? escalateMatch[1] : null;
  const escalation_recommended = confidence === "low";

  return {
    confidence,
    uncertainty_reason,
    escalation_recommended,
    escalation_reason,
  };
}

export function stripConfidenceTags(text: string): string {
  return text
    .replace(/\n*\[CONFIDENCE:\s*.+?\]/gi, "")
    .replace(/\n*\[UNCERTAIN:\s*.+?\]/gi, "")
    .replace(/\n*\[ESCALATE:\s*.+?\]/gi, "")
    .trim();
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /Volumes/ProjectData/LocalAI && npx vitest run tests/gateway/confidence.test.ts`
Expected: All 9 tests pass.

- [ ] **Step 5: Commit**

```bash
git add gateway/src/confidence.ts tests/gateway/confidence.test.ts
git commit -m "feat: add confidence parser with tag extraction and stripping"
```

---

### Task 6: System Prompt Builder

**Files:**
- Create: `gateway/src/prompts.ts`
- Test: `tests/gateway/prompts.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// tests/gateway/prompts.test.ts
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /Volumes/ProjectData/LocalAI && npx vitest run tests/gateway/prompts.test.ts`
Expected: FAIL — cannot find module.

- [ ] **Step 3: Implement prompt builder**

```typescript
// gateway/src/prompts.ts
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

  // Base self-awareness prompt
  parts.push(getSelfAwarenessPrompt());

  // Custom system prompt (appended, not replacing)
  if (options.custom_system) {
    parts.push(`\n## Additional Instructions\n\n${options.custom_system}`);
  }

  // File context
  if (options.file_path && options.file_content) {
    parts.push(
      `\n## File Context\n\nYou are working with the file \`${options.file_path}\`:\n\n\`\`\`\n${options.file_content}\n\`\`\``
    );
  }

  // Reasoning augmentation
  if (options.augment_reasoning) {
    parts.push(
      "\n## Approach\n\nThink step by step. Break the problem down before answering."
    );
  }

  // Code-only augmentation
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
  // Support both flat ("code-review") and nested ("research/doc-lookup") skill names
  const candidates = [
    join(skillsDir, `${skillName}.md`),
    join(skillsDir, ...skillName.split("/")),
  ];

  // If the name doesn't end with .md, add it to the nested path
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

// Allow cache reset for testing
export function _resetCache(): void {
  cachedSelfAwareness = null;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /Volumes/ProjectData/LocalAI && npx vitest run tests/gateway/prompts.test.ts`
Expected: All 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add gateway/src/prompts.ts tests/gateway/prompts.test.ts
git commit -m "feat: add system prompt builder with self-awareness template and skill loading"
```

---

### Task 7: Ollama Client

**Files:**
- Create: `gateway/src/ollama.ts`
- Test: `tests/gateway/ollama.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// tests/gateway/ollama.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { OllamaClient } from "../../gateway/src/ollama.js";

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("OllamaClient", () => {
  let client: OllamaClient;

  beforeEach(() => {
    client = new OllamaClient("http://localhost:11434", "localai-coder");
    mockFetch.mockReset();
  });

  it("sends chat request with correct format", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: { role: "assistant", content: "Hello\n\n[CONFIDENCE: high]" },
        done: true,
        prompt_eval_count: 10,
        eval_count: 5,
      }),
    });

    const result = await client.chat(
      [{ role: "user", content: "hello" }],
      { temperature: 0.3 }
    );

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe("http://localhost:11434/api/chat");
    const body = JSON.parse(options.body);
    expect(body.model).toBe("localai-coder");
    expect(body.messages[0]).toEqual({ role: "user", content: "hello" });
    expect(body.stream).toBe(false);
    expect(result.message.content).toBe("Hello\n\n[CONFIDENCE: high]");
  });

  it("throws on non-ok response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => "Internal Server Error",
    });

    await expect(
      client.chat([{ role: "user", content: "hello" }])
    ).rejects.toThrow("Ollama request failed (500)");
  });

  it("checks health via /api/tags", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ models: [{ name: "localai-coder" }] }),
    });

    const healthy = await client.isHealthy();
    expect(healthy).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:11434/api/tags",
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });

  it("returns unhealthy on network error", async () => {
    mockFetch.mockRejectedValueOnce(new Error("ECONNREFUSED"));
    const healthy = await client.isHealthy();
    expect(healthy).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /Volumes/ProjectData/LocalAI && npx vitest run tests/gateway/ollama.test.ts`
Expected: FAIL — cannot find module.

- [ ] **Step 3: Implement Ollama client**

```typescript
// gateway/src/ollama.ts
import type { OllamaMessage, OllamaChatRequest, OllamaChatResponse } from "./types.js";

export class OllamaClient {
  constructor(
    private baseUrl: string,
    private model: string
  ) {}

  async chat(
    messages: OllamaMessage[],
    options?: {
      temperature?: number;
      top_p?: number;
      top_k?: number;
      repeat_penalty?: number;
      num_ctx?: number;
    }
  ): Promise<OllamaChatResponse> {
    const body: OllamaChatRequest = {
      model: this.model,
      messages,
      stream: false,
      options,
    };

    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Ollama request failed (${response.status}): ${text}`);
    }

    return response.json() as Promise<OllamaChatResponse>;
  }

  async isHealthy(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        signal: AbortSignal.timeout(3000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  getModel(): string {
    return this.model;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /Volumes/ProjectData/LocalAI && npx vitest run tests/gateway/ollama.test.ts`
Expected: All 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add gateway/src/ollama.ts tests/gateway/ollama.test.ts
git commit -m "feat: add Ollama HTTP client wrapper with health check"
```

---

### Task 8: Core Gateway Orchestrator

**Files:**
- Create: `gateway/src/gateway.ts`
- Test: `tests/gateway/gateway.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// tests/gateway/gateway.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Gateway } from "../../gateway/src/gateway.js";
import type { OllamaClient } from "../../gateway/src/ollama.js";
import type { GatewayConfig } from "../../gateway/src/types.js";

function createMockClient(content: string) {
  return {
    chat: vi.fn().mockResolvedValue({
      message: { role: "assistant", content },
      done: true,
      prompt_eval_count: 50,
      eval_count: 30,
    }),
    isHealthy: vi.fn().mockResolvedValue(true),
    getModel: vi.fn().mockReturnValue("localai-coder"),
    getBaseUrl: vi.fn().mockReturnValue("http://localhost:11434"),
  } as unknown as OllamaClient;
}

const testConfig: GatewayConfig = {
  model: {
    name: "localai-coder",
    base: "qwen2.5-coder:7b-instruct",
    ollama_url: "http://localhost:11434",
    ctx_size: 8192,
    temperature: 0.3,
    top_p: 0.85,
    top_k: 40,
    repeat_penalty: 1.1,
  },
  gateway: {
    port: 5577,
    retry_on_medium: false,
    validate_code_output: true,
    prompt_augmentation: true,
  },
  confidence: { auto_accept: "high", review: "medium", escalate: "low" },
  local_delegation: {
    enabled: false,
    auto_accept_confidence: "high",
    review_confidence: "medium",
    escalate_confidence: "low",
    max_concurrent_local_tasks: 1,
  },
  skills_dir: "./skills",
};

describe("Gateway", () => {
  it("processes a simple request end-to-end", async () => {
    const client = createMockClient("Hello world!\n\n[CONFIDENCE: high]");
    const gw = new Gateway(client, testConfig);

    const result = await gw.process({ prompt: "say hello" });

    expect(result.response).toBe("Hello world!");
    expect(result.confidence).toBe("high");
    expect(result.escalation_recommended).toBe(false);
    expect(result.classification.complexity).toBe("moderate");
    expect(result.model).toBe("localai-coder");
    expect(result.usage.prompt_tokens).toBe(50);
    expect(result.usage.completion_tokens).toBe(30);
  });

  it("includes classification for complex tasks", async () => {
    const client = createMockClient(
      "Attempting debug...\n\n[CONFIDENCE: low]\n[ESCALATE: Needs multi-file reasoning]"
    );
    const gw = new Gateway(client, testConfig);

    const result = await gw.process({
      prompt: "debug why the server crashes on startup",
    });

    expect(result.confidence).toBe("low");
    expect(result.escalation_recommended).toBe(true);
    expect(result.escalation_reason).toBe("Needs multi-file reasoning");
    expect(result.classification.complexity).toBe("complex");
    expect(result.classification.flags).toContain("reasoning-heavy");
  });

  it("passes system prompt with file context to ollama", async () => {
    const client = createMockClient("Explained.\n\n[CONFIDENCE: high]");
    const gw = new Gateway(client, testConfig);

    await gw.process({
      prompt: "explain this",
      file_content: "const x = 1;",
      file_path: "test.ts",
    });

    const callArgs = (client.chat as ReturnType<typeof vi.fn>).mock.calls[0];
    const messages = callArgs[0];
    const systemMsg = messages.find(
      (m: { role: string }) => m.role === "system"
    );
    expect(systemMsg.content).toContain("test.ts");
    expect(systemMsg.content).toContain("const x = 1;");
  });

  it("retries on medium confidence when configured", async () => {
    const client = createMockClient(
      "First attempt.\n\n[CONFIDENCE: medium]\n[UNCERTAIN: not sure about types]"
    );
    // Override for second call
    (client.chat as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      message: {
        role: "assistant",
        content:
          "First attempt.\n\n[CONFIDENCE: medium]\n[UNCERTAIN: not sure about types]",
      },
      done: true,
      prompt_eval_count: 50,
      eval_count: 30,
    });
    (client.chat as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      message: {
        role: "assistant",
        content: "Reviewed and corrected.\n\n[CONFIDENCE: high]",
      },
      done: true,
      prompt_eval_count: 80,
      eval_count: 40,
    });

    const retryConfig = { ...testConfig, gateway: { ...testConfig.gateway, retry_on_medium: true } };
    const gw = new Gateway(client, retryConfig);

    const result = await gw.process({ prompt: "do something" });

    expect(result.confidence).toBe("high");
    expect(result.response).toBe("Reviewed and corrected.");
    expect(client.chat).toHaveBeenCalledTimes(2);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /Volumes/ProjectData/LocalAI && npx vitest run tests/gateway/gateway.test.ts`
Expected: FAIL — cannot find module.

- [ ] **Step 3: Implement the Gateway class**

```typescript
// gateway/src/gateway.ts
import type {
  GatewayConfig,
  GatewayRequest,
  GatewayResponse,
  OllamaMessage,
} from "./types.js";
import type { OllamaClient } from "./ollama.js";
import { classifyTask } from "./classifier.js";
import { parseConfidence, stripConfidenceTags } from "./confidence.js";
import { buildSystemPrompt } from "./prompts.js";

export class Gateway {
  constructor(
    private client: OllamaClient,
    private config: GatewayConfig
  ) {}

  async process(request: GatewayRequest): Promise<GatewayResponse> {
    // Step 1: Pre-classify the task
    const classification = classifyTask(request.prompt);

    // Step 2: Build system prompt with augmentations
    const systemPrompt = buildSystemPrompt({
      file_path: request.file_path,
      file_content: request.file_content,
      custom_system: request.system,
      augment_reasoning:
        this.config.gateway.prompt_augmentation &&
        classification.flags.includes("reasoning-heavy"),
      augment_code_only: false,
    });

    // Step 3: Build messages
    const messages: OllamaMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: request.prompt },
    ];

    // Step 4: Call Ollama
    const ollamaResponse = await this.client.chat(messages, {
      temperature: this.config.model.temperature,
      top_p: this.config.model.top_p,
      top_k: this.config.model.top_k,
      repeat_penalty: this.config.model.repeat_penalty,
      num_ctx: this.config.model.ctx_size,
    });

    // Step 5: Parse confidence
    const rawContent = ollamaResponse.message.content;
    const confidenceResult = parseConfidence(rawContent);
    const cleanResponse = stripConfidenceTags(rawContent);

    // Step 6: Optional self-review retry on medium confidence
    if (
      this.config.gateway.retry_on_medium &&
      confidenceResult.confidence === "medium"
    ) {
      const reviewMessages: OllamaMessage[] = [
        ...messages,
        { role: "assistant", content: rawContent },
        {
          role: "user",
          content:
            "Review your previous answer. Is it correct? If you find issues, provide the corrected version. End with your confidence assessment.",
        },
      ];

      const reviewResponse = await this.client.chat(reviewMessages, {
        temperature: this.config.model.temperature,
        top_p: this.config.model.top_p,
        top_k: this.config.model.top_k,
        repeat_penalty: this.config.model.repeat_penalty,
        num_ctx: this.config.model.ctx_size,
      });

      const reviewContent = reviewResponse.message.content;
      const reviewConfidence = parseConfidence(reviewContent);
      const reviewClean = stripConfidenceTags(reviewContent);

      return {
        response: reviewClean,
        confidence: reviewConfidence.confidence,
        uncertainty_reason: reviewConfidence.uncertainty_reason,
        escalation_recommended: reviewConfidence.escalation_recommended,
        escalation_reason: reviewConfidence.escalation_reason,
        classification,
        model: this.client.getModel(),
        usage: {
          prompt_tokens: reviewResponse.prompt_eval_count ?? 0,
          completion_tokens: reviewResponse.eval_count ?? 0,
          total_tokens:
            (reviewResponse.prompt_eval_count ?? 0) +
            (reviewResponse.eval_count ?? 0),
        },
      };
    }

    return {
      response: cleanResponse,
      confidence: confidenceResult.confidence,
      uncertainty_reason: confidenceResult.uncertainty_reason,
      escalation_recommended: confidenceResult.escalation_recommended,
      escalation_reason: confidenceResult.escalation_reason,
      classification,
      model: this.client.getModel(),
      usage: {
        prompt_tokens: ollamaResponse.prompt_eval_count ?? 0,
        completion_tokens: ollamaResponse.eval_count ?? 0,
        total_tokens:
          (ollamaResponse.prompt_eval_count ?? 0) +
          (ollamaResponse.eval_count ?? 0),
      },
    };
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /Volumes/ProjectData/LocalAI && npx vitest run tests/gateway/gateway.test.ts`
Expected: All 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add gateway/src/gateway.ts tests/gateway/gateway.test.ts
git commit -m "feat: add core gateway orchestrator with classify → prompt → call → parse pipeline"
```

---

### Task 9: Express API Server

**Files:**
- Create: `gateway/src/server.ts`
- Create: `gateway/src/index.ts`
- Test: `tests/gateway/server.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// tests/gateway/server.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createApp } from "../../gateway/src/server.js";
import type { Gateway } from "../../gateway/src/gateway.js";

function createMockGateway() {
  return {
    process: vi.fn().mockResolvedValue({
      response: "Hello!",
      confidence: "high",
      uncertainty_reason: null,
      escalation_recommended: false,
      escalation_reason: null,
      classification: { complexity: "simple", flags: [], pre_warning: null },
      model: "localai-coder",
      usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
    }),
  } as unknown as Gateway;
}

describe("Express API", () => {
  let app: ReturnType<typeof createApp>;
  let mockGateway: Gateway;

  beforeEach(() => {
    mockGateway = createMockGateway();
    app = createApp(mockGateway);
  });

  it("GET /health returns ok", async () => {
    const response = await app.request("/health");
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.status).toBe("ok");
  });

  it("POST /v1/chat/completions returns OpenAI-compatible format", async () => {
    const response = await app.request("/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: "hello" }],
      }),
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.choices[0].message.content).toBe("Hello!");
    expect(body.choices[0].message.role).toBe("assistant");
    expect(body.model).toBe("localai-coder");
    expect(body.usage.total_tokens).toBe(15);
    // Custom metadata field
    expect(body.localai_metadata.confidence).toBe("high");
    expect(body.localai_metadata.escalation_recommended).toBe(false);
  });

  it("POST /v1/localai/query returns gateway response directly", async () => {
    const response = await app.request("/v1/localai/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "hello" }),
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.response).toBe("Hello!");
    expect(body.confidence).toBe("high");
  });

  it("returns 400 on missing messages", async () => {
    const response = await app.request("/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(response.status).toBe(400);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /Volumes/ProjectData/LocalAI && npx vitest run tests/gateway/server.test.ts`
Expected: FAIL — cannot find module.

- [ ] **Step 3: Implement the Express server**

Note: We use a lightweight approach that creates the Express app as a function so it's testable without starting a listener. For testability we use Express 5's native `app.request()` or we can use supertest. Since Express 5 may not have `app.request()`, we'll structure the app creation for easy testing.

```typescript
// gateway/src/server.ts
import express, { type Request, type Response } from "express";
import type { Gateway } from "./gateway.js";

export function createApp(gateway: Gateway) {
  const app = express();
  app.use(express.json());

  // Health check
  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // OpenAI-compatible chat completions
  app.post("/v1/chat/completions", async (req: Request, res: Response) => {
    const { messages, max_tokens } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: "messages array is required" });
      return;
    }

    // Extract the last user message as the prompt
    const userMessages = messages.filter(
      (m: { role: string }) => m.role === "user"
    );
    const lastUserMessage = userMessages[userMessages.length - 1];
    const systemMessages = messages.filter(
      (m: { role: string }) => m.role === "system"
    );
    const systemPrompt = systemMessages
      .map((m: { content: string }) => m.content)
      .join("\n");

    try {
      const result = await gateway.process({
        prompt: lastUserMessage?.content ?? "",
        system: systemPrompt || undefined,
        max_tokens,
      });

      res.json({
        id: `localai-${Date.now()}`,
        object: "chat.completion",
        created: Math.floor(Date.now() / 1000),
        model: result.model,
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: result.response,
            },
            finish_reason: "stop",
          },
        ],
        usage: result.usage,
        localai_metadata: {
          confidence: result.confidence,
          uncertainty_reason: result.uncertainty_reason,
          escalation_recommended: result.escalation_recommended,
          escalation_reason: result.escalation_reason,
          classification: result.classification,
        },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error";
      res.status(502).json({ error: `Gateway error: ${message}` });
    }
  });

  // Native LocalAI query endpoint
  app.post("/v1/localai/query", async (req: Request, res: Response) => {
    const { prompt, system, file_content, file_path, skill, max_tokens } =
      req.body;

    if (!prompt) {
      res.status(400).json({ error: "prompt is required" });
      return;
    }

    try {
      const result = await gateway.process({
        prompt,
        system,
        file_content,
        file_path,
        skill,
        max_tokens,
      });
      res.json(result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error";
      res.status(502).json({ error: `Gateway error: ${message}` });
    }
  });

  return app;
}
```

- [ ] **Step 4: Implement the entry point**

```typescript
// gateway/src/index.ts
import { createApp } from "./server.js";
import { Gateway } from "./gateway.js";
import { OllamaClient } from "./ollama.js";
import type { GatewayConfig } from "./types.js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const configPath = resolve(import.meta.dirname, "../../config/default.json");
const config: GatewayConfig = JSON.parse(readFileSync(configPath, "utf-8"));

const client = new OllamaClient(config.model.ollama_url, config.model.name);
const gateway = new Gateway(client, config);
const app = createApp(gateway);

const port = config.gateway.port;
app.listen(port, () => {
  console.log(`LocalAI Gateway running on http://localhost:${port}`);
  console.log(`Model: ${config.model.name} (${config.model.base})`);
  console.log(`Health: http://localhost:${port}/health`);
  console.log(`API: http://localhost:${port}/v1/chat/completions`);
});
```

- [ ] **Step 5: Update server test to use supertest instead of app.request**

Since Express doesn't have `app.request()`, install supertest and update:

Add `"supertest": "^7.0.0"` and `"@types/supertest": "^6.0.0"` to root devDependencies, then:

```typescript
// tests/gateway/server.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../../gateway/src/server.js";
import type { Gateway } from "../../gateway/src/gateway.js";

function createMockGateway() {
  return {
    process: vi.fn().mockResolvedValue({
      response: "Hello!",
      confidence: "high",
      uncertainty_reason: null,
      escalation_recommended: false,
      escalation_reason: null,
      classification: { complexity: "simple", flags: [], pre_warning: null },
      model: "localai-coder",
      usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
    }),
  } as unknown as Gateway;
}

describe("Express API", () => {
  let mockGateway: Gateway;
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    mockGateway = createMockGateway();
    app = createApp(mockGateway);
  });

  it("GET /health returns ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  it("POST /v1/chat/completions returns OpenAI-compatible format", async () => {
    const res = await request(app)
      .post("/v1/chat/completions")
      .send({ messages: [{ role: "user", content: "hello" }] });

    expect(res.status).toBe(200);
    expect(res.body.choices[0].message.content).toBe("Hello!");
    expect(res.body.choices[0].message.role).toBe("assistant");
    expect(res.body.model).toBe("localai-coder");
    expect(res.body.usage.total_tokens).toBe(15);
    expect(res.body.localai_metadata.confidence).toBe("high");
    expect(res.body.localai_metadata.escalation_recommended).toBe(false);
  });

  it("POST /v1/localai/query returns gateway response directly", async () => {
    const res = await request(app)
      .post("/v1/localai/query")
      .send({ prompt: "hello" });

    expect(res.status).toBe(200);
    expect(res.body.response).toBe("Hello!");
    expect(res.body.confidence).toBe("high");
  });

  it("returns 400 on missing messages", async () => {
    const res = await request(app)
      .post("/v1/chat/completions")
      .send({});
    expect(res.status).toBe(400);
  });
});
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `cd /Volumes/ProjectData/LocalAI && npm install && npx vitest run tests/gateway/server.test.ts`
Expected: All 4 tests pass.

- [ ] **Step 7: Commit**

```bash
git add gateway/src/server.ts gateway/src/index.ts tests/gateway/server.test.ts package.json
git commit -m "feat: add Express API server with OpenAI-compatible and native endpoints"
```

---

### Task 10: MCP Server

**Files:**
- Create: `mcp-server/src/tools.ts`
- Create: `mcp-server/src/index.ts`
- Test: `tests/mcp-server/tools.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// tests/mcp-server/tools.test.ts
import { describe, it, expect, vi } from "vitest";
import { buildToolHandlers, TOOL_DEFINITIONS } from "../../mcp-server/src/tools.js";

describe("TOOL_DEFINITIONS", () => {
  it("defines local_ai_query tool", () => {
    const query = TOOL_DEFINITIONS.find((t) => t.name === "local_ai_query");
    expect(query).toBeDefined();
    expect(query!.inputSchema.properties).toHaveProperty("prompt");
  });

  it("defines local_ai_code_edit tool", () => {
    const edit = TOOL_DEFINITIONS.find((t) => t.name === "local_ai_code_edit");
    expect(edit).toBeDefined();
    expect(edit!.inputSchema.properties).toHaveProperty("file_path");
    expect(edit!.inputSchema.properties).toHaveProperty("instruction");
  });

  it("defines local_ai_summarize tool", () => {
    const summarize = TOOL_DEFINITIONS.find(
      (t) => t.name === "local_ai_summarize"
    );
    expect(summarize).toBeDefined();
    expect(summarize!.inputSchema.properties).toHaveProperty("content");
  });
});

describe("buildToolHandlers", () => {
  it("handles local_ai_query", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        response: "test response",
        confidence: "high",
        uncertainty_reason: null,
        escalation_recommended: false,
        escalation_reason: null,
      }),
    });

    const handlers = buildToolHandlers("http://localhost:5577", mockFetch);
    const result = await handlers.local_ai_query({ prompt: "hello" });

    expect(result.content[0].text).toContain("test response");
    expect(result.content[0].text).toContain("high");
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:5577/v1/localai/query",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("hello"),
      })
    );
  });

  it("handles local_ai_code_edit", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        response: "edited code here",
        confidence: "medium",
        uncertainty_reason: "unsure about import style",
        escalation_recommended: false,
        escalation_reason: null,
      }),
    });

    const handlers = buildToolHandlers("http://localhost:5577", mockFetch);
    const result = await handlers.local_ai_code_edit({
      file_path: "src/app.ts",
      file_content: "const x = 1;",
      instruction: "add type annotation",
    });

    expect(result.content[0].text).toContain("edited code here");
    expect(result.content[0].text).toContain("medium");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /Volumes/ProjectData/LocalAI && npx vitest run tests/mcp-server/tools.test.ts`
Expected: FAIL — cannot find module.

- [ ] **Step 3: Implement tool definitions and handlers**

```typescript
// mcp-server/src/tools.ts

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, unknown>;
    required: string[];
  };
}

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    name: "local_ai_query",
    description:
      "Send a prompt to the local AI model (Qwen2.5-Coder-7B). Returns a response with confidence assessment. Use for simple coding tasks, explanations, documentation, and formatting. Check the confidence field to decide whether to trust the output.",
    inputSchema: {
      type: "object",
      properties: {
        prompt: {
          type: "string",
          description: "The prompt/instruction to send to the local model",
        },
        system: {
          type: "string",
          description: "Optional additional system prompt context",
        },
        file_path: {
          type: "string",
          description: "Optional file path for context",
        },
        file_content: {
          type: "string",
          description: "Optional file content for context",
        },
      },
      required: ["prompt"],
    },
  },
  {
    name: "local_ai_code_edit",
    description:
      "Send a file and instruction to the local AI for code editing. The model will return the edited code with confidence assessment. Best for single-file edits: formatting, renaming, adding comments, simple refactoring.",
    inputSchema: {
      type: "object",
      properties: {
        file_path: {
          type: "string",
          description: "Path to the file being edited",
        },
        file_content: {
          type: "string",
          description: "Current content of the file",
        },
        instruction: {
          type: "string",
          description: "What edit to make to the file",
        },
      },
      required: ["file_path", "file_content", "instruction"],
    },
  },
  {
    name: "local_ai_summarize",
    description:
      "Send content to the local AI for summarization. Returns a concise summary with confidence. Good for summarizing files, documentation, logs, and diffs.",
    inputSchema: {
      type: "object",
      properties: {
        content: {
          type: "string",
          description: "The content to summarize",
        },
        focus: {
          type: "string",
          description:
            "Optional focus area for the summary (e.g., 'key functions', 'error handling')",
        },
      },
      required: ["content"],
    },
  },
];

type FetchFn = typeof globalThis.fetch;

interface ToolResult {
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
}

export function buildToolHandlers(
  gatewayUrl: string,
  fetchFn: FetchFn = globalThis.fetch
) {
  async function callGateway(body: Record<string, unknown>): Promise<ToolResult> {
    try {
      const response = await fetchFn(`${gatewayUrl}/v1/localai/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const text = await response.text();
        return {
          content: [{ type: "text", text: `Gateway error (${response.status}): ${text}` }],
          isError: true,
        };
      }

      const data = await response.json();
      const meta = [
        `[Confidence: ${data.confidence}]`,
        data.uncertainty_reason ? `[Uncertain: ${data.uncertainty_reason}]` : null,
        data.escalation_recommended
          ? `[ESCALATION RECOMMENDED: ${data.escalation_reason}]`
          : null,
      ]
        .filter(Boolean)
        .join("\n");

      return {
        content: [{ type: "text", text: `${data.response}\n\n---\n${meta}` }],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return {
        content: [{ type: "text", text: `Failed to reach LocalAI gateway: ${message}` }],
        isError: true,
      };
    }
  }

  return {
    local_ai_query: async (args: { prompt: string; system?: string; file_path?: string; file_content?: string }) => {
      return callGateway({
        prompt: args.prompt,
        system: args.system,
        file_path: args.file_path,
        file_content: args.file_content,
      });
    },

    local_ai_code_edit: async (args: { file_path: string; file_content: string; instruction: string }) => {
      return callGateway({
        prompt: args.instruction,
        file_path: args.file_path,
        file_content: args.file_content,
        system:
          "You are editing a file. Return ONLY the complete edited file content. No explanations before or after the code.",
      });
    },

    local_ai_summarize: async (args: { content: string; focus?: string }) => {
      const prompt = args.focus
        ? `Summarize the following content, focusing on: ${args.focus}\n\n${args.content}`
        : `Summarize the following content concisely:\n\n${args.content}`;
      return callGateway({ prompt });
    },
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /Volumes/ProjectData/LocalAI && npx vitest run tests/mcp-server/tools.test.ts`
Expected: All 5 tests pass.

- [ ] **Step 5: Implement MCP server entry point**

```typescript
// mcp-server/src/index.ts
#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { TOOL_DEFINITIONS, buildToolHandlers } from "./tools.js";

const GATEWAY_URL = process.env.LOCALAI_GATEWAY_URL ?? "http://localhost:5577";

const server = new Server(
  { name: "localai-mcp", version: "0.1.0" },
  { capabilities: { tools: {} } }
);

const handlers = buildToolHandlers(GATEWAY_URL);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOL_DEFINITIONS,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  const handler = handlers[name as keyof typeof handlers];
  if (!handler) {
    return {
      content: [{ type: "text" as const, text: `Unknown tool: ${name}` }],
      isError: true,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return handler(args as any);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("LocalAI MCP server running on stdio");
}

main().catch((error) => {
  console.error("Failed to start MCP server:", error);
  process.exit(1);
});
```

- [ ] **Step 6: Commit**

```bash
git add mcp-server/src/ tests/mcp-server/
git commit -m "feat: add MCP server with query, code_edit, and summarize tools"
```

---

### Task 11: CLI

**Files:**
- Create: `cli/src/format.ts`
- Create: `cli/src/index.ts`
- Test: `tests/cli/format.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// tests/cli/format.test.ts
import { describe, it, expect } from "vitest";
import {
  formatConfidence,
  formatResponse,
} from "../../cli/src/format.js";

describe("formatConfidence", () => {
  it("formats high confidence in green", () => {
    const result = formatConfidence("high");
    expect(result).toContain("high");
    expect(result).toContain("\x1b[32m"); // green ANSI
  });

  it("formats medium confidence in yellow", () => {
    const result = formatConfidence("medium");
    expect(result).toContain("medium");
    expect(result).toContain("\x1b[33m"); // yellow ANSI
  });

  it("formats low confidence in red", () => {
    const result = formatConfidence("low");
    expect(result).toContain("low");
    expect(result).toContain("\x1b[31m"); // red ANSI
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /Volumes/ProjectData/LocalAI && npx vitest run tests/cli/format.test.ts`
Expected: FAIL — cannot find module.

- [ ] **Step 3: Implement format.ts**

```typescript
// cli/src/format.ts
import type { ConfidenceLevel } from "../../gateway/src/types.js";

const COLORS = {
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  dim: "\x1b[2m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
} as const;

const CONFIDENCE_COLORS: Record<ConfidenceLevel, string> = {
  high: COLORS.green,
  medium: COLORS.yellow,
  low: COLORS.red,
};

export function formatConfidence(level: ConfidenceLevel): string {
  const color = CONFIDENCE_COLORS[level];
  return `${color}[${level}]${COLORS.reset}`;
}

export function formatResponse(data: {
  response: string;
  confidence: ConfidenceLevel;
  uncertainty_reason: string | null;
  escalation_recommended: boolean;
  escalation_reason: string | null;
}): string {
  const parts: string[] = [];

  // Main response
  parts.push(data.response);

  // Separator
  parts.push(`\n${COLORS.dim}${"─".repeat(40)}${COLORS.reset}`);

  // Confidence tag
  parts.push(`Confidence: ${formatConfidence(data.confidence)}`);

  // Uncertainty
  if (data.uncertainty_reason) {
    parts.push(
      `${COLORS.yellow}Uncertain: ${data.uncertainty_reason}${COLORS.reset}`
    );
  }

  // Escalation
  if (data.escalation_recommended && data.escalation_reason) {
    parts.push(
      `${COLORS.red}${COLORS.bold}ESCALATION RECOMMENDED: ${data.escalation_reason}${COLORS.reset}`
    );
  }

  return parts.join("\n");
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /Volumes/ProjectData/LocalAI && npx vitest run tests/cli/format.test.ts`
Expected: All 6 tests pass.

- [ ] **Step 5: Implement cli/src/index.ts**

```typescript
// cli/src/index.ts
#!/usr/bin/env node
import { program } from "commander";
import { readFileSync } from "node:fs";
import { formatResponse } from "./format.js";

const GATEWAY_URL =
  process.env.LOCALAI_GATEWAY_URL ?? "http://localhost:5577";

interface QueryOptions {
  file?: string;
  skill?: string;
  system?: string;
  chat?: boolean;
}

async function query(prompt: string, options: QueryOptions): Promise<void> {
  const body: Record<string, unknown> = { prompt };

  if (options.file) {
    body.file_path = options.file;
    try {
      body.file_content = readFileSync(options.file, "utf-8");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      console.error(`Error reading file: ${msg}`);
      process.exit(1);
    }
  }

  if (options.skill) body.skill = options.skill;
  if (options.system) body.system = options.system;

  try {
    const response = await fetch(`${GATEWAY_URL}/v1/localai/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`Gateway error (${response.status}): ${text}`);
      process.exit(1);
    }

    const data = await response.json();
    console.log(formatResponse(data));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error(
      `Failed to reach LocalAI gateway at ${GATEWAY_URL}: ${msg}`
    );
    console.error("Is the gateway running? Start it with: npm run dev:gateway");
    process.exit(1);
  }
}

async function chatMode(): Promise<void> {
  const readline = await import("node:readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("LocalAI Chat (type 'exit' to quit)\n");

  const askQuestion = (): void => {
    rl.question("\x1b[36myou>\x1b[0m ", async (input) => {
      const trimmed = input.trim();
      if (trimmed === "exit" || trimmed === "quit") {
        rl.close();
        return;
      }
      if (!trimmed) {
        askQuestion();
        return;
      }
      await query(trimmed, {});
      console.log();
      askQuestion();
    });
  };

  askQuestion();
}

// Handle piped stdin
async function readStdin(): Promise<string | null> {
  if (process.stdin.isTTY) return null;

  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf-8").trim() || null;
}

program
  .name("local-ai")
  .description("Local AI assistant powered by Qwen2.5-Coder-7B via Ollama")
  .version("0.1.0");

program
  .argument("[prompt...]", "The prompt to send to the local model")
  .option("-f, --file <path>", "Include a file as context")
  .option("-s, --skill <name>", "Use a specific skill prompt chain")
  .option("--system <prompt>", "Additional system prompt")
  .option("-c, --chat", "Enter interactive chat mode")
  .action(async (promptParts: string[], options: QueryOptions) => {
    if (options.chat) {
      await chatMode();
      return;
    }

    const stdinContent = await readStdin();
    const prompt = promptParts.join(" ");

    if (!prompt && !stdinContent) {
      program.help();
      return;
    }

    const fullPrompt = stdinContent
      ? `${prompt}\n\n${stdinContent}`
      : prompt;

    await query(fullPrompt, options);
  });

program.parse();
```

- [ ] **Step 6: Commit**

```bash
git add cli/src/ tests/cli/
git commit -m "feat: add CLI with query, file context, skill, and chat modes"
```

---

### Task 12: Keep-Working Local Integration

**Files:**
- Create: `keep-working-local/src/tiers.ts`
- Create: `keep-working-local/src/tracker.ts`
- Create: `keep-working-local/src/delegator.ts`
- Create: `keep-working-local/src/index.ts`
- Test: `tests/keep-working-local/tiers.test.ts`
- Test: `tests/keep-working-local/tracker.test.ts`
- Test: `tests/keep-working-local/delegator.test.ts`

- [ ] **Step 1: Write the tiers tests**

```typescript
// tests/keep-working-local/tiers.test.ts
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
```

- [ ] **Step 2: Run tiers tests to verify they fail**

Run: `cd /Volumes/ProjectData/LocalAI && npx vitest run tests/keep-working-local/tiers.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement TierManager**

```typescript
// keep-working-local/src/tiers.ts

export type LocalMode = "off" | "assist" | "full";
export type TaskComplexity = "simple" | "moderate" | "complex";

export class TierManager {
  private mode: LocalMode = "off";

  getMode(): LocalMode {
    return this.mode;
  }

  setMode(mode: LocalMode): void {
    this.mode = mode;
  }

  isLocalEnabled(): boolean {
    return this.mode !== "off";
  }

  isPaidLead(): boolean {
    return this.mode === "assist";
  }

  shouldDelegateToLocal(complexity: TaskComplexity): boolean {
    switch (this.mode) {
      case "off":
        return false;
      case "assist":
        return complexity === "simple" || complexity === "moderate";
      case "full":
        return true;
    }
  }
}
```

- [ ] **Step 4: Run tiers tests to verify they pass**

Run: `cd /Volumes/ProjectData/LocalAI && npx vitest run tests/keep-working-local/tiers.test.ts`
Expected: All 7 tests pass.

- [ ] **Step 5: Write the tracker tests**

```typescript
// tests/keep-working-local/tracker.test.ts
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
    t.recordLocalComplete();
    t.recordLocalComplete();
    t.recordLocalComplete();
    t.recordPaidComplete();
    // 3 local out of 4 total = 75% savings
    expect(t.getStats().savings_percent).toBe(75);
  });

  it("returns 0 savings when no tasks completed", () => {
    const t = new Tracker();
    expect(t.getStats().savings_percent).toBe(0);
  });

  it("formats status string", () => {
    const t = new Tracker();
    t.recordLocalComplete();
    t.recordPaidComplete();
    t.recordParked();
    const status = t.formatStatus("assist");
    expect(status).toContain("assist");
    expect(status).toContain("1");
  });

  it("resets counters", () => {
    const t = new Tracker();
    t.recordLocalComplete();
    t.recordPaidComplete();
    t.reset();
    expect(t.getStats().local_completed).toBe(0);
    expect(t.getStats().paid_completed).toBe(0);
  });
});
```

- [ ] **Step 6: Implement Tracker**

```typescript
// keep-working-local/src/tracker.ts

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

  recordLocalComplete(): void {
    this.localCompleted++;
  }

  recordPaidComplete(): void {
    this.paidCompleted++;
  }

  recordParked(): void {
    this.parked++;
  }

  recordEscalated(): void {
    this.escalated++;
  }

  getStats(): TrackerStats {
    const total = this.localCompleted + this.paidCompleted;
    const savings_percent =
      total === 0 ? 0 : Math.round((this.localCompleted / total) * 100);

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
```

- [ ] **Step 7: Run tracker tests to verify they pass**

Run: `cd /Volumes/ProjectData/LocalAI && npx vitest run tests/keep-working-local/tracker.test.ts`
Expected: All 9 tests pass.

- [ ] **Step 8: Write the delegator tests**

```typescript
// tests/keep-working-local/delegator.test.ts
import { describe, it, expect, vi } from "vitest";
import { Delegator } from "../../keep-working-local/src/delegator.js";

function createMockFetch(
  confidence: "high" | "medium" | "low" = "high",
  response: string = "done"
) {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      response,
      confidence,
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
```

- [ ] **Step 9: Implement Delegator**

```typescript
// keep-working-local/src/delegator.ts

export interface DelegationResult {
  handled: boolean;
  response?: string;
  confidence?: "high" | "medium" | "low";
  needs_escalation: boolean;
  escalation_reason?: string;
  error?: string;
}

type FetchFn = typeof globalThis.fetch;

export class Delegator {
  constructor(
    private gatewayUrl: string,
    private fetchFn: FetchFn = globalThis.fetch
  ) {}

  async delegateTask(
    taskDescription: string,
    fileContent?: string,
    filePath?: string
  ): Promise<DelegationResult> {
    try {
      const response = await this.fetchFn(
        `${this.gatewayUrl}/v1/localai/query`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: taskDescription,
            file_content: fileContent,
            file_path: filePath,
          }),
        }
      );

      if (!response.ok) {
        const text = await response.text();
        return {
          handled: false,
          needs_escalation: true,
          error: `Gateway returned ${response.status}: ${text}`,
        };
      }

      const data = await response.json();

      return {
        handled: true,
        response: data.response,
        confidence: data.confidence,
        needs_escalation: data.escalation_recommended ?? false,
        escalation_reason: data.escalation_reason ?? undefined,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error";
      return {
        handled: false,
        needs_escalation: true,
        error: `Failed to reach LocalAI gateway: ${message}`,
      };
    }
  }
}
```

- [ ] **Step 10: Run delegator tests to verify they pass**

Run: `cd /Volumes/ProjectData/LocalAI && npx vitest run tests/keep-working-local/delegator.test.ts`
Expected: All 3 tests pass.

- [ ] **Step 11: Create keep-working-local/src/index.ts**

```typescript
// keep-working-local/src/index.ts
export { TierManager, type LocalMode, type TaskComplexity } from "./tiers.js";
export { Tracker, type TrackerStats } from "./tracker.js";
export { Delegator, type DelegationResult } from "./delegator.js";
```

- [ ] **Step 12: Commit**

```bash
git add keep-working-local/src/ tests/keep-working-local/
git commit -m "feat: add keep-working-local integration with tiers, tracker, and delegator"
```

---

### Task 13: Core Skills Library

**Files:**
- Create: `skills/code-review.md`
- Create: `skills/explain-code.md`
- Create: `skills/commit-message.md`
- Create: `skills/summarize.md`
- Create: `skills/doc-writer.md`
- Create: `skills/write-tests.md`
- Create: `skills/refactor.md`

- [ ] **Step 1: Create skills/code-review.md**

```markdown
# Code Review

Review a single file for code quality issues.

## Prompt Chain

### Step 1: Inventory
List all functions, classes, and exports in this file with their signatures.

### Step 2: Analyze
For each function/class, check for:
- Unclear or misleading names
- Missing error handling for external calls (network, file, DB)
- Edge cases not handled (null, empty, negative, overflow)
- Unused variables or parameters
- Code duplication within this file
- Magic numbers or strings that should be constants

### Step 3: Categorize
Rate each finding:
- **info**: style suggestion, nitpick
- **warning**: potential issue, should fix
- **issue**: likely bug or significant problem

### Step 4: Format
Output as a numbered list grouped by severity (issues first, then warnings, then info).
Include the line reference and a brief explanation for each.

### Step 5: Confidence
Assess your confidence. If the file uses patterns or libraries you're uncertain about, say so.
```

- [ ] **Step 2: Create skills/explain-code.md**

```markdown
# Explain Code

Explain what a file or code block does.

## Prompt Chain

### Step 1: Purpose
In one sentence, what is the purpose of this file/code?

### Step 2: Structure
List the main components (functions, classes, constants) and what each does.

### Step 3: Data Flow
Describe how data flows through the code: inputs → transformations → outputs.

### Step 4: Key Logic
Identify the most important or complex logic. Explain it simply.

### Step 5: Dependencies
List external dependencies (imports) and what they're used for.

### Step 6: Summary
Write a 2-3 sentence summary suitable for someone unfamiliar with this code.
```

- [ ] **Step 3: Create skills/commit-message.md**

```markdown
# Commit Message

Generate a conventional commit message from a diff.

## Prompt Chain

### Step 1: Categorize
Determine the type of change:
- **feat**: new feature
- **fix**: bug fix
- **refactor**: code restructuring without behavior change
- **docs**: documentation only
- **test**: adding or updating tests
- **chore**: build, CI, dependency updates

### Step 2: Scope
Identify the scope (which module/component was changed).

### Step 3: Summary
Write a concise imperative summary (under 72 chars). Focus on WHY, not WHAT.

### Step 4: Body (if needed)
If the change is non-trivial, add a body paragraph explaining the motivation.

### Step 5: Output
Format as:
```
type(scope): summary

body (if needed)
```
```

- [ ] **Step 4: Create skills/summarize.md**

```markdown
# Summarize

Produce a concise summary of content.

## Prompt Chain

### Step 1: Identify Type
What type of content is this? (code file, documentation, log output, config, etc.)

### Step 2: Key Points
Extract the 3-5 most important points or elements.

### Step 3: Structure
If the content has sections or structure, note the organization.

### Step 4: Output
Write a concise summary (3-5 bullet points for short content, up to 10 for long content).
Lead with the most important information.
```

- [ ] **Step 5: Create skills/doc-writer.md**

```markdown
# Documentation Writer

Generate documentation for functions and classes.

## Prompt Chain

### Step 1: Inventory
List all exported functions and classes with their signatures.

### Step 2: Analyze Each
For each function/class:
- What does it do? (one sentence)
- What are the parameters? (name, type, purpose)
- What does it return? (type, description)
- What can go wrong? (throws, error conditions)

### Step 3: Generate
Write JSDoc/TSDoc comments for each function/class.
Follow the existing documentation style in the file if present.

### Step 4: Output
Return the complete file with documentation added.
Do not change any code logic — only add documentation.
```

- [ ] **Step 6: Create skills/write-tests.md**

```markdown
# Write Tests

Generate unit tests for a file.

## Prompt Chain

### Step 1: Analyze
Read the file and list all exported functions/classes and their behavior.

### Step 2: Identify Test Cases
For each function, identify:
- Happy path (normal expected input → expected output)
- Edge cases (empty, null, zero, boundary values)
- Error cases (invalid input, failure conditions)

### Step 3: Generate Tests
Write test code using the project's test framework (detect from package.json).
Each test should:
- Have a descriptive name
- Arrange → Act → Assert pattern
- Test one behavior per test

### Step 4: Output
Return the complete test file. Include necessary imports.
```

- [ ] **Step 7: Create skills/refactor.md**

```markdown
# Refactor

Refactor a single file to improve quality.

## Prompt Chain

### Step 1: Analyze
Read the file and identify:
- Code duplication
- Long functions (>30 lines)
- Deep nesting (>3 levels)
- Unclear naming
- Mixed responsibilities

### Step 2: Plan
List specific refactoring actions, ordered by impact:
- Extract function
- Rename for clarity
- Simplify conditionals
- Remove duplication

### Step 3: Execute
Apply each refactoring. Preserve all existing behavior — this is a refactor, not a feature change.

### Step 4: Verify
List what changed and confirm that the public API (exports, function signatures) is unchanged.

### Step 5: Output
Return the complete refactored file.
```

- [ ] **Step 8: Commit**

```bash
git add skills/code-review.md skills/explain-code.md skills/commit-message.md skills/summarize.md skills/doc-writer.md skills/write-tests.md skills/refactor.md
git commit -m "feat: add core skill prompt chains (7 skills)"
```

---

### Task 14: Extended Skills Library

**Files:**
- Create: `skills/research/codebase-explore.md`
- Create: `skills/research/doc-lookup.md`
- Create: `skills/research/tech-compare.md`
- Create: `skills/research/dependency-audit.md`
- Create: `skills/research/changelog-digest.md`
- Create: `skills/design/api-design.md`
- Create: `skills/design/db-schema.md`
- Create: `skills/design/component-spec.md`
- Create: `skills/design/wireframe-text.md`
- Create: `skills/design/system-diagram.md`
- Create: `skills/design/design-review.md`
- Create: `skills/generation/scaffold-project.md`
- Create: `skills/generation/dockerfile.md`
- Create: `skills/generation/ci-pipeline.md`
- Create: `skills/generation/config-file.md`
- Create: `skills/generation/test-scaffold.md`
- Create: `skills/generation/migration.md`
- Create: `skills/generation/boilerplate.md`
- Create: `skills/architecture/pattern-recommend.md`
- Create: `skills/architecture/dependency-map.md`
- Create: `skills/architecture/migration-plan.md`
- Create: `skills/architecture/architecture-review.md`
- Create: `skills/architecture/decision-record.md`
- Create: `skills/architecture/scaling-basics.md`

- [ ] **Step 1: Create research skills**

```markdown
<!-- skills/research/codebase-explore.md -->
# Codebase Explorer

Map and understand an unfamiliar codebase structure.

## Prompt Chain

### Step 1: Entry Points
Identify the main entry points (package.json scripts, main files, index files).

### Step 2: Directory Structure
List top-level directories and their apparent purpose.

### Step 3: Key Files
Identify the most important files (by imports, size, or centrality).

### Step 4: Dependency Graph
List internal module dependencies (what imports what).

### Step 5: Summary
Produce a codebase map: entry points → core modules → utilities → config.
```

```markdown
<!-- skills/research/doc-lookup.md -->
# Documentation Lookup

Find and summarize documentation for a library or API.

## Prompt Chain

### Step 1: Identify
What library/API is being asked about? What specific aspect?

### Step 2: Search
Use available tools (context7, web search) to find official documentation.

### Step 3: Extract
Pull out the relevant section. Quote directly — do not paraphrase.

### Step 4: Summarize
Provide: what it does, how to use it (with code example), and common gotchas.

### Step 5: Confidence
Flag if documentation was not found or may be outdated.
```

```markdown
<!-- skills/research/tech-compare.md -->
# Technology Comparison

Compare technologies against explicit criteria.

## Prompt Chain

### Step 1: Criteria
List the comparison criteria provided by the user. If none provided, ask.

### Step 2: Research
For each technology, find facts for each criterion. Use tools if available.

### Step 3: Table
Build a comparison table. Use ONLY verified facts. Mark unknowns with "?".

### Step 4: Present
Present the table. Do NOT recommend — present facts only.
Flag any criteria where you couldn't find reliable information.
```

```markdown
<!-- skills/research/dependency-audit.md -->
# Dependency Audit

Analyze project dependencies for issues.

## Prompt Chain

### Step 1: List
Read package.json (or equivalent) and list all dependencies with versions.

### Step 2: Categorize
Group by: runtime vs dev, direct vs transitive (if lockfile available).

### Step 3: Check
For each dependency, flag:
- Significantly outdated versions (major version behind)
- Known deprecated packages
- Duplicate functionality (two packages doing the same thing)
- Unusually large packages for their purpose

### Step 4: Report
Output a categorized report: critical issues, warnings, suggestions.
```

```markdown
<!-- skills/research/changelog-digest.md -->
# Changelog Digest

Summarize what changed between versions.

## Prompt Chain

### Step 1: Identify
What package/project? What version range?

### Step 2: Find
Locate CHANGELOG.md, release notes, or git log for the version range.

### Step 3: Categorize
Group changes by: breaking changes, new features, bug fixes, deprecations.

### Step 4: Summarize
For each category, list the most impactful changes with one-line descriptions.
Highlight breaking changes prominently.
```

- [ ] **Step 2: Create design skills**

```markdown
<!-- skills/design/api-design.md -->
# API Design

Design REST or GraphQL API endpoints from requirements.

## Prompt Chain

### Step 1: Resources
Identify the main resources/entities from the requirements.

### Step 2: Endpoints
For each resource, define CRUD endpoints:
- Method, path, description
- Request body (if any)
- Response shape
- Status codes

### Step 3: Relationships
Define endpoints for resource relationships (nested routes, associations).

### Step 4: Validation
List validation rules for each endpoint's inputs.

### Step 5: Output
Format as an API specification table or OpenAPI snippet.
```

```markdown
<!-- skills/design/db-schema.md -->
# Database Schema Design

Design a database schema from entity descriptions.

## Prompt Chain

### Step 1: Entities
List all entities and their attributes from the requirements.

### Step 2: Relationships
Identify relationships: one-to-one, one-to-many, many-to-many.

### Step 3: Normalize
Generate normalized schema (3NF) with primary and foreign keys.

### Step 4: SQL
Generate CREATE TABLE statements with appropriate data types, constraints, and indexes.

### Step 5: Self-Review
Check for: missing indexes on foreign keys, orphaned references, naming consistency, missing timestamps (created_at, updated_at).
```

```markdown
<!-- skills/design/component-spec.md -->
# Component Specification

Define a UI component's interface and behavior.

## Prompt Chain

### Step 1: Purpose
What does this component do? One sentence.

### Step 2: Props
List all props: name, type, required/optional, default value, description.

### Step 3: States
List all internal states and what triggers state changes.

### Step 4: Events
List events the component emits (callbacks, custom events).

### Step 5: Output
Format as a component spec with TypeScript interface for props.
```

```markdown
<!-- skills/design/wireframe-text.md -->
# Text-Based Wireframe

Describe a UI layout in text format.

## Prompt Chain

### Step 1: Structure
Define the page/screen layout using ASCII art or structured text:
- Header, navigation, content areas, footer
- Use boxes and labels

### Step 2: Components
List each UI element with: type (button, input, list, etc.), label, position.

### Step 3: Interactions
Describe what happens when key elements are clicked/activated.

### Step 4: Responsive
Note how the layout changes for mobile vs desktop (if applicable).
```

```markdown
<!-- skills/design/system-diagram.md -->
# System Diagram

Generate architecture diagrams in Mermaid syntax.

## Prompt Chain

### Step 1: Components
List all system components and their roles.

### Step 2: Connections
Define how components communicate (HTTP, events, DB, files).

### Step 3: Diagram
Generate a Mermaid diagram:
- Use `graph TD` for data flow
- Use `sequenceDiagram` for request flows
- Use `erDiagram` for data models

### Step 4: Annotate
Add labels to connections showing protocol/format.
```

```markdown
<!-- skills/design/design-review.md -->
# Design Review

Review an existing design for common issues.

## Prompt Chain

### Step 1: Understand
Summarize the design's intent and main components.

### Step 2: Check
Evaluate against:
- Single responsibility (does each component do one thing?)
- Clear interfaces (are boundaries well-defined?)
- Error handling (what happens when things fail?)
- Scalability (any obvious bottlenecks?)
- Security (any exposed attack surfaces?)

### Step 3: Report
List findings as: issue, severity (info/warning/concern), suggestion.
```

- [ ] **Step 3: Create generation skills**

```markdown
<!-- skills/generation/scaffold-project.md -->
# Project Scaffold

Generate a project starter from a tech stack description.

## Prompt Chain

### Step 1: Stack
Parse the tech stack: language, framework, test framework, build tool.

### Step 2: Structure
Generate a directory tree appropriate for the stack.

### Step 3: Files
Generate essential starter files:
- Entry point
- Package/build configuration
- Basic test setup
- .gitignore

### Step 4: Output
Return each file with its path and content.
```

```markdown
<!-- skills/generation/dockerfile.md -->
# Dockerfile Generation

Generate Dockerfile and docker-compose from project description.

## Prompt Chain

### Step 1: Analyze
What runtime? What build steps? What ports? What environment variables?

### Step 2: Dockerfile
Generate a Dockerfile:
- Use official base image with specific version tag
- Copy dependency files first (for layer caching)
- Install dependencies
- Copy source
- Set CMD

### Step 3: Docker Compose (if multi-service)
Generate docker-compose.yml with services, networks, volumes.

### Step 4: .dockerignore
Generate appropriate .dockerignore file.
```

```markdown
<!-- skills/generation/ci-pipeline.md -->
# CI Pipeline Generation

Generate CI/CD configuration for common platforms.

## Prompt Chain

### Step 1: Platform
Which CI platform? (GitHub Actions, GitLab CI, etc.)

### Step 2: Steps
Standard pipeline: install → lint → test → build.

### Step 3: Generate
Create the CI config file with:
- Trigger conditions (push, PR)
- Cache configuration for dependencies
- Appropriate Node/Python/etc. version

### Step 4: Output
Return the complete CI config file.
```

```markdown
<!-- skills/generation/config-file.md -->
# Config File Generation

Generate configuration files from requirements.

## Prompt Chain

### Step 1: Format
What config format? (JSON, YAML, TOML, INI, env)

### Step 2: Content
What settings are needed? List all key-value pairs.

### Step 3: Generate
Create the config file with:
- Comments explaining non-obvious settings
- Sensible defaults
- Proper structure/nesting

### Step 4: Output
Return the complete config file.
```

```markdown
<!-- skills/generation/test-scaffold.md -->
# Test Scaffold

Generate test file structure and setup.

## Prompt Chain

### Step 1: Detect
What test framework? (Detect from package.json or ask.)

### Step 2: Structure
Generate test directory structure mirroring source.

### Step 3: Setup
Create test setup/config files (vitest.config, jest.config, etc.).

### Step 4: Templates
For each source file, create a test file skeleton with:
- Imports
- Describe block matching the module
- Placeholder test cases based on exports
```

```markdown
<!-- skills/generation/migration.md -->
# Database Migration

Generate migration files from schema changes.

## Prompt Chain

### Step 1: Diff
Compare the current schema with the target schema. List changes.

### Step 2: Up Migration
Generate SQL for the forward migration (ALTER, CREATE, etc.).

### Step 3: Down Migration
Generate SQL to reverse the migration.

### Step 4: Output
Return both up and down migration files with timestamp naming.
```

```markdown
<!-- skills/generation/boilerplate.md -->
# Boilerplate Generation

Generate repetitive code from patterns and examples.

## Prompt Chain

### Step 1: Pattern
Identify the pattern from the provided example(s).

### Step 2: Variables
What changes between instances? (names, types, values)

### Step 3: Generate
Apply the pattern with the new variables. Match the exact style of the examples.

### Step 4: Output
Return the generated code. Maintain consistent formatting with the source.
```

- [ ] **Step 4: Create architecture skills**

```markdown
<!-- skills/architecture/pattern-recommend.md -->
# Pattern Recommendation

Suggest design patterns for a specific problem.

## Prompt Chain

### Step 1: Problem
What is the specific problem? List constraints.

### Step 2: Candidates
Which design patterns address this type of problem? List 3 candidates.

### Step 3: Analysis
For each pattern:
- How it applies to this problem
- What it solves
- What it doesn't solve
- Implementation complexity

### Step 4: Recommendation
Recommend one pattern with reasoning.
Flag if the problem might be too complex for a local model's assessment.
```

```markdown
<!-- skills/architecture/dependency-map.md -->
# Dependency Map

Visualize module and package dependencies.

## Prompt Chain

### Step 1: Scan
Read import/require statements across the target files.

### Step 2: Graph
Build a dependency graph: which modules depend on which.

### Step 3: Analyze
Identify: circular dependencies, hub modules (many dependents), leaf modules.

### Step 4: Diagram
Generate a Mermaid graph showing the dependency structure.
Highlight any circular dependencies in red.
```

```markdown
<!-- skills/architecture/migration-plan.md -->
# Migration Plan

Create a step-by-step migration plan for simple changes.

## Prompt Chain

### Step 1: Current State
Describe the current implementation.

### Step 2: Target State
Describe the desired end state.

### Step 3: Steps
List migration steps in order:
- Each step should be independently deployable if possible
- Include rollback instructions for each step
- Identify data migration needs

### Step 4: Risks
List what could go wrong and how to mitigate.
Flag if the migration seems too complex for a local model to plan safely.
```

```markdown
<!-- skills/architecture/architecture-review.md -->
# Architecture Review

Review existing architecture for common issues.

## Prompt Chain

### Step 1: Map
Describe the current architecture: components, connections, data flow.

### Step 2: Evaluate
Check for:
- Single points of failure
- Tight coupling between components
- Missing error boundaries
- Unclear data ownership
- Components doing too many things

### Step 3: Report
List findings with severity and suggestions.
Flag any areas requiring deeper analysis by a more capable model.
```

```markdown
<!-- skills/architecture/decision-record.md -->
# Architecture Decision Record (ADR)

Generate an ADR document.

## Prompt Chain

### Step 1: Context
What is the problem or situation requiring a decision?

### Step 2: Options
List 2-3 options that were considered.

### Step 3: Decision
Which option was chosen and why?

### Step 4: Format
Output as standard ADR format:
# ADR-NNN: Title
## Status: Proposed/Accepted/Deprecated
## Context
## Decision
## Consequences (positive and negative)
```

```markdown
<!-- skills/architecture/scaling-basics.md -->
# Scaling Basics

Provide basic scaling recommendations.

## Prompt Chain

### Step 1: Current Architecture
What is the current setup? (single server, basic deployment, etc.)

### Step 2: Bottlenecks
Identify likely bottlenecks: database, CPU, memory, network.

### Step 3: Recommendations
For each bottleneck, suggest standard scaling approaches:
- Horizontal scaling (replicas, load balancing)
- Vertical scaling (bigger instance)
- Caching (Redis, CDN)
- Database optimization (read replicas, connection pooling)

### Step 4: Limits
Flag that complex scaling decisions (sharding, distributed systems) should be escalated to a more capable model or human architect.
```

- [ ] **Step 5: Commit**

```bash
git add skills/
git commit -m "feat: add extended skills library (research, design, generation, architecture)"
```

---

### Task 15: Install Script & launchd Service

**Files:**
- Create: `scripts/install.sh`
- Create: `scripts/uninstall.sh`
- Create: `scripts/com.localai.gateway.plist`

- [ ] **Step 1: Create the Ollama Modelfile**

```dockerfile
# config/Modelfile
FROM qwen2.5-coder:7b-instruct

PARAMETER num_ctx 8192
PARAMETER temperature 0.3
PARAMETER repeat_penalty 1.1
PARAMETER top_p 0.85
PARAMETER top_k 40
PARAMETER stop <|endoftext|>
PARAMETER stop <|im_end|>
```

- [ ] **Step 2: Create scripts/install.sh**

```bash
#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
PLIST_NAME="com.localai.gateway"
PLIST_SRC="$SCRIPT_DIR/$PLIST_NAME.plist"
PLIST_DEST="$HOME/Library/LaunchAgents/$PLIST_NAME.plist"

echo "=== LocalAI Gateway Installer ==="
echo ""

# Step 1: Check for Ollama
echo "[1/7] Checking for Ollama..."
if ! command -v ollama &> /dev/null; then
  echo "  Ollama not found. Installing via Homebrew..."
  if ! command -v brew &> /dev/null; then
    echo "  ERROR: Homebrew not found. Install Ollama manually from https://ollama.ai"
    exit 1
  fi
  brew install ollama
else
  echo "  Ollama found: $(ollama --version)"
fi

# Step 2: Pull the base model
echo "[2/7] Pulling Qwen2.5-Coder-7B model..."
ollama pull qwen2.5-coder:7b-instruct

# Step 3: Create custom model with tuned parameters
echo "[3/7] Creating custom localai-coder model..."
ollama create localai-coder -f "$PROJECT_DIR/config/Modelfile"

# Step 4: Install Node.js dependencies
echo "[4/7] Installing dependencies..."
cd "$PROJECT_DIR"
npm install

# Step 5: Build all packages
echo "[5/7] Building packages..."
npm run build

# Step 6: Link CLI globally
echo "[6/7] Linking CLI globally..."
cd "$PROJECT_DIR/cli"
npm link
cd "$PROJECT_DIR"

# Step 7: Install launchd service
echo "[7/7] Installing launchd service..."
if [ -f "$PLIST_DEST" ]; then
  launchctl unload "$PLIST_DEST" 2>/dev/null || true
fi
# Update plist with actual paths
sed "s|__PROJECT_DIR__|$PROJECT_DIR|g" "$PLIST_SRC" > "$PLIST_DEST"
launchctl load "$PLIST_DEST"

echo ""
echo "=== Installation Complete ==="
echo ""
echo "  Gateway:  http://localhost:5577"
echo "  Health:   http://localhost:5577/health"
echo "  CLI:      local-ai \"your prompt here\""
echo "  MCP:      Add to ~/.claude/settings.json (see below)"
echo ""
echo "  Add this to your Claude Code MCP settings:"
echo "  {"
echo "    \"mcpServers\": {"
echo "      \"localai\": {"
echo "        \"command\": \"node\","
echo "        \"args\": [\"$PROJECT_DIR/mcp-server/dist/index.js\"]"
echo "      }"
echo "    }"
echo "  }"
echo ""
```

- [ ] **Step 3: Create scripts/com.localai.gateway.plist**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.localai.gateway</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/local/bin/node</string>
    <string>__PROJECT_DIR__/gateway/dist/index.js</string>
  </array>
  <key>WorkingDirectory</key>
  <string>__PROJECT_DIR__</string>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>StandardOutPath</key>
  <string>__PROJECT_DIR__/logs/gateway.out.log</string>
  <key>StandardErrorPath</key>
  <string>__PROJECT_DIR__/logs/gateway.err.log</string>
  <key>EnvironmentVariables</key>
  <dict>
    <key>NODE_ENV</key>
    <string>production</string>
  </dict>
</dict>
</plist>
```

- [ ] **Step 4: Create scripts/uninstall.sh**

```bash
#!/bin/bash
set -euo pipefail

PLIST_NAME="com.localai.gateway"
PLIST_DEST="$HOME/Library/LaunchAgents/$PLIST_NAME.plist"

echo "=== LocalAI Gateway Uninstaller ==="
echo ""

# Step 1: Stop and remove launchd service
echo "[1/4] Stopping gateway service..."
if [ -f "$PLIST_DEST" ]; then
  launchctl unload "$PLIST_DEST" 2>/dev/null || true
  rm "$PLIST_DEST"
  echo "  Service removed."
else
  echo "  No service found."
fi

# Step 2: Unlink CLI
echo "[2/4] Unlinking CLI..."
npm unlink -g @localai/cli 2>/dev/null || true
echo "  CLI unlinked."

# Step 3: Remove custom model
echo "[3/4] Removing custom model..."
ollama rm localai-coder 2>/dev/null || true
echo "  Model removed."

# Step 4: Note about base model
echo "[4/4] Cleanup complete."
echo ""
echo "  Note: The base model (qwen2.5-coder:7b-instruct) was NOT removed."
echo "  To remove it: ollama rm qwen2.5-coder:7b-instruct"
echo "  To remove Ollama entirely: brew uninstall ollama"
echo ""
```

- [ ] **Step 5: Make scripts executable**

Run: `chmod +x /Volumes/ProjectData/LocalAI/scripts/install.sh /Volumes/ProjectData/LocalAI/scripts/uninstall.sh`

- [ ] **Step 6: Create .gitignore**

```
node_modules/
dist/
logs/
*.log
.DS_Store
```

- [ ] **Step 7: Commit**

```bash
git add scripts/ config/Modelfile .gitignore
git commit -m "feat: add install/uninstall scripts and launchd service definition"
```

---

### Task 16: MCP Registration & System Integration

**Files:**
- No new files — configuration and verification steps

- [ ] **Step 1: Run all tests**

Run: `cd /Volumes/ProjectData/LocalAI && npx vitest run`
Expected: All tests pass across all packages.

- [ ] **Step 2: Build all packages**

Run: `cd /Volumes/ProjectData/LocalAI && npm run build`
Expected: Successful build, `dist/` created in each package.

- [ ] **Step 3: Verify CLI build has shebang**

Run: `head -1 /Volumes/ProjectData/LocalAI/cli/dist/index.js`
Expected: `#!/usr/bin/env node`

If missing, add it manually to `cli/src/index.ts` first line and rebuild.

- [ ] **Step 4: Document MCP registration**

The user needs to add the following to their Claude Code settings (`~/.claude/settings.json` under `mcpServers`):

```json
{
  "localai": {
    "command": "node",
    "args": ["/Volumes/ProjectData/LocalAI/mcp-server/dist/index.js"],
    "env": {
      "LOCALAI_GATEWAY_URL": "http://localhost:5577"
    }
  }
}
```

This is a manual step — the install script prints the instructions.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "chore: final integration — all tests passing, ready for install"
```

---

## Execution Order Summary

| Task | Component | Dependencies |
|------|-----------|-------------|
| 1 | Project Scaffolding | None |
| 2 | Config & Self-Awareness Prompt | None |
| 3 | Shared Types | Task 1 |
| 4 | Task Pre-Classifier | Task 3 |
| 5 | Confidence Parser | Task 3 |
| 6 | System Prompt Builder | Task 2 |
| 7 | Ollama Client | Task 3 |
| 8 | Core Gateway | Tasks 4, 5, 6, 7 |
| 9 | Express API Server | Task 8 |
| 10 | MCP Server | Task 9 |
| 11 | CLI | Task 9 |
| 12 | Keep-Working Integration | Task 9 |
| 13 | Core Skills | None (parallel with any) |
| 14 | Extended Skills | None (parallel with any) |
| 15 | Install Scripts | Tasks 9, 10, 11 |
| 16 | System Integration | All tasks |

Tasks 4+5+6+7 can run in parallel. Tasks 10+11+12 can run in parallel. Tasks 13+14 can run in parallel with everything.
