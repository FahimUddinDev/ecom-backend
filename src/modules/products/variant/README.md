# Variant API Documentation

API for managing product variations (Size, Color, etc.).

**Base URL**: `/api/products/variant`

---

## 1. Create Variant

Create a variation with its own price and stock.

- **URL**: `/`
- **Method**: `POST`
- **Auth Required**: Yes (Seller/Admin)
- **Content-Type**: `multipart/form-data`

### Form Data

- `productId`: 1
- `name`: "XL Black"
- `price`: 55.00
- `stockQuantity`: 25
- `thumbnail`: file
- `images`: files

---

## 2. Update Variant

Update price, stock, or images for a variant.

- **URL**: `/:id`
- **Method**: `PUT`
- **Auth Required**: Yes (Seller/Admin)

---

## 3. Delete Variant

Remove a variant.

- **URL**: `/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes (Seller/Admin)
