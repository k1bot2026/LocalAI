# Component Spec

Design reusable components systematically by defining purpose, documenting props, listing internal state and triggers, documenting events, and formatting as a TypeScript interface.

## Prompt Chain

### Step 1: Define Component Purpose
Clarify the component's role:
- What does this component do in one sentence
- What problem does it solve
- When and where is it used
- What are the design constraints (size, accessibility, responsiveness)
- Any performance considerations
- Related components it works with

### Step 2: Document Props
Specify all input properties:
- Prop name
- Type (string, number, boolean, React.ReactNode, custom types, etc.)
- Required (required, optional)
- Default value (if any)
- Description of what this prop controls
- Allowed values or constraints (enum, range, format)
- Example usage

List props in logical grouping (layout, content, behavior, styling, etc.).

### Step 3: List Internal State and Triggers
Document what state the component manages:
- State variable name
- Type of the state
- Initial value
- What triggers changes to this state (user interaction, props change, lifecycle)
- Side effects when state changes
- Whether state affects rendering or external behavior

Include diagram or description of state transitions if complex.

### Step 4: Document Events
Specify events the component emits:
- Event name (onSubmit, onChange, onSelect, etc.)
- When it fires (which user action or condition)
- Payload/data passed with event
- Example handler code

List events in order of frequency or logical grouping.

### Step 5: Format as TypeScript Interface
Create component definition:
- Props interface with proper types
- State interface if complex
- Event payload interfaces
- Includes JSDoc comments for clarity
- Example usage code snippet

### Step 6: Visual and Interaction Notes
Document presentation and behavior:
- Basic appearance (what does it look like)
- Responsive behavior (mobile, tablet, desktop)
- Keyboard navigation and accessibility
- Animated states if applicable
- Error states or edge cases

## Output Format

Present component specification as TypeScript interfaces with JSDoc comments. Include purpose, prop table, event documentation, and usage example code. End with visual/interaction notes.
