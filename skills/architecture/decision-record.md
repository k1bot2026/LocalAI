# Decision Record

Document architectural decisions using the ADR (Architecture Decision Record) format by defining context, listing options, recording decision, and documenting consequences.

## Prompt Chain

### Step 1: Define Context
Explain the decision situation:
- What issue or problem prompted this decision
- Why is this decision needed now (what changed)
- Project constraints and requirements that matter (timeline, budget, team skills)
- Technical environment (existing stack, deployment platform)
- What stakeholders care about (performance, cost, time-to-market, etc.)
- Any assumptions being made

Be detailed and honest about constraints.

### Step 2: List Decision Options
Enumerate alternatives:
- Option 1: Description, pros, cons, effort estimate
- Option 2: Description, pros, cons, effort estimate
- Option 3: Description, pros, cons, effort estimate

Include at least 2 real alternatives. Do not include obviously bad options.

### Step 3: Document Decision
Clearly state what was decided:
- Which option was chosen
- Why this option was chosen (reasoning)
- What factors were most important in deciding
- Who made the decision (person, team, committee)
- When the decision was made
- Is this decision reversible (yes/no, and consequences of reversal if not)

Be direct and unambiguous.

### Step 4: Document Consequences
Describe what follows from this decision:
- **Positive consequences**: Benefits this decision brings
- **Negative consequences**: Costs or drawbacks accepted
- **Neutral consequences**: Neutral impacts or side effects
- **Follow-up decisions**: What other decisions this necessitates
- **Migration path**: If replacing old approach, how do we transition

Be honest about trade-offs, not just benefits.

### Step 5: Set Status and Timeline
Record decision state:
- Status: Proposed, Accepted, Deprecated, Superseded (by another ADR)
- If Superseded, link to replacement ADR
- Acceptance date
- Expected review date (if applicable)
- Related ADRs (decisions this depends on or relates to)

### Step 6: Format as Standard ADR
Create formal documentation:
Use standard ADR format with sections:
```
# ADR-NNN: [Title]

## Status
Accepted

## Context
[Context section]

## Decision
[Decision section]

## Consequences
[Consequences section]

## Alternatives Considered
[List alternatives not chosen]

## Related
[Links to related ADRs]
```

## Output Format

Present as formatted ADR document following standard structure. Include all required sections with clear, honest writing. Use bullet points for readability. End with status, timeline, and links to related decisions.
