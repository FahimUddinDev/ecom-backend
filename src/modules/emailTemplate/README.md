# Email Template Module

Manage email templates used across the application.

Base path: `/api/email-template`

## Routes

### GET `/api/email-template/`

- **Purpose**: List all templates
- **Response**: `EmailTemplate[]`

### POST `/api/email-template/`

- **Purpose**: Create a template
- **Validation**: `createEmailTemplateSchema`
- **Body**:

```json
{ "name": "welcome", "subject": "Welcome", "body": "<h1>Hi {{name}}</h1>" }
```

- **Response**: Created template
- **Errors**: 400 on validation; 409 if name already exists

### GET `/api/email-template/:id`

- **Purpose**: Get a template by id or by name (string)
- If `:id` looks numeric, treated as ID; otherwise as `name`

### PUT `/api/email-template/:id`

- **Purpose**: Update a template
- **Validation**: `updateEmailTemplateSchema`
- **Body**:

```json
{ "name": "welcome", "subject": "Welcome again", "body": "..." }
```

### DELETE `/api/email-template/:id`

- **Purpose**: Delete a template by id
- **Response**: 204 No Content

## Validation

- `createEmailTemplateSchema`: requires `name`, `subject`, `body`
- `updateEmailTemplateSchema`: allows partial updates

## Notes

- Names must be unique; creation fails if a template with the same name exists.
- Template bodies can contain placeholders (e.g., `{{name}}`) consumed by mail logic.
