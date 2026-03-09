# Order Module API Documentation

API for placing orders, tracking status, and managing returns.

**Base URL**: `/api/order`

---

## 1. Get Orders

Retrieve list of orders.

- **Users**: Returns personal order history.
- **Sellers**: Returns orders containing their products.

* **URL**: `/`
* **Method**: `GET`
* **Auth Required**: Yes
* **Query Params**: `page`, `limit`

### curl Example

```bash
curl -X GET http://localhost:5000/api/order \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 2. Place Order

Checkout and create a new order. Clears the cart on success.

- **URL**: `/`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:

```json
{
  "deliveryAddressId": 1,
  "pickupAddressId": 2,
  "paymentMethod": "COD",
  "couponCode": "SUMMER50",
  "notes": "Handle with care",
  "items": [
    { "productId": 10, "quantity": 2, "variantId": 5 },
    { "productId": 12, "quantity": 1 }
  ]
}
```

### curl Example

```bash
curl -X POST http://localhost:5000/api/order \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deliveryAddressId": 1,
    "pickupAddressId": 2,
    "paymentMethod": "COD",
    "items": [{ "productId": 10, "quantity": 1 }]
  }'
```

---

## 3. Cancel Order

Cancel a `pending` order.

- **URL**: `/:id/cancel`
- **Method**: `POST`
- **Auth Required**: Yes (Owner)

### curl Example

```bash
curl -X POST http://localhost:5000/api/order/1/cancel \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"reason": "Changed my mind"}'
```

---

## 4. Request Return

Request a return for a specific item in a `delivered` order.

- **URL**: `/:id/return`
- **Method**: `POST`
- **Auth Required**: Yes (Owner)
- **Content-Type**: `multipart/form-data`

### Form Data

- `orderItemId`: 123
- `reason`: "Item damaged"
- `images`: file(s) (up to 10)

### curl Example

```bash
curl -X POST http://localhost:5000/api/order/1/return \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "orderItemId=123" \
  -F "reason=Item damaged" \
  -F "images=@/path/to/damage_photo.jpg"
```

---

## 5. Update Status (Admin/Seller)

Update the status of an order or a specific item.

- **URL**: `/:id` (Order) or `/items/:id/status` (Item)
- **Method**: `PATCH`
- **Auth Required**: Yes (Admin/Seller)

### curl Example (Update Order)

```bash
curl -X PATCH http://localhost:5000/api/order/1 \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "shipped"}'
```

---

## Notes

- **Shipping Fee**: A flat fee of 50 is applied to all orders.
- **Stock**: Real-time stock is decremented on order placement and restored on cancellation or return approval.
