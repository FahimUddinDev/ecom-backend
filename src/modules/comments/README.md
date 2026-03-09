# Comments Module API Documentation

API for product comments and replies.

**Base URL**: `/api/comments`

---

## 1. Get All Comments

Retrieve top-level comments for a product.

- **URL**: `/`
- **Method**: `GET`
- **Auth Required**: No
- **Query Params**:
  - `productId`: Filter by product.
  - `userId`: Filter by user.
  - `page`, `limit`: Pagination controls.

### curl Example

```bash
curl -X GET "http://localhost:5000/api/comments?productId=1"
```

---

## 2. Create Comment

Post a new top-level comment. Can be done anonymously or as a logged-in user.

- **URL**: `/`
- **Method**: `POST`
- **Auth Required**: Optional (Bearer Token)
- **Content-Type**: `multipart/form-data`

### Form Data

- `productId`: 1
- `content`: "Great product!"
- `images`: files (up to 5)

### curl Example

```bash
curl -X POST http://localhost:5000/api/comments \
  -F "productId=1" \
  -F "content=Great product!" \
  -F "images=@/path/to/photo.jpg"
```

---

## 3. Create Reply

Reply to an existing comment.

- **URL**: `/:id/reply`
- **Method**: `POST`
- **Auth Required**: Yes (Bearer Token)
- **Content-Type**: `multipart/form-data`

### curl Example

```bash
curl -X POST http://localhost:5000/api/comments/1/reply \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "content=I agree with this!"
```

---

## 4. Update Comment

Edit your existing comment.

- **URL**: `/:id`
- **Method**: `PATCH`
- **Auth Required**: Yes (Bearer Token)

### curl Example

```bash
curl -X PATCH http://localhost:5000/api/comments/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "content=Updated comment text"
```

---

## 5. Delete Comment

Remove a comment.

- **URL**: `/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes (Bearer Token)

### curl Example

```bash
curl -X DELETE http://localhost:5000/api/comments/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```
