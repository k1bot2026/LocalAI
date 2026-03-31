# LocalAI Gateway — Design Specification

**Date:** 2026-04-01
**Status:** Approved
**Hardware:** Mac Mini M4, 16GB RAM, 10 cores

---

## 1. Project Overview

### Purpose

Build a local AI gateway service on a Mac Mini M4 that:

1. **Assists paid Claude agents** — offloads simple/repetitive tasks to a free local model during keep-working sessions, saving tokens and letting paid agents focus on complex work
2. **Provides standalone local AI access** — a CLI, MCP server, and OpenAI-compatible API for direct use without consuming paid tokens
3. **Knows its own limits** — semi-hard boundaries with confidence reporting, so output quality is transparent to both users and paid agents

### Goals

- **Availability first** — local model available anytime, even offline or rate-limited
- **Token savings** — estimated 30-50% reduction during keep-working hybrid sessions
- **Quality transparency** — every response includes confidence assessment; uncertain output is flagged, not hidden
- **Optional integration** — keep-working local delegation is opt-in, not default behavior

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Mac Mini M4                       │
│                                                      │
│  ┌──────────┐    ┌──────────────────────────────┐   │
│  │  Ollama   │    │      LocalAI Gateway         │   │
│  │  Server   │◄──►│                              │   │
│  │          │    │  ┌────────┐ ┌─────┐ ┌─────┐  │   │
│  │ Qwen2.5  │    │  │  MCP   │ │ CLI │ │ API │  │   │
│  │ Coder-7B │    │  │ Server │ │     │ │     │  │   │
│  └──────────┘    │  └────────┘ └─────┘ └─────┘  │   │
│                   │                              │   │
│                   │  ┌─────────────────────────┐ │   │
│                   │  │   Self-Awareness Layer   │ │   │
│                   │  │  - Task classification   │ │   │
│                   │  │  - Confidence scoring    │ │   │
│                   │  │  - Escalation flags      │ │   │
│                   │  └─────────────────────────┘ │   │
│                   └──────────────────────────────┘   │
│                                                      │
│  Callers:                                            │
│  ┌───────────────┐  ┌───────┐  ┌─────────────────┐  │
│  │ Claude Code   │  │  You  │  │  Keep-Working    │  │
│  │ (paid agents) │  │ (CLI) │  │  (plugin)        │  │
│  │ via MCP       │  │       │  │  via API/MCP     │  │
│  └───────────────┘  └───────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### Components

1. **Ollama** — runs the model, exposes raw inference API on `localhost:11434`
2. **LocalAI Gateway** — Node.js/TypeScript service wrapping Ollama, adding self-awareness, confidence scoring, and three interfaces (MCP, CLI, API)
3. **Self-Awareness Layer** — built into the gateway's system prompt and response post-processing

### Data Flow

```
Caller → Gateway (classifies task, prepares prompt) → Ollama → Model → Gateway (extracts confidence, adds metadata) → Caller
```

### Ports

- Ollama: `localhost:11434` (default)
- Gateway API: `localhost:5577`
- MCP Server: stdio (standard for Claude Code MCP)

---

## 3. Model Configuration

### Base Model

**Qwen2.5-Coder-7B-Instruct** via Ollama — strongest coding model at 7B parameter size, good general ability, native FIM (fill-in-the-middle) support.

### Custom Modelfile

```dockerfile
FROM qwen2.5-coder:7b-instruct

PARAMETER num_ctx 8192
PARAMETER temperature 0.3
PARAMETER repeat_penalty 1.1
PARAMETER top_p 0.85
PARAMETER top_k 40
PARAMETER stop <|endoftext|>
PARAMETER stop <|im_end|>

SYSTEM """
You are LocalAI, a capable local coding assistant running Qwen2.5-Coder-7B.
You produce clean, correct, well-structured output.
You always assess your own confidence and flag uncertainty.
You never hallucinate file paths, APIs, or function names.
When unsure, you say so clearly rather than guessing.
"""
```

### Parameter Rationale

| Parameter | Default | Ours | Effect |
|---|---|---|---|
| `num_ctx` | 2048 | 8192 | 4x more file content comprehension |
| `temperature` | 0.7 | 0.3 | More deterministic/reliable code output |
| `top_p` | 0.9 | 0.85 | Tighter, less random output |
| `repeat_penalty` | 1.0 | 1.1 | Prevents repetitive patterns common in small models |

### RAM Budget

- Qwen2.5-Coder-7B: ~5-6GB
- Ollama overhead: ~0.5GB
- Gateway + MCP: ~0.2GB
- System + other apps: ~9-10GB remaining

---

## 4. Self-Awareness Layer

### Level 1: System Prompt Engineering

Every request gets wrapped with a system prompt that defines:

**Strengths (handle confidently):**
- Single-file code edits, formatting, linting fixes
- Boilerplate/config generation from clear specs
- Code summarization and explanation
- Documentation, comments, changelogs
- Git commit messages and simple git operations
- File search, grep, content extraction
- Test execution and basic result interpretation
- Simple refactoring within a single file

**Limitations (flag uncertainty):**
- Multi-file architectural changes
- Complex debugging requiring deep reasoning
- Tasks requiring >4K tokens of context to understand
- Novel algorithm design
- Security-sensitive code review
- Tasks where unsure about codebase conventions

**Rules:**
- End every response with `[CONFIDENCE: high|medium|low]`
- If medium: explain what is uncertain
- If low: recommend escalation to a paid model with reasoning
- Never hallucinate file paths, function names, or APIs
- If a task feels too complex, say so BEFORE attempting it

### Level 2: Gateway Post-Processing

The gateway parses model responses and extracts structured metadata:

```json
{
  "response": "...",
  "confidence": "medium",
  "uncertainty_reason": "Not sure about import conventions in this project",
  "escalation_recommended": false
}
```

### Level 3: Task Pre-Classification (Gateway-side)

Fast heuristic check before sending to the model:

| Signal | Classification |
|---|---|
| Request mentions 3+ files | Likely complex — warn caller |
| Request > 2000 chars | Might exceed context capacity — warn |
| Contains "debug", "why does", "architect" | Reasoning-heavy — flag |
| Contains "format", "rename", "add comment" | Simple — proceed confidently |
| Contains "security", "auth", "crypto" | Sensitive — flag |

### Caller Experience

- **CLI (user):** Confidence shown as colored tag: green high, yellow medium, red low
- **MCP/API (paid agent):** Structured JSON metadata for programmatic branching
- **Keep-working:** Auto-accept high, review medium, escalate low

---

## 5. Three Interfaces

### Interface 1: CLI (`local-ai`)

```bash
# Simple usage
local-ai "generate a .gitignore for a Node.js project"

# Pipe content in
cat src/utils.ts | local-ai "add JSDoc comments to these functions"

# With file context
local-ai --file src/app.ts "explain what this file does"

# Interactive mode
local-ai --chat

# Use a specific skill
local-ai --skill code-review --file src/app.ts
```

Installed globally via `npm link`. Confidence shown as colored inline tags.

### Interface 2: MCP Server

Registered in Claude Code MCP settings. Exposes tools:

- `local_ai_query` — send a prompt, get response with confidence metadata
- `local_ai_code_edit` — send file + instruction, get edited content with confidence
- `local_ai_summarize` — send content, get summary

Each tool returns structured JSON including confidence and escalation fields.

### Interface 3: OpenAI-Compatible API

Gateway proxies Ollama's API with self-awareness injection. Runs on `localhost:5577`.

```
POST http://localhost:5577/v1/chat/completions
```

Compatible with any tool that speaks OpenAI API. Self-awareness metadata returned in a custom response field.

All three interfaces share the same system prompt, confidence extraction, pre-classification, and Ollama backend.

---

## 6. Keep-Working Integration

### Three Tiers

```bash
# Tier 1: Regular (default, unchanged behavior)
/keep-working

# Tier 2: Hybrid — paid leads, local assists
/keep-working --local assist

# Tier 3: Full local — no paid tokens used
/keep-working --local full
```

**Tier 1: Regular**
- Exactly how keep-working works today
- All tasks executed by paid agents
- Full quality, full cost

**Tier 2: Assist**
- Paid agent orchestrates and makes all decisions
- Simple tasks delegated to local model via MCP
- Paid agent verifies local output before accepting
- Complex tasks stay with paid agent
- Estimated ~30-50% token savings

**Tier 3: Full Local**
- Local model runs the entire backlog autonomously
- No paid tokens consumed
- Self-awareness layer flags tasks it cannot handle
- Flagged tasks are parked with `needs-paid` tag
- Works through backlog in order — does not reorder, skip, or create new tasks
- Logs everything for later review

### Mid-Session Switching

```bash
/keep-working:local assist    # Switch to hybrid
/keep-working:local full      # Switch to full local
/keep-working:local off       # Disable local entirely
/keep-working:local status    # Show stats
```

### Status Output

```
Mode: assist
Tasks completed (local): 8
Tasks completed (paid): 4
Tasks parked (needs-paid): 2
Estimated token savings: ~42%
```

### Configuration

```json
{
  "local_delegation": {
    "enabled": false,
    "auto_accept_confidence": "high",
    "review_confidence": "medium",
    "escalate_confidence": "low",
    "max_concurrent_local_tasks": 1
  }
}
```

---

## 7. Skills Library

Pre-crafted prompt chains that break complex tasks into sequential steps the 7B model can handle reliably.

### Core Skills

| Skill | Purpose |
|---|---|
| `code-review.md` | Single-file review: style, bugs, suggestions |
| `explain-code.md` | File explanation: purpose, flow, key functions |
| `write-tests.md` | Test generation: read file, identify cases, write tests |
| `refactor.md` | Single-file refactor: analyze, plan, execute |
| `commit-message.md` | Read diff, draft conventional commit message |
| `summarize.md` | Summarize file/content with key points |
| `doc-writer.md` | Generate JSDoc/docstrings for functions |

### Research Skills

| Skill | Purpose |
|---|---|
| `research/codebase-explore.md` | Navigate and map unfamiliar code structures |
| `research/doc-lookup.md` | Fetch and summarize library/API documentation |
| `research/tech-compare.md` | Compare technologies against explicit criteria |
| `research/dependency-audit.md` | Analyze project dependencies for issues |
| `research/changelog-digest.md` | Summarize changes between versions |

### Design Skills

| Skill | Purpose |
|---|---|
| `design/api-design.md` | REST/GraphQL endpoint design from requirements |
| `design/db-schema.md` | Database schema from entity descriptions |
| `design/component-spec.md` | UI component props, states, behavior spec |
| `design/wireframe-text.md` | Text-based wireframe/layout descriptions |
| `design/system-diagram.md` | Mermaid/Excalidraw architecture diagrams |
| `design/design-review.md` | Review existing design for common issues |

### Generation Skills

| Skill | Purpose |
|---|---|
| `generation/scaffold-project.md` | Project starter from tech stack description |
| `generation/dockerfile.md` | Dockerfile + docker-compose generation |
| `generation/ci-pipeline.md` | GitHub Actions / basic CI config |
| `generation/config-file.md` | Any config format from requirements |
| `generation/test-scaffold.md` | Test file structure and setup boilerplate |
| `generation/migration.md` | Database migration files from schema diff |
| `generation/boilerplate.md` | Repetitive code patterns from examples |

### Architecture Skills

| Skill | Purpose |
|---|---|
| `architecture/pattern-recommend.md` | Suggest design patterns for a given problem |
| `architecture/dependency-map.md` | Visualize module/package dependencies |
| `architecture/migration-plan.md` | Step-by-step migration plan for simple changes |
| `architecture/architecture-review.md` | Review existing architecture for common issues |
| `architecture/decision-record.md` | Generate ADR (Architecture Decision Record) |
| `architecture/scaling-basics.md` | Basic scaling recommendations |

### Skill Structure

Each skill is a structured prompt chain. Example (`design/db-schema.md`):

```
Step 1: "List all entities and their attributes from the requirements"
Step 2: "Identify relationships: one-to-one, one-to-many, many-to-many"
Step 3: "Generate normalized schema (3NF) with primary/foreign keys"
Step 4: "Generate CREATE TABLE SQL statements"
Step 5: "Self-review: check for missing indexes, orphaned references, naming consistency"
```

### Capability Boundaries Per Domain

**Research:**
- Can: single-library doc lookup, codebase mapping, dependency listing, changelog summarization
- Escalate: synthesizing contradictory sources, evaluative "best tool" recommendations, security analysis

**Design:**
- Can: CRUD API design, relational schemas, component specs, simple diagrams
- Escalate: complex auth flows, sharding strategy, distributed failure analysis

**Generation:**
- Can: standard Dockerfiles, basic CI workflows, project scaffolding, config files, FIM completion
- Escalate: multi-stage security-hardened builds, complex matrix pipelines, monorepo configs

**Architecture:**
- Can: standard pattern recommendations, dependency graphs, simple migration plans, ADRs
- Escalate: multi-concern tradeoff analysis, distributed system design, zero-downtime migrations

---

## 8. Quality Amplification

### Prompt Augmentation (Gateway)

Before sending to model, the gateway automatically:
- Adds relevant file context (reads the file being discussed)
- Appends "Think step by step" for reasoning tasks
- Adds "Output only the code, no explanation" for code generation tasks
- Includes project conventions if `.editorconfig` or similar exists

### Response Validation (Gateway)

For code output, basic sanity checks:
- Syntax validation (does the output parse as valid code?)
- Bracket/brace matching
- Import statement verification (do referenced imports exist?)
- If validation fails, confidence auto-drops to `low`

### Self-Review Pass (Optional)

When confidence is `medium`, the gateway can optionally:
- Send output back to the model: "Review your answer. Is this correct?"
- Single self-review pass catches many 7B-level mistakes
- Configurable: off by default, enabled per-skill or globally

### FIM Code Completion

Qwen2.5-Coder-7B's native strength. The gateway uses FIM tokens for in-file completion:

```
<|fim_prefix|>function calculateTotal(items: CartItem[]) {
<|fim_suffix|>
  return total;
}
<|fim_middle|>
```

---

## 9. MCP Server Ecosystem

### Core (installed with gateway)

| MCP Server | Purpose |
|---|---|
| `@modelcontextprotocol/server-filesystem` | Read/write/search files |
| `@modelcontextprotocol/server-git` | Git operations |
| `context7` | Library documentation lookup |
| `@anthropic/mcp-server-shell` | Controlled shell access |

### Extended (for expanded skill domains)

| MCP Server | Domain | Purpose |
|---|---|---|
| `excalidraw-mcp` | Design/Architecture | Visual diagrams, wireframes, system architecture |
| `tavily-mcp` | Research | Web search with semantic understanding |
| `docker-mcp` | Generation | Docker config generation and validation |
| `github-mcp` | Research/Architecture | Repo exploration, architecture from code |
| `db-mcp-server` | Design | Test schemas against real databases |
| `schemacrawler-mcp` | Architecture | Analyze existing database schemas |

---

## 10. Project Structure

```
/Volumes/ProjectData/LocalAI/
├── gateway/
│   ├── src/
│   │   ├── server.ts           # Express server — API + health endpoints
│   │   ├── ollama.ts           # Ollama client wrapper
│   │   ├── classifier.ts       # Task pre-classification heuristics
│   │   ├── confidence.ts       # Response parsing, confidence extraction
│   │   ├── prompts.ts          # Self-awareness system prompt builder
│   │   └── types.ts            # Shared types
│   ├── package.json
│   └── tsconfig.json
│
├── mcp-server/
│   ├── src/
│   │   ├── index.ts            # MCP server entry point
│   │   └── tools.ts            # Tool definitions (query, code_edit, summarize)
│   └── package.json
│
├── cli/
│   ├── src/
│   │   ├── index.ts            # CLI entry point
│   │   └── format.ts           # Terminal formatting + confidence colors
│   └── package.json
│
├── keep-working-local/
│   ├── src/
│   │   ├── delegator.ts        # Task classification + delegation logic
│   │   ├── tiers.ts            # Tier 1/2/3 mode management
│   │   └── tracker.ts          # Stats tracking (delegated, escalated, savings)
│   └── package.json
│
├── skills/
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
│
├── config/
│   ├── default.json            # Default settings
│   └── prompts/
│       └── self-awareness.md   # System prompt (easy to iterate on)
│
├── scripts/
│   ├── install.sh              # One-command setup
│   └── uninstall.sh
│
└── docs/
    └── superpowers/
        └── specs/
            └── 2026-04-01-localai-gateway-design.md
```

### Tech Stack

| Component | Tech | Why |
|---|---|---|
| Gateway | TypeScript + Express | Matches Claude Code ecosystem |
| MCP Server | `@modelcontextprotocol/sdk` | Official MCP SDK |
| CLI | TypeScript + Commander.js | Consistent with gateway |
| Model runtime | Ollama | Best Mac support |
| Model | Qwen2.5-Coder-7B-Instruct | Best code model at 7B |
| Config | JSON | Simple, no dependencies |
| Daemon | launchd | Mac-native, starts on boot |

### System Integration

- Gateway runs as a launchd service — starts on boot, always available
- CLI installed via `npm link` — available globally as `local-ai`
- MCP server registered in `~/.claude/settings.json`
- Ollama runs as its own service (default Mac behavior)
