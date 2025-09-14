# User Module

Manage users with CRUD, filtering, and file uploads for avatars.

Base path: `/api/user`

## Routes

### GET `/api/user/`

- **Purpose**: List users with pagination and filters
- **Query params**:
  - `page`, `limit`
  - `search` (matches firstName/lastName/email)
  - `role`, `status`, `verified`, `kyc`
  - `createdAt` (string date) or `{ from, to }`
  - `orderBy` (`asc`|`desc`, default `desc`)
- **Response**:

```json
{
  "total": 123,
  "page": 1,
  "limit": 10,
  "users": [
    {
      "id": 1,
      "firstName": "john",
      "lastName": "doe",
      "email": "john@example.com",
      "createdAt": "...",
      "role": "user",
      "status": "active",
      "verified": true,
      "avatar": "/public/avatar.png",
      "kyc": { "status": "false" | "pending" | "approved" }
    }
  ]
}
```

### POST `/api/user/`

- **Purpose**: Create user
- **Middlewares**: `handleUpload({ avatar: 1 })`, `validate({ body: userRegisterSchema })`
- **Body**: `{ firstName, lastName, email, password, role?, avatar? }`
- **Response**: Created user with `kyc.status: "false"`
- **Errors**: 409 when email exists

### GET `/api/user/:id`

- **Purpose**: Get user by id or email (string)

### PUT `/api/user/:id`

- **Purpose**: Update user
- **Middlewares**: `authenticate`, `handleUpload({ avatar: 1 })`, `validate({ body: userUpdateSchema })`
- **Body**: Partial fields; if `password` provided it will be hashed
- **Notes**: When `avatar` changes, attempts to delete old file from `/uploads`

### DELETE `/api/user/:id`

- **Purpose**: Delete a user
- **Middlewares**: `authenticate`
- **Rules**:
  - Users/sellers can delete only themselves
  - Admin can delete anyone

## Validation

- `userRegisterSchema`: required first/last/email/password; optional role
- `userUpdateSchema`: partial updates, role limited to `user|admin`

## Notes

- Avatar is stored as `/public/<filename>` if uploaded; absolute URLs are preserved by clients
- Passwords hashed with `bcrypt`
