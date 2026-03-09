# Cart Module API Documentation

API for managing user shopping carts.

**Base URL**: `/api/cart`

---

## 1. Get Cart Items

Retrieve a list of cart items.

- **URL**: `/`
- **Method**: `GET`
- **Auth Required**: No
- **Query Params**:
  - `page` (default: 1)
  - `limit` (default: 10)
  - `userId` (optional): Filter by User ID.
  - `productId` (optional): Filter by Product ID.

### curl Example

```bash
curl -X GET "http://localhost:5000/api/cart?userId=1"
```

---

## 2. Add to Cart

Add a single product variant to the cart. If the item already exists, the quantity is increased.

- **URL**: `/`
- **Method**: `POST`
- **Auth Required**: Yes (Bearer Token)

### Request Body

```json
{
  "productId": 1,
  "variantId": 10,
  "quantity": 2
}
```

### curl Example

```bash
curl -X POST http://localhost:5000/api/cart \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId": 1, "variantId": 10, "quantity": 2}'
```

---

## 3. Bulk Add to Cart

Add multiple items to the cart at once.

- **URL**: `/bulk`
- **Method**: `POST`
- **Auth Required**: Yes (Bearer Token)

### Request Body

```json
{
  "items": [
    { "productId": 1, "variantId": 10, "quantity": 1 },
    { "productId": 2, "quantity": 5 }
  ]
}
```

### curl Example

```bash
curl -X POST http://localhost:5000/api/cart/bulk \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"items": [{"productId": 1, "variantId": 10, "quantity": 1}, {"productId": 2, "quantity": 5}]}'
```

---

## 4. Bulk Delete Cart Items

Remove multiple cart items by their IDs.

- **URL**: `/bulk`
- **Method**: `DELETE`
- **Auth Required**: Yes (Bearer Token)

### Request Body

```json
{
  "ids": [101, 102, 103]
}
```

### curl Example

```bash
curl -X DELETE http://localhost:5000/api/cart/bulk \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ids": [101, 102, 103]}'
```

---

## 5. Clear Cart

Remove all items from the authenticated user's cart.

- **URL**: `/clear`
- **Method**: `DELETE`
- **Auth Required**: Yes (Bearer Token)

### curl Example

```bash
curl -X DELETE http://localhost:5000/api/cart/clear \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 6. Update Cart Item

Update the quantity of a specific item in the cart.

- **URL**: `/:id`
- **Method**: `PATCH`
- **Auth Required**: Yes (Bearer Token)

### Request Body

```json
{
  "quantity": 5
}
```

### curl Example

```bash
curl -X PATCH http://localhost:5000/api/cart/101 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"quantity": 5}'
```

---

## 7. Delete Cart Item

Remove a specific item from the cart.

- **URL**: `/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes (Bearer Token)

### curl Example

```bash
curl -X DELETE http://localhost:5000/api/cart/101 \
  -H "Authorization: Bearer YOUR_TOKEN"
```
