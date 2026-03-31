# Migration

Generate database migrations by diffing current and target schemas, creating up and down migration SQL, and outputting with timestamp-based naming.

## Prompt Chain

### Step 1: Diff Current vs. Target Schema
Compare database states:
- Examine current schema (describe tables, show indexes, constraints)
- Review target schema specification
- Identify added tables
- Identify removed tables
- For each modified table:
  - Added columns (with types and constraints)
  - Removed columns
  - Modified columns (type changes, constraint changes)
  - Added/removed indexes
  - Added/removed constraints
  - Renamed columns (if detectable)

Document each difference with impact assessment.

### Step 2: Generate Up Migration SQL
Create forward migration:
- Migrations should be idempotent (can safely run multiple times)
- Use IF NOT EXISTS / IF EXISTS checks as appropriate
- Create new tables (CREATE TABLE)
- Add columns to existing tables (ALTER TABLE ADD)
- Drop columns no longer needed (ALTER TABLE DROP)
- Create or modify indexes
- Add or drop constraints
- Include data transformation if needed (UPDATE statements)
- Order operations properly (foreign keys, dependencies)
- Add comments explaining intent

### Step 3: Generate Down Migration SQL
Create rollback migration:
- Reverse all up migration changes
- Drop newly created tables
- Remove newly added columns
- Restore removed columns if data preserved
- Drop newly created indexes
- Remove newly added constraints
- Restore previous constraints if changed
- Use IF EXISTS checks
- Ensure rollback is safe and complete

### Step 4: Apply Migration Naming Convention
Use timestamp-based naming:
- Format: YYYYMMDDHHMMSS_description.sql
- Example: 20240401150230_add_user_preferences_table.sql
- Each migration file includes both UP and DOWN (comment-separated or separate files)
- Order is determined by timestamp
- File paths follow convention (db/migrations/, migrations/, etc.)

### Step 5: Validate Migration
Test safety:
- Check that UP then DOWN returns to original state
- Verify indexes and constraints are recreated correctly
- Check for data loss in DOWN migration (if acceptable)
- Confirm SQL syntax is correct for target database
- Test with sample data if possible
- Identify potential issues (locks, downtime, etc.)

### Step 6: Document Migration
Provide context:
- Purpose (what feature or fix does this enable)
- Breaking changes (does this require code changes)
- Rollback strategy (can we safely roll back if issues occur)
- Performance impact (expected duration, locking)
- Order dependency (must run after other migrations)
- Manual steps if needed (data cleanup, etc.)

## Output Format

Present migration file(s) with proper naming. Show complete UP and DOWN SQL with comments. Include validation notes and documentation of purpose. Flag any breaking changes or manual steps required.
