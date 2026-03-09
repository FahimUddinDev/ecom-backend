# Coupon Module API Documentation

API for managing and tracking discount coupons.

**Base URL**: `/api/coupon`

---

## 1. Get All Coupons

List available coupons.

- **URL**: `/`
- **Method**: `GET`
- **Auth Required**: No
- **Query Params**:
  - `search`: Search by coupon code.
  - `sellerId`: Filter by seller.
  - `startDate[from]`, `startDate[to]`: Date range filters.

### curl Example

```bash
curl -X GET "http://localhost:5000/api/coupon?search=SUMMER"
```

---

## 2. Create Coupon

Create a new discount code. Only admins and sellers can create coupons.

- **URL**: `/`
- **Method**: `POST`
- **Auth Required**: Yes (Seller/Admin)
- **Request Body**:

```json
{
  "code": "WELCOME20",
  "referralCode": "REF-ABC",
  "description": "20% off for new users",
  "discountType": "PERCENTAGE",
  "discountValue": 20,
  "usageLimit": 100,
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-12-31T23:59:59Z",
  "productIds": [1, 2]
}
```

### curl Example

```bash
curl -X POST http://localhost:5000/api/coupon \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "WELCOME20",
    "discountType": "PERCENTAGE",
    "discountValue": 20,
    "usageLimit": 100,
    "startDate": "2024-01-01T00:00:00Z"
  }'
```

---

## 3. Update Coupon

Modify an existing coupon.

- **URL**: `/:id`
- **Method**: `PUT`
- **Auth Required**: Yes (Seller/Admin)

### curl Example

```bash
curl -X PUT http://localhost:5000/api/coupon/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"usageLimit": 200}'
```

---

## 4. Delete Coupon

Remove a coupon.

- **URL**: `/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes (Seller/Admin)

### curl Example

```bash
curl -X DELETE http://localhost:5000/api/coupon/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```
