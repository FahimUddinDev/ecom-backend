# Email Template Module – Developer Guide

## Components

- `emailTemplate.routes.ts`: CRUD routes with validation
- `emailTemplate.controller.ts`: Thin handlers
- `emailTemplate.service.ts`: Guards + business rules
- `emailTemplate.model.ts`: Prisma access (not shown here but used)
- `emailTemplate.validator.ts`: Yup schemas

## Behavior

- Create: checks uniqueness by `name` via model, throws if exists
- Update/Delete: pass-through to model by id
- Read: `findEmailTemplate(idOrName)` infers query: numeric → `id`, otherwise `name`

## Validation

- `createEmailTemplateSchema`: `name`, `subject`, `body` required
- `updateEmailTemplateSchema`: all fields optional

## Error Handling

- Creation throws `Error` on duplicate name; controllers can map to 409 if desired

## Testing

- Mock model calls to isolate service logic
- Consider adding tests for: duplicate name, id vs name lookup, and update partials

## Extending

- Add preview/render endpoint to process placeholders
- Version templates instead of in-place edits
- Add `description`/`category` fields to schema and validators
