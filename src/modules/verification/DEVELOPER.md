# Verification Module – Developer Guide

## Components
- `verification.routes.ts`: Endpoints for verification code flows and KYC
- `verification.controller.ts`: Authorization checks and responses
- `verification.service.ts`: Business logic (codes, expirations, KYC rules)
- `verification.model.ts`: Prisma access (create/get/delete verification, KYC CRUD)
- `verification.validator.ts`: Yup schemas for inputs

## Flows
- Create code: generate 6-digit token, ttl 15 minutes, stored via model
- Verify code: fetch latest, compare, check expiry, mark user `verified: true`, delete token
- Forgot-password verify: same checks → returns short-lived JWT `{ data: { id } }`
- KYC create: reject if any existing KYC with `pending|approved`; else create entry
- KYC list: filter by search/status/date; admin-only
- KYC get by user: admin or self only

## Guards & Errors
- Uses `HttpError` with appropriate status codes
- Controllers do simple shape validation and role checks (`admin` for listing)

## Testing
- Mock `verification.model` and `jsonwebtoken` for deterministic outputs
- Edge cases: invalid code, expired code, duplicate KYC, role permissions

## Extending
- Add rate limiting for code creation
- Add resend code with cooldown
- Add KYC status transitions (approve/reject) with audit logs
- Add storage integration (S3) for KYC documents
