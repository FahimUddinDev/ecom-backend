# SMTP Module

Manage SMTP configurations used for outbound email.

Base path: `/api/smtp`

## Routes

### GET `/api/smtp/`

- **Purpose**: List SMTP configurations

### POST `/api/smtp/`

- **Purpose**: Create SMTP configuration
- **Validation**: `createSmtpSchema`
- **Body**:

```json
{
  "host": "smtp.example.com",
  "password": "secret",
  "encryption": "ssl|tls|starttls",
  "port": 465,
  "userName": "mailer@example.com"
}
```

### GET `/api/smtp/:id`

- **Purpose**: Get SMTP config by id

### PUT `/api/smtp/:id`

- **Purpose**: Update SMTP config
- **Validation**: `updateSmtpSchema`

### DELETE `/api/smtp/:id`

- **Purpose**: Delete SMTP config by id
- **Response**: 204 No Content

## Validation

- `createSmtpSchema`: requires host, password (min 6), encryption, port, userName
- `updateSmtpSchema`: partial updates allowed

## Notes

- Store secrets securely; avoid logging credentials.
