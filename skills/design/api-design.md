# API Design

Design RESTful APIs systematically by identifying resources, defining CRUD endpoints, specifying request/response formats, documenting validation rules, and formatting as an API specification.

## Prompt Chain

### Step 1: Identify Resources
Determine what this API exposes:
- List entities or domain objects (User, Post, Comment, etc.)
- Identify which should be top-level API resources
- Note resource relationships (one-to-many, many-to-many)
- Consider resource hierarchy (nested vs. flat structure)
- Define resource IDs and naming conventions

### Step 2: Define CRUD Endpoints
For each resource, specify standard operations:
- **CREATE**: POST /resource (request body, response body, success status 201)
- **READ**: GET /resource/{id} (response body, status 200)
- **UPDATE**: PUT /resource/{id} (request body, response, status 200) or PATCH (partial)
- **DELETE**: DELETE /resource/{id} (status 204 or 200)
- **LIST**: GET /resource (query parameters for pagination/filtering, status 200)

Document each endpoint with HTTP method, path, and purposes.

### Step 3: Define Relationship Endpoints
Specify endpoints for resource relationships:
- Nested resources: GET /resource/{id}/related or /resource/{id}/related/{relId}
- Bulk operations: POST /resource/batch
- Search endpoints: GET /resource/search
- Custom actions: POST /resource/{id}/action

Document request and response formats for each.

### Step 4: Specify Request/Response Format
Define data interchange:
- Request body schema (JSON, required fields, types)
- Response body schema (success response, error response)
- HTTP status codes (200, 201, 204, 400, 401, 403, 404, 409, 500)
- Headers (Content-Type, Authorization, pagination headers)
- Field naming conventions (camelCase, snake_case, etc.)
- Pagination strategy (offset/limit, cursor-based, keyset)

Provide example request/response pairs per endpoint.

### Step 5: Validation Rules
Document validation requirements:
- Required vs. optional fields
- Field types and formats (string, integer, email, UUID, etc.)
- Length constraints (min/max string length, array size)
- Value constraints (enum values, ranges, patterns)
- Cross-field validation (password confirmation, date ranges)
- Conflict rules (unique fields, conditional requirements)

List validation errors (status 422 or 400) with error codes and messages.

### Step 6: Format as Specification
Create API specification:
- Use OpenAPI/Swagger format or clear text specification
- Include base URL and versioning strategy
- Document authentication method
- List all endpoints with full details
- Include example requests and responses
- Document error responses and codes
- Note rate limiting if applicable

## Output Format

Present as an API specification document with clear sections for Resources, Endpoints, Request/Response Formats, Validation Rules, and Authentication. Use OpenAPI format if possible, otherwise structured text. Include multiple endpoint examples.
