# Wishlist Module API Documentation

API for managing your personal product wishlist.

**Base URL**: `/api/wishlist`

---

## 1. Get Wishlist

Retrieve all products you have saved.

- **URL**: `/`
- **Method**: `GET`
- **Auth Required**: Yes

### curl Example

```bash
curl -X GET http://localhost:5000/api/wishlist \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 2. Add to Wishlist

Save a product to your wishlist.

- **URL**: `/`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:

```json
{
  "productId": 1
}
```

### curl Example

```bash
curl -X POST http://localhost:5000/api/wishlist \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId": 1}'
```

---

## 3. Delete from Wishlist

Remove an item from your wishlist using its wishlist entry ID.

- **URL**: `/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes

### curl Example

```bash
curl -X DELETE http://localhost:5000/api/wishlist/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```
