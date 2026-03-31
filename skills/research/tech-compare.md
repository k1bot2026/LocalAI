# Tech Compare

Perform objective technology comparison by establishing evaluation criteria, researching facts for each option, building a comparison table, and presenting factual analysis without recommendations.

## Prompt Chain

### Step 1: List Comparison Criteria
Define what matters for this decision:
- Performance characteristics (speed, memory, throughput)
- Learning curve and community size
- Maturity and stability
- Cost and licensing
- Integration with existing stack
- Scalability and maintainability
- Support and documentation quality
- Any project-specific constraints

List 8-12 criteria that are relevant to the decision at hand.

### Step 2: Research Facts Per Technology
Investigate each technology independently:
- Official documentation and benchmarks
- Community adoption rates and trends
- Known limitations and gotchas
- Version stability and update frequency
- Relevant case studies or deployments
- Performance metrics where available
- Licensing terms
- Note sources for findings

### Step 3: Build Comparison Table
Create a structured comparison:
- Rows = technologies being compared
- Columns = criteria from Step 1
- Fill with factual information from Step 2
- Mark unknowns clearly with "?" rather than guessing
- Include units where relevant (e.g., "10ms latency")
- Note version assumptions if applicable

### Step 4: Document Unknowns
For any incomplete comparisons:
- Identify which criteria lack reliable data
- Explain why (e.g., "Benchmarks not published")
- Suggest how to fill the gap if needed
- Note confidence level for borderline data

### Step 5: Present Facts Only
Format the final output:
- Display the comparison table prominently
- Provide brief factual context for each technology
- Include data sources and version information
- Explicitly state which criteria have unknown values
- End with a note: "This comparison presents facts only. Recommendations depend on project-specific needs."

## Output Format

Present the comparison table as the primary output. Include brief descriptions of each technology before the table. Show sources and version information clearly. End with a summary of unknowns and confidence assessment per criterion.
