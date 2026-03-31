# System Diagram

Design system architectures by listing components, defining connections, generating Mermaid diagrams, and annotating all relationships clearly.

## Prompt Chain

### Step 1: List Components
Identify all system parts:
- Component name
- Type (service, database, client, library, external API, queue, cache, etc.)
- Purpose (brief one-line description)
- Technology used if relevant
- Scope (internal, third-party, etc.)

Organize logically (frontend, backend, data, external, etc.).

### Step 2: Define Connections
Map how components interact:
- Source component → Destination component
- Connection type (synchronous API call, async message, database query, file I/O, etc.)
- Direction (one-way or bidirectional)
- Protocol or interface (HTTP, gRPC, SQL, message queue, etc.)
- Authentication/authorization if relevant
- Data format (JSON, Protocol Buffer, CSV, etc.)

List all connections systematically.

### Step 3: Choose Diagram Type
Select the appropriate Mermaid format:
- **graph TD** (flowchart): Best for architectural overviews, showing flow and hierarchy
- **sequenceDiagram**: Best for showing interaction sequences over time
- **erDiagram**: Best for data models and relationships
- Assess which best represents this system

### Step 4: Generate Mermaid Diagram
Create the diagram code:
- Use appropriate Mermaid syntax for chosen diagram type
- Include all components and connections from Steps 1-2
- Label connections with protocol/type information
- Use clear naming and grouping
- Keep it readable (not overcrowded)

For complex systems, consider multiple diagrams (request flow, data flow, deployment architecture).

### Step 5: Annotate Connections
Add detailed notes for each connection:
- What data or messages flow across it
- Frequency (continuous, occasional, peak times)
- Failure modes or resilience strategy
- Whether synchronous or asynchronous
- Any retry/timeout logic
- Security considerations (encryption, authentication)

### Step 6: Document Assumptions and Constraints
Note system context:
- Deployment environment (cloud, on-premise, hybrid)
- Scaling considerations (horizontal, vertical)
- High availability approach if relevant
- Single points of failure
- Performance implications of connections
- Future extensibility points

## Output Format

Present the Mermaid diagram code in a markdown code block. Follow with detailed annotations of each connection. Include sections for Components, Connections, and Assumptions. Provide both the diagram syntax and a description of what it shows.
