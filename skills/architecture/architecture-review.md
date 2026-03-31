# Architecture Review

Perform architecture reviews by mapping components and connections, evaluating against key criteria, and reporting findings with severity levels.

## Prompt Chain

### Step 1: Map Components and Connections
Understand the system:
- List all major components (services, databases, queues, caches, etc.)
- Identify the role of each component
- Map connections between components
- Identify synchronous vs. asynchronous communication
- Document data flow through system
- Identify external dependencies
- Note technology for each component

Create architecture diagram or detailed description.

### Step 2: Evaluate Single Points of Failure
Assess system resilience:
- Which components, if failed, would bring down the system
- Are there redundant copies or failover mechanisms
- What's the impact duration if each component fails
- Can we detect and recover from failures automatically
- Rate: OK / Minor Risk / Significant Risk

### Step 3: Evaluate Coupling and Cohesion
Check design health:
- Are components loosely coupled (changes don't ripple)
- Are related functions grouped together cohesively
- Do components have clear responsibilities
- Are there hidden dependencies between components
- Can components be deployed independently
- Rate: OK / Minor Issue / Significant Problem

### Step 4: Evaluate Error Boundaries
Assess fault isolation:
- Does failure in one component affect others
- Are there circuit breakers or bulkheads
- Do errors propagate and cascade
- Can we gracefully degrade with partial failures
- Is error recovery automatic or manual
- Rate: OK / Minor Issue / Significant Problem

### Step 5: Evaluate Data Ownership
Check data integrity:
- Does each data store have a single owner
- Are there multiple sources of truth for same data
- Is data consistency validated
- Can we trace data lineage
- Are backup and recovery procedures clear
- Rate: OK / Minor Issue / Significant Problem

### Step 6: Evaluate Scalability Concerns
Assess growth readiness:
- Which components are bottlenecks under load
- Can system scale horizontally
- Are there shared resources preventing scaling
- Is state properly distributed or can it centralize
- Do query patterns optimize for data access
- Rate: OK / Minor Issue / Significant Problem

### Step 7: Evaluate Security Posture
Check security:
- Is authentication/authorization enforced consistently
- Are data flows encrypted
- Are secrets stored safely (no hardcoding)
- Is access controlled (principle of least privilege)
- Are injection attacks prevented
- Rate: OK / Minor Issue / Significant Problem

### Step 8: Evaluate Operational Concerns
Check operational health:
- Is system observable (logging, metrics, tracing)
- Can we diagnose problems in production
- Are there runbooks or incident response procedures
- Is deployment and rollback automated
- Are dependencies well-documented
- Rate: OK / Minor Issue / Significant Problem

### Step 9: Report Findings
Create comprehensive review:
- **Summary**: Overall assessment and risk level
- **Strengths**: 2-3 things done well
- **Findings by Severity**:
  - **Critical**: Immediate risk (service failure, data loss, security)
  - **High**: Should fix soon (pain points, limitations, technical debt)
  - **Medium**: Consider fixing (code quality, maintainability)
  - **Low**: Optional (documentation, nice-to-have improvements)
- **Recommendations**: Prioritized action items
- **Escalation**: Flag if too complex to review thoroughly

## Output Format

Present architecture map or diagram first. Show evaluation results in severity-organized sections. For each finding, describe issue, impact, and suggested resolution. End with priority action items and confidence assessment.
