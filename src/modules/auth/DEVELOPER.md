# Auth Module – Developer Guide

This document explains how the auth module is structured, how it works internally, how to run and test it locally, and how to extend it safely.

## Architecture Overview

- `auth.routes.ts`: Declares routes and wires middlewares
- `auth.controller.ts`: Thin request handlers; extracts inputs, calls services, shapes responses
- `auth.service.ts`: Core business logic (hashing, JWT, Google verification, new-user bootstrap)
- `auth.model.ts`: Data access via Prisma Client (users and email templates)
- `auth.validator.ts`: Yup schema for login inputs

Supporting pieces used by this module:

- `middlewares/auth.middleware.ts`: `authenticate` parses and verifies JWT, sets `req.user`
- `middlewares/validate.middleware.ts`: schema-driven request validation
- `utils/customError.ts`: Standard HttpError class used for flow control
- `utils/sendMail.ts`: Sends templated emails
- `config/prisma.ts`: Prisma client instance (guarded during tests)

## Route Definitions

Base: `/api/auth`

- `POST /` → `loginController`
  - Validates input → calls `loginUser`
- `POST /google` → `googleLoginController`
  - Verifies Google ID token → calls `googleLoginUser`
- `POST /reset` → `resetPassword`
  - Protected by `authenticate` → calls `resetPassword(id, newPassword)`

See `README.md` for consumer-facing details.

## Service Responsibilities

- `loginUser({ email, password, isRemember })`

  - Fetch user by email via model
  - Guard: status must be `active` and `verified === true`
  - Compare password with `bcrypt`
  - Issue JWT (1h default; 7d when `isRemember`)

- `verifyGoogleToken(token)`

  - Uses `google-auth-library` `OAuth2Client.verifyIdToken`
  - Returns Google payload (email, names, picture)

- `googleLoginUser(payload)`

  - Guard payload (must include `email` and `given_name`)
  - If existing user and not active → 403
  - If new user, generate a password, hash, create user, mark verified, send password email if `newPassword` template exists
  - Issue JWT (1h)

- `resetPassword(id, newPassword)`
  - Hash and update password in DB

## Model Layer

- `findUser(email)` → selected fields (+ `kyc.status`)
- `createUser(data)` → create user
- `findEmailTemplate({ where })` → fetch mail template by name or id
- `resetPassword(id, password)` → update password only

Notes:

- Prisma select statements restrict returned fields to what services require.
- During tests, `config/prisma.ts` exports a stub to avoid loading the native query engine.

## Error Handling

- Use `HttpError(message, statusCode)` to communicate expected errors from services/controllers
- Controllers pass errors to `next(error)` to be handled by the global error middleware

## Security Considerations

- JWT payload uses `data: { id, email, role }` and the `exp` claim
- `JWT_SECRET` is required in production
- Google login validates the token audience with `GOOGLE_CLIENT_ID`
- New users from Google are created `verified: true` with `status: active`

## Testing & Mocking

Key unit tests live in `src/modules/auth/auth.test.ts`.

- Prisma Guard (global):
  - `src/config/prisma.ts` avoids instantiation in test env (`NODE_ENV==='test'` or `JEST_WORKER_ID` present)
- Mocks:
  - `bcrypt`: mocked via factory to avoid native bindings
  - `google-auth-library`: `OAuth2Client` mocked; `verifyIdToken` returns an object exposing `getPayload()`
  - `jsonwebtoken`: `sign` mocked to return a deterministic token
  - `auth.model.ts`: mocked to isolate service logic
  - `sendMail`: mocked to avoid sending real emails

Run tests:

```bash
npm test
```

## Local Development

- Environment:

  - `JWT_SECRET` – JWT signing secret
  - `GOOGLE_CLIENT_ID` – Google OAuth client id for token verification
  - Database – configure Prisma datasource in `prisma/schema.prisma`

- Common commands:

```bash
# Install
npm install

# Generate Prisma client
npx prisma generate

# Run dev (depends on your server entrypoint)
npm run dev
```

## Extending the Module

- Adding a new auth flow (e.g., refresh token):

  1. Add a route in `auth.routes.ts`
  2. Implement controller that validates inputs
  3. Add service logic with clear guards and error paths
  4. Extend model if new queries/mutations are needed
  5. Write unit tests with proper mocks

- Changing JWT structure or lifetime:

  - Update `auth.service.ts` where `jwt.sign` is called
  - Update `auth.middleware.ts` if claims parsing changes
  - Adjust tests in `auth.test.ts`

- Email templates:
  - `findEmailTemplate` is currently used for `newPassword` on Google sign-up
  - Add new template names and rendering logic to `sendMail.ts` as needed

## Gotchas

- When mocking `google-auth-library`, ensure `verifyIdToken` resolves with `{ getPayload: () => payload }` to avoid `getPayload` undefined errors
- Keep `bcrypt` mocked as a factory to avoid native binding load failures in CI/Windows
- If you re-enable real Prisma client in tests, provide a test database and run `prisma generate`

## File Map

```
src/modules/auth/
  auth.routes.ts       # Express routes
  auth.controller.ts   # Request handlers
  auth.service.ts      # Business logic for login + Google + reset
  auth.model.ts        # Prisma data access
  auth.validator.ts    # Yup schema
  README.md            # Consumer-focused API docs
  DEVELOPER.md         # This document
```
