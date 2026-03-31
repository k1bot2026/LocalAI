# Config File

Generate configuration files by determining the format, listing all settings, and creating well-commented configuration with sensible defaults.

## Prompt Chain

### Step 1: Determine Format
Choose appropriate config format:
- JSON: Structured data, no comments in standard JSON (use .jsonc for comments)
- YAML: Human-readable, good for hierarchical config
- TOML: Good balance of readability and structure
- INI: Simple key-value format
- Environment variables: For secrets and runtime overrides
- Proprietary format: If framework requires specific format

Consider existing ecosystem norms for this project type.

### Step 2: List All Settings
Inventory configuration needed:
- Application settings (app name, version, environment)
- Server configuration (port, host, timeout, max connections)
- Database connection (host, port, credentials, pool size)
- Logging (level, format, output destination)
- Security (CORS, CSRF, headers, SSL)
- Third-party integrations (API keys, endpoints, timeouts)
- Feature flags if applicable
- Performance tuning (cache sizes, worker counts, etc.)

Group settings logically (server, database, logging, etc.).

### Step 3: Determine Defaults
Set sensible defaults:
- Development defaults (localhost, permissive CORS, verbose logging)
- Production defaults (secure, efficient, restrictive)
- Common values for each setting
- Which settings are required vs. optional
- Environment-specific overrides needed

Document default strategy.

### Step 4: Add Comments and Documentation
Include inline guidance:
- Description of what each setting controls
- Valid values or ranges
- Impact of changing (performance, security, behavior)
- When to use different values (dev vs. prod)
- Examples of common configurations
- Reference external documentation if needed

### Step 5: Handle Secrets and Sensitive Data
Address security:
- Use environment variables for secrets, not files
- Document how to provide secrets (.env.example without values)
- Note that config file should never be committed with secrets
- Suggest secret management tools (HashiCorp Vault, AWS Secrets Manager, etc.)
- Add .gitignore entries for credential files

### Step 6: Validate Configuration Schema
Document validation rules:
- Required fields
- Type checking (string, number, boolean, array)
- Value validation (min/max, allowed values, patterns)
- Dependency rules (if X is set, Y must also be set)
- Suggest validation approach (JSON Schema, custom validator, etc.)

## Output Format

Present configuration file with detailed comments showing purpose, valid values, and examples. Include separate .example or .template file showing all options. End with validation schema and environment setup instructions.
