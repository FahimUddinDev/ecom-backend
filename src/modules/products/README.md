# Products Module API Documentation

API for browsing and managing the product catalog.

**Base URL**: `/api/products`

---

## 1. Get Products

Retrieve a list of products with advanced filtering and pagination.

- **URL**: `/`
- **Method**: `GET`
- **Auth Required**: No
- **Query Params**:
  - `search`: Search by name/tags.
  - `category`, `subCategory`, `childCategory`: Filter by category IDs.
  - `priceRange[min]`, `priceRange[max]`: Filter by price.
  - `inStock`: Set to `true` to hide out-of-stock items.
  - `sortBy`: e.g., `price,createdAt`.
  - `orderBy`: `asc` or `desc`.

### curl Example

```bash
curl -X GET "http://localhost:5000/api/products?search=shoes&inStock=true&priceRange[max]=1000"
```

---

## 2. Create Product

Create a new product. Requires a thumbnail and optional gallery images.

- **URL**: `/`
- **Method**: `POST`
- **Auth Required**: Yes (Seller/Admin)
- **Content-Type**: `multipart/form-data`

### Form Data

- `name`: "Gaming Laptop"
- `price`: 1500.00
- `stockQuantity`: 10
- `categoryId`: 1
- `subCategoryId`: 5
- `childCategoryId`: 20
- `thumbnail`: file
- `images`: files (up to 10)
- `tags`: ["tech", "gaming"] (array)

### curl Example

```bash
curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "name=Gaming Laptop" \
  -F "price=1500" \
  -F "stockQuantity=10" \
  -F "categoryId=1" \
  -F "subCategoryId=5" \
  -F "childCategoryId=20" \
  -F "thumbnail=@/path/to/laptop.jpg"
```

---

## 3. Update Product

Update product details or manage images.

- **URL**: `/:id`
- **Method**: `PUT`
- **Auth Required**: Yes (Seller/Admin)

### Image Removal

To remove specific gallery images, pass an `imagesToRemove` array containing the image URLs to be deleted.

### curl Example

```bash
curl -X PUT http://localhost:5000/api/products/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "price=1400" \
  -F "imagesToRemove[]=/public/old_img.jpg"
```

---

## 4. Delete Product

Remove a product.

- **URL**: `/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes (Seller/Admin)

### curl Example

```bash
curl -X DELETE http://localhost:5000/api/products/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```
