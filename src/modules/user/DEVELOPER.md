# User Module – Developer Guide

## Components

- `user.routes.ts`: Routes with upload + validation + auth on protected ops
- `user.controller.ts`: Thin handlers
- `user.service.ts`: Business logic (hashing, filtering, file cleanup)
- `user.model.ts`: Prisma access (select optimized fields, kyc select)
- `user.validator.ts`: Yup schemas

## Service Details

- `registerUser`:
  - Lowercases names, hashes password, sets status based on role
  - Normalizes avatar path to `/public/<file>` if provided
- `getAllUsers`:
  - Optional filters: search/role/status/verified/kyc/date range
  - Paginates and returns `{ total, page, limit, users }`
- `getUser`:
  - Accepts `{ id }` or `{ email }`, returns selected fields + `kyc.status`
- `updateUser`:
  - Hashes password if present
  - Deletes prior avatar file from `/uploads` when new avatar provided
- `deleteUser`:
  - Guards: users/sellers can delete only themselves; admin can delete any

## File Handling

- Uses Node `fs` to remove old avatar when updating
- Files stored in `uploads/`, public path `/public/<filename>`

## Security

- Authenticate for update/delete
- Hash passwords with `bcrypt`
- Limit role updates to allowed values via validator

## Testing

- Mock `bcrypt`, `fs`, and model functions
- Validate filter construction (search + date range)
- Ensure deleteUser guard throws for self vs others

## Extending

- Add soft-delete by setting `status: disabled` instead of deletion
- Add email confirmation flow to set `verified: true`
- Move file deletion to a background job for reliability
