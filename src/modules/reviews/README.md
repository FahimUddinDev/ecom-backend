# Review Module API Documentation

API for submitting and managing product reviews.

**Base URL**: `/api/review`

---

## 1. Get All Reviews

Retrieve reviews.

- **URL**: `/`
- **Method**: `GET`
- **Auth Required**: No
- **Query Params**:
  - `productId`: Filter by product.
  - `userId`: Filter by user.
  - `page`, `limit`: Pagination.

### curl Example

```bash
curl -X GET "http://localhost:5000/api/review?productId=1"
```

---

## 2. Create Review

Submit a review for a purchased product.

- **URL**: `/`
- **Method**: `POST`
- **Auth Required**: Yes (Bearer Token)
- **Content-Type**: `multipart/form-data`

### Request Body

- `productId`: 1
- `orderId`: 50
- `orderItemId`: 120
- `rating`: 5
- `comment`: "Excellent quality!"
- `images`: files (up to 10)

### curl Example

```bash
curl -X POST http://localhost:5000/api/review \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "productId=1" \
  -F "orderId=50" \
  -F "orderItemId=120" \
  -F "rating=5" \
  -F "comment=Excellent quality!" \
  -F "images=@/path/to/review_photo.jpg"
```

---

## 3. Update Review

Update your rating or comment.

- **URL**: `/:id`
- **Method**: `PATCH`
- **Auth Required**: Yes (Bearer Token)

### curl Example

```bash
curl -X PATCH http://localhost:5000/api/review/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "rating=4" \
  -F "comment=Actually, it's pretty good (4 stars)."
```

---

## 4. Delete Review

Remove your review.

- **URL**: `/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes (Bearer Token)

### curl Example

```bash
curl -X DELETE http://localhost:5000/api/review/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```
