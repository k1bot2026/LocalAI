# Dependency Map

Create dependency maps by scanning imports, building a dependency graph, identifying issues like circular dependencies, and generating Mermaid diagrams.

## Prompt Chain

### Step 1: Scan Imports
Analyze project imports:
- Examine all source files
- Extract import statements (require, import, use, include, etc.)
- Identify both internal (same project) and external (library) imports
- Note import style (default, named, namespace, etc.)
- Create comprehensive list of all imports per file
- Handle conditional imports or lazy loading if present

Document all dependencies found.

### Step 2: Build Dependency Graph
Map relationships:
- For each file/module, list what it depends on
- For each dependency, identify which files depend on it
- Calculate dependency metrics:
  - In-degree (how many things depend on this)
  - Out-degree (how many things this depends on)
  - Reachability (what can be reached through transitive dependencies)
- Identify core modules (many things depend on them)
- Identify leaves (nothing depends on them)

Create graph representation (adjacency list or matrix).

### Step 3: Identify Circular Dependencies
Detect problematic cycles:
- Find all circular dependency chains (A -> B -> A)
- Rank by length (short cycles are worse)
- Assess impact (critical vs. peripheral code)
- Suggest breaking points (which edge to remove to fix)
- Document why cycle exists (design issue vs. mistake)

### Step 4: Generate Mermaid Diagram
Create visual representation:
- Use graph TD (top-down) for architectural clarity
- Use subgraphs to group related modules
- Highlight circular dependencies with distinct styling or notation
- Label edges with relationship type if relevant
- Color code by criticality or layer
- Keep diagram readable (not overcrowded)

Include multiple views if helpful (full graph, core modules only, etc.).

### Step 5: Annotate Connections
Document dependency details:
- What specific functions/classes are used
- Whether dependency is necessary or could be eliminated
- Whether dependency is stable or changes frequently
- Coupling strength (loose vs. tight)
- Direction of data flow if relevant

### Step 6: Identify Improvement Opportunities
Suggest refactoring:
- Which circular dependencies should be broken and how
- Which modules could be split to reduce coupling
- Which abstractions are missing
- Which modules are too central (hub pattern)
- Phased refactoring approach if large changes needed

## Output Format

Present Mermaid diagram prominently, showing circular dependencies clearly. Follow with dependency graph statistics. List all circular dependency cycles with suggested fixes. End with refactoring recommendations prioritized by impact.
