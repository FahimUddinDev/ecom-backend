# Verification Module

Handle user verification codes and KYC document submissions.

Base path: `/api/verification`

## Routes

### PUT `/api/verification/`
- **Purpose**: Verify code for account verification
- **Body**:
```json
{ "userId": 1, "code": "123456" }
```
- **Response**: "Verification successful"
- **Errors**:
  - 400: Invalid verification code (format)
  - 400: Invalid verification code / expired

### POST `/api/verification/`
- **Purpose**: Create/send a new verification code
- **Validation**: `VerificationSchema`
- **Body**:
```json
{ "userId": 1 }
```
- **Response**: "Verification sent successfully"

### POST `/api/verification/forgot-password`
- **Purpose**: Verify code and return a short-lived JWT to allow password reset
- **Validation**: `VerificationSchema`
- **Body**:
```json
{ "userId": 1, "code": "123456" }
```
- **Response**: `{ "token": "<jwt>" }`

### POST `/api/verification/kyc`
- **Purpose**: Submit KYC document
- **Middlewares**: `authenticate`, `handleUpload({ document: 1 })`, `validate({ body: KycSchema })`
- **Body**:
```json
{ "title": "Passport", "document": "filename.pdf" }
```
- **Response**: Created KYC record
- **Errors**:
  - 400: KYC already exists / in process / approved

### GET `/api/verification/kyc`
- **Purpose**: List all KYC submissions (admin only)
- **Middlewares**: `authenticate`
- **Query**: `page`, `limit`, `search`, `status`, `createdAt`, `orderBy`

### GET `/api/verification/kyc/:id`
- **Purpose**: Get a user's KYC (admin or the user themself)
- **Middlewares**: `authenticate`

## Validation
- `VerificationSchema`: requires `userId`
- `KycSchema`: requires `title` and `document` with extension in `[pdf, jpg, jpeg, png]`

## Notes
- Verification codes expire after 15 minutes
- The forgot-password token expires in 1 hour
