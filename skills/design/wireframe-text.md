# Wireframe Text

Design UI layouts using text wireframes by defining structure with ASCII art, documenting UI elements, describing interactions, and noting responsive behavior.

## Prompt Chain

### Step 1: Define Layout Structure
Plan the overall page/screen layout:
- Identify major sections (header, sidebar, main content, footer)
- Determine grid or flexbox structure
- Define spacing and alignment rules
- Sketch rough proportions and relationships
- Note full-page view dimensions (mobile, tablet, desktop if different)

### Step 2: Create ASCII Wireframe
Draw the layout using text art:
- Use ASCII characters to show boundaries and sections
- Label major UI regions clearly
- Show proportions (wider sections get more characters)
- Keep it simple and readable
- Indicate stacking order (above/below/left/right)

Example:
```
╔═════════════════════════════════════╗
║           HEADER / NAV              ║
╠════════════════╦═════════════════════╣
║                ║                     ║
║   SIDEBAR      ║   MAIN CONTENT      ║
║   (nav)        ║   (articles,        ║
║                ║    cards, text)     ║
║                ║                     ║
╠════════════════╩═════════════════════╣
║           FOOTER                     ║
╚═════════════════════════════════════╝
```

### Step 3: List UI Elements
Inventory all elements in the layout:
- Element name (e.g., "Logo", "Search Box", "Navigation Menu")
- Location (section and position)
- Type (text, input, button, image, list, etc.)
- Dimensions or sizing notes
- Content placeholder if applicable
- State variations (normal, hover, active, disabled)

### Step 4: Describe Interactions
Document user interactions:
- Clickable elements and their actions (link to page, toggle menu, open dialog)
- Form inputs and validation (error states, required fields)
- Navigation flows (how does user move through screens)
- Animations or transitions (smooth scroll, fade, slide)
- Responsive transitions (how layout changes on smaller screens)

### Step 5: Note Responsive Behavior
Specify behavior at different breakpoints:
- **Mobile** (< 600px): How does layout change, what collapses/hides
- **Tablet** (600-1000px): Intermediate layout
- **Desktop** (> 1000px): Full layout shown in ASCII art above
- Priority content (what appears first on mobile)
- Element reordering or hiding rules

### Step 6: Annotate Key Details
Add notes for implementation:
- Colors or styling approach (if relevant)
- Typography hierarchy (heading sizes, body text)
- White space and padding guidelines
- Accessibility considerations (ARIA labels, keyboard navigation)
- Microinteractions (tooltips, loading states, confirmations)

## Output Format

Present the ASCII wireframe prominently. Below it, provide a table or list of all UI elements with location and type. Include separate sections for Interactions and Responsive Behavior. End with implementation notes.
