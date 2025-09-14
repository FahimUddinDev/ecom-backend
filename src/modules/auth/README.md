# Auth Module

A lightweight authentication module providing email/password login, Google OAuth login, and password reset.

## Routes

Base path: `/api/auth`

### POST `/api/auth/`

- **Purpose**: Email/password login
- **Middleware**: `validate({ body: loginSchema })`
- **Request body**:

```json
{
  "email": "user@example.com",
  "password": "string (min 6)",
  "isRemember": true
}
```

- **Response**:

```json
{
  "token": "<jwt>",
  "id": 1,
  "firstName": "john",
  "lastName": "doe",
  "email": "user@example.com",
  "createdAt": "2025-07-21T10:00:00.000Z",
  "role": "user",
  "avatar": "/public/avatar.png" | null,
  "kyc": { "status": "false" | "pending" | "approved" }
}
```

- **Errors**:
  - 404: Email or password is wrong!
  - 403: Your are not eligible.
  - 403: Your account is not verified.
  - 401: Email or password is wrong!

### POST `/api/auth/google`

- **Purpose**: Sign-in with Google ID token
- **Request body**:

```json
{
  "token": "<google-id-token>"
}
```

- **Behavior**:
  - Verifies token via Google, extracts payload
  - If user exists and is suspended (`status !== "active"`): 403
  - If user doesn’t exist: creates a verified user with a generated password and emails the password using the `newPassword` template if present
- **Response**: Same shape as email/password login
- **Errors**:
  - 401: Invalid Google token
  - 400: Invalid payload!
  - 403: Your account has been suspended.

### POST `/api/auth/reset`

- **Purpose**: Reset the authenticated user’s password
- **Middleware**: `authenticate`
- **Request body**:

```json
{
  "newPassword": "string (min 6)"
}
```

- **Response**:

```json
{ "message": "Password reset successfully" }
```

- **Errors**:
  - 400: User ID and new password are required

## Validation

- `loginSchema` (Yup): validates email, password, optional `isRemember`
- `validate.middleware` applies the schema to requests

## Services Overview

- `loginUser({ email, password, isRemember })`: Validates, compares password with `bcrypt`, returns JWT and user info
- `verifyGoogleToken(token)`: Uses `google-auth-library` `OAuth2Client.verifyIdToken`
- `googleLoginUser(payload)`: Finds or creates user; sends password email if created
- `resetPassword(id, newPassword)`: Hashes with `bcrypt` and updates

## Models

- `auth.model.ts` uses Prisma to:
  - `findUser(email)` select user + `kyc.status`
  - `createUser(data)`
  - `findEmailTemplate({ where })`
  - `resetPassword(id, password)`

## Middleware

- `authenticate`: attaches `req.user.data.id` for protected routes
- `validate`: schema-based request validation

## Environment

- `JWT_SECRET`: secret for signing JWTs
- `GOOGLE_CLIENT_ID`: Google OAuth2 Client ID used as verify audience

## Email

- On Google sign-up, if email template `newPassword` exists, the module sends a generated password via `sendPasswordMail`.

## Examples

### cURL: Email/Password Login

```bash
curl -X POST http://localhost:5000/api/auth/ \
  -H "Content-Type: application/json" \
  -d '{
    "email":"user@example.com",
    "password":"secret123",
    "isRemember":true
  }'
```

### cURL: Google Login

```bash
curl -X POST http://localhost:5000/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{ "token": "<google-id-token>" }'
```

### cURL: Reset Password

```bash
curl -X POST http://localhost:5000/api/auth/reset \
  -H "Authorization: Bearer <jwt>" \
  -H "Content-Type: application/json" \
  -d '{ "newPassword": "new-secret" }'
```

## Notes

- Avatar paths are normalized to `/public/<file>` unless an absolute URL is provided.
- `isRemember` extends token lifetime to 7 days; otherwise 1 hour.
