# SubCategory Module API Documentation

API for managing sub-level categories. Only admins can modify sub-categories.

**Base URL**: `/api/subCategory`

---

## 1. Get All SubCategories

Retrieve all sub-categories. You can filter by parent category ID.

- **URL**: `/`
- **Method**: `GET`
- **Auth Required**: No
- **Query Params**:
  - `categoryId`: (Optional) ID of the parent category.

### curl Example

```bash
curl -X GET "http://localhost:5000/api/subCategory?categoryId=1"
```

---

## 2. Create SubCategory

Create a new sub-category under a specific category.

- **URL**: `/`
- **Method**: `POST`
- **Auth Required**: Yes (Admin)
- **Content-Type**: `multipart/form-data`

### Form Data

- `categoryId`: 1
- `name`: "Mobile Phones"
- `thumbnail`: file

### curl Example

```bash
curl -X POST http://localhost:5000/api/subCategory \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -F "categoryId=1" \
  -F "name=Mobile Phones" \
  -F "thumbnail=@/path/to/phone_icon.png"
```

---

## 3. Get Single SubCategory

Retrieve a specific sub-category by its ID.

- **URL**: `/:id`
- **Method**: `GET`
- **Auth Required**: No

### curl Example

```bash
curl -X GET http://localhost:5000/api/subCategory/1
```

---

## 4. Update SubCategory

Update an existing sub-category.

- **URL**: `/:id`
- **Method**: `PUT`
- **Auth Required**: Yes (Admin)
- **Content-Type**: `multipart/form-data`

### curl Example

```bash
curl -X PUT http://localhost:5000/api/subCategory/1 \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -F "name=Smartphones" \
  -F "thumbnail=@/path/to/new_icon.png"
```

---

## 5. Delete SubCategory

Remove a sub-category. Fails if it contains child categories or products.

- **URL**: `/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes (Admin)

### curl Example

```bash
curl -X DELETE http://localhost:5000/api/subCategory/1 \
  -H "Authorization: Bearer ADMIN_TOKEN"
```
