# DB Schema

Design database schemas systematically by listing entities and attributes, identifying relationships, normalizing to third normal form, generating SQL, and self-reviewing for completeness.

## Prompt Chain

### Step 1: List Entities and Attributes
Identify the data model:
- List all entities (tables/collections) needed
- For each entity, list all attributes (columns/fields) with:
  - Name
  - Data type (INT, VARCHAR, TIMESTAMP, etc.)
  - Constraints (NULL/NOT NULL, DEFAULT value)
  - Whether it's an ID, foreign key, or indexed
- Include descriptions for clarity

### Step 2: Identify Relationships
Map how entities relate:
- One-to-Many (Author has many Posts)
- Many-to-Many (Students in Courses)
- One-to-One (User has one Profile)
- Self-referential (Employee reports to Manager)
- Note cardinality and optionality for each

Determine whether to use foreign keys or junction tables.

### Step 3: Normalize to 3NF
Apply normalization rules:
- **1NF**: Ensure atomic values (no repeating groups)
- **2NF**: Remove partial dependencies (non-key attributes depend on full primary key)
- **3NF**: Remove transitive dependencies (non-key attributes depend only on primary key)
- Identify and resolve any normalization violations
- Note when denormalization is intentional for performance

### Step 4: Generate CREATE TABLE SQL
Write the schema definition:
- Create table statement for each entity
- Define primary keys
- Define foreign keys with ON DELETE/UPDATE rules
- Add constraints (UNIQUE, CHECK, DEFAULT)
- Specify indexes on frequently-queried columns
- Use consistent naming conventions
- Include comments documenting purpose

### Step 5: Self-Review for Completeness
Validate the schema:
- Check for orphaned tables (unreachable entities)
- Verify all relationships have proper keys
- Confirm indexes exist on foreign keys
- Check for missing audit fields (created_at, updated_at)
- Verify no circular dependencies
- Assess if schema matches requirements
- Note any performance concerns (wide tables, missing indexes)

### Step 6: Document and Refine
Create final specification:
- Present all CREATE TABLE statements
- Document relationships with ER diagram or text
- List indexes and constraints
- Note any assumptions or limitations
- Flag areas for future optimization

## Output Format

Present the schema as working SQL with comments. Include an entity-relationship description. List all primary keys, foreign keys, and indexes clearly. End with a checklist confirming no orphans or missing indexes.
