# SMTP Module – Developer Guide

## Components

- `smtp.routes.ts`: CRUD routes with validation
- `smtp.controller.ts`: Request handlers
- `smtp.service.ts`: Small service layer calling model
- `smtp.model.ts`: Prisma access (create, update, delete, list)
- `smtp.validator.ts`: Yup schemas

## Behavior

- Straightforward CRUD against Prisma model
- No authorization in routes by default; consider adding `authenticate` + role checks

## Validation

- `createSmtpSchema` and `updateSmtpSchema` guard inputs

## Security

- Do not log passwords
- Consider at-rest encryption for password, or use a secrets manager
- Limit read access to admins

## Testing

- Mock `smtp.model` to isolate service logic
- Add tests for validation failures and happy paths

## Extending

- Add endpoint to send a test email using a config
- Add `isDefault` flag; enforce single-default invariant in service layer
