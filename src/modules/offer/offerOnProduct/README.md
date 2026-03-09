# OfferOnProduct API Documentation

API for specifically managing the links between offers and products.

**Base URL**: `/api/offer/on-product`

---

## 1. Get All Mappings

Retrieve all linked offers and products.

- **URL**: `/`
- **Method**: `GET`
- **Auth Required**: No

### curl Example

```bash
curl -X GET http://localhost:5000/api/offer/on-product
```

---

## 2. Link Offer

Link an offer to a product.

- **URL**: `/`
- **Method**: `POST`
- **Auth Required**: Yes (Seller/Admin)

### Request Body

```json
{
  "offerId": 1,
  "productId": 10,
  "variantId": null
}
```

### curl Example

```bash
curl -X POST http://localhost:5000/api/offer/on-product \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"offerId": 1, "productId": 10}'
```

---

## 3. Unlink Offer

Remove an offer link by its mapping ID.

- **URL**: `/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes (Seller/Admin)

### curl Example

```bash
curl -X DELETE http://localhost:5000/api/offer/on-product/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```
