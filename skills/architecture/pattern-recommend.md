# Pattern Recommend

Recommend architectural patterns by defining the problem and constraints, analyzing candidate patterns, and selecting the most appropriate with complexity flagging.

## Prompt Chain

### Step 1: Define Problem and Constraints
Clarify the design challenge:
- Problem statement (what are we trying to solve)
- Performance requirements (latency, throughput, scalability)
- Complexity constraints (team size, skill level, maintenance burden)
- Technology stack (what we're already using)
- Scale (small, medium, large, enterprise)
- Time-to-market pressure
- Existing architectural constraints (legacy systems, deployment patterns)

Document constraints explicitly.

### Step 2: List Three Candidate Patterns
Identify applicable patterns:
- Pattern 1: Name and brief description
- Pattern 2: Name and brief description
- Pattern 3: Name and brief description

Choose diverse approaches (don't suggest very similar alternatives).

### Step 3: Analyze Each Pattern
For each candidate, assess:
- **Applicability**: Does this pattern fit our problem? (High/Medium/Low)
- **Solves**: What specific aspects of the problem does this address
- **Doesn't Solve**: What aspects remain unsolved or are outside scope
- **Complexity**: Implementation and operational complexity (Low/Medium/High)
- **Learning Curve**: How hard is it for team to understand and implement
- **Maintainability**: Ease of modifying and extending over time
- **Risk**: Potential failure modes or pitfalls
- **Examples**: Real-world projects using this pattern

### Step 4: Recommend One Pattern
Select the best fit:
- State which pattern is recommended
- Explain why it's the best choice for this problem and constraints
- Acknowledge trade-offs (what we gain, what we lose)
- Describe how to implement it
- List immediate next steps

### Step 5: Flag Complexity
Assess implementation challenges:
- Is this pattern too complex for team? (Yes/No)
- If yes, suggest simpler alternative or phased approach
- Does pattern require significant infrastructure?
- Are there known pitfalls to watch for?
- Does team have experience with this pattern?

### Step 6: Alternative Paths
Provide perspective:
- If recommended pattern is too complex, what's the simpler fallback
- If constraints change, which pattern becomes better
- How to migrate to this pattern from current state if needed
- Quick wins vs. long-term solution approach

## Output Format

Present problem statement and constraints clearly. Show analysis of three patterns in comparison table format. State recommendation with reasoning. Flag complexity level prominently. End with implementation roadmap and fallback options.
