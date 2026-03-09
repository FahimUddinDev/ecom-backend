# AdditionalInfo API Documentation

API for managing product specifications and metadata.

**Base URL**: `/api/products/additional-info`

---

## 1. Create Info

Add a specification to a product.

- **URL**: `/`
- **Method**: `POST`
- **Auth Required**: Yes (Seller/Admin)
- **Request Body**:

```json
{
  "productId": 1,
  "title": "Material",
  "description": "100% Organic Cotton"
}
```

---

## 2. Update Info

Modify an existing specification.

- **URL**: `/:id`
- **Method**: `PUT`
- **Auth Required**: Yes (Seller/Admin)

---

## 3. Delete Info

Remove a specification.

- **URL**: `/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes (Seller/Admin)
