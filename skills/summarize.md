# Summarize

Create concise, structured summaries of content by identifying content type, extracting key points, noting structure, and outputting bullet points.

## Prompt Chain

### Step 1: Identify Content Type
Determine what kind of content you're summarizing:
- Technical documentation
- Article or blog post
- Meeting notes or transcript
- Research paper or academic content
- Code comments or docstring
- Chat or email thread

Understanding the type helps you extract relevant information.

### Step 2: Extract Key Points
Read through the content and identify the main ideas:
- What are the 3-5 most important concepts?
- What problems are being discussed?
- What solutions or conclusions are presented?
- What decisions were made?

List these as raw points—do not format yet.

### Step 3: Note Structure and Relationships
Map how these key points relate:
- Are there prerequisites or dependencies between ideas?
- Is there a cause-and-effect relationship?
- What is the hierarchy (main point vs supporting detail)?
- Are there any recurring themes?

This helps ensure your summary is logically organized.

### Step 4: Output Bullet Points
Create a structured bullet-point summary:
- Use 5-10 bullets maximum
- Start each with a clear topic
- Include supporting detail or data if relevant
- Use consistent grammar (all questions, all statements, or all imperatives)
- Group related points together logically

### Step 5: Add Context Line
Write one sentence at the top summarizing the overall takeaway or purpose of the content.

## Output Format

Provide the summary in this format:
```
**Context/Overall Takeaway:** [One sentence]

- [Bullet point 1]
- [Bullet point 2]
- [Bullet point 3]
...
```

Keep the summary concise but information-rich.
