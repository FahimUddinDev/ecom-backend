# Offer Module API Documentation

API for managing product-level offers and discounts.

**Base URL**: `/api/offer`

---

## 1. Get All Offers

Retrieve all offers.

- **URL**: `/`
- **Method**: `GET`
- **Auth Required**: No
- **Query Params**:
  - `search`: Search by name.
  - `sellerId`: Filter by seller.
  - `startDate[from]`, `startDate[to]`: Date range.

### curl Example

```bash
curl -X GET "http://localhost:5000/api/offer?search=BlackFriday"
```

---

## 2. Create Offer

Create a new promotion.

- **URL**: `/`
- **Method**: `POST`
- **Auth Required**: Yes (Seller/Admin)
- **Request Body**:

```json
{
  "name": "Summer Sale",
  "offerType": "PRODUCT_OFFER",
  "discountType": "PERCENTAGE",
  "discountValue": 15,
  "startDate": "2024-06-01T00:00:00Z",
  "endDate": "2024-08-31T23:59:59Z",
  "productIds": [1, 2, 3]
}
```

### curl Example

```bash
curl -X POST http://localhost:5000/api/offer \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Summer Sale",
    "offerType": "PRODUCT_OFFER",
    "discountType": "PERCENTAGE",
    "discountValue": 15,
    "startDate": "2024-06-01T00:00:00Z"
  }'
```

---

## 3. Link Offer to Product

Manually link an offer to a product or variant.

- **URL**: `/on-product`
- **Method**: `POST`
- **Auth Required**: Yes (Seller/Admin)

### Request Body

```json
{
  "offerId": 1,
  "productId": 5,
  "variantId": 10
}
```

### curl Example

```bash
curl -X POST http://localhost:5000/api/offer/on-product \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"offerId": 1, "productId": 5}'
```

---

## 4. Delete Offer

Remove an offer.

- **URL**: `/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes (Seller/Admin)

### curl Example

```bash
curl -X DELETE http://localhost:5000/api/offer/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```
