# Migration Plan

Create migration plans by describing current and target states, listing ordered steps, identifying risks, and flagging complexity.

## Prompt Chain

### Step 1: Describe Current State
Document existing architecture:
- Current technology stack
- Current architecture pattern (monolith, microservices, etc.)
- Current deployment approach
- Current scalability limitations
- Known technical debt or pain points
- Team and operational constraints
- Production metrics (uptime, latency, throughput)

Provide complete picture of status quo.

### Step 2: Describe Target State
Define the goal:
- Target technology or architecture
- What problems will be solved
- Performance or scalability targets
- New capabilities enabled
- Timeline or milestones
- Team and operational changes
- Acceptance criteria (how do we know we're done)

Be specific and measurable.

### Step 3: List Ordered Migration Steps
Create deployment sequence:
- Each step should be independently deployable and testable
- Step should be small enough to understand and fix if needed
- Steps should be ordered to minimize risk
- Include rollback strategy for each step
- Identify dependencies between steps

For each step describe:
- What is being changed
- How long it typically takes
- Rollback approach if needed
- How to verify success
- Go/no-go criteria

### Step 4: Identify Risks
Assess potential problems:
- Data migration risks (data loss, corruption, inconsistency)
- Downtime risks (can we maintain service)
- Performance risks (new system slower during transition)
- Compatibility risks (version conflicts, API changes)
- Operational risks (new tools, processes)
- Testing gaps (what if we don't catch issues until production)

Rate each risk (Critical/High/Medium/Low) and probability.

### Step 5: Create Rollback Plan
Plan for failure:
- At what point is rollback possible
- What triggers rollback (error rate, latency threshold, etc.)
- How long does rollback take
- What data needs to be restored
- Can we test rollback before production

Document rollback for each major step.

### Step 6: Flag Complexity
Assess feasibility:
- Is this migration too complex to execute safely (Yes/No)
- If yes, suggest simpler phased approach or breaking into multiple migrations
- Does execution require specialized expertise
- Can we do this with current team or need consultants
- Timeline assessment (is timeline realistic)

## Output Format

Present current and target states side-by-side. Show migration steps as numbered list with details for each. Include risk matrix and rollback procedures. End with complexity assessment and recommendation on execution feasibility.
