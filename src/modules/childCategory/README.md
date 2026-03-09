# ChildCategory Module API Documentation

API for managing granular child-level categories. Only admins can modify child-categories.

**Base URL**: `/api/childCategory`

---

## 1. Get All ChildCategories

Retrieve child categories. Useful for deep navigation within a sub-category.

- **URL**: `/`
- **Method**: `GET`
- **Auth Required**: No
- **Query Params**:
  - `subCategoryId`: (Optional) ID of the parent sub-category.

### curl Example

```bash
curl -X GET "http://localhost:5000/api/childCategory?subCategoryId=1"
```

---

## 2. Create ChildCategory

Create a new child category under a specific sub-category.

- **URL**: `/`
- **Method**: `POST`
- **Auth Required**: Yes (Admin)
- **Content-Type**: `multipart/form-data`

### Form Data

- `subCategoryId`: 1
- `name`: "iOS Phones"
- `thumbnail`: file

### curl Example

```bash
curl -X POST http://localhost:5000/api/childCategory \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -F "subCategoryId=1" \
  -F "name=iOS Phones" \
  -F "thumbnail=@/path/to/ios_icon.png"
```

---

## 3. Get Single ChildCategory

Retrieve a specific child category by its ID.

- **URL**: `/:id`
- **Method**: `GET`
- **Auth Required**: No

### curl Example

```bash
curl -X GET http://localhost:5000/api/childCategory/1
```

---

## 4. Update ChildCategory

Update an existing child category.

- **URL**: `/:id`
- **Method**: `PUT`
- **Auth Required**: Yes (Admin)
- **Content-Type**: `multipart/form-data`

### curl Example

```bash
curl -X PUT http://localhost:5000/api/childCategory/1 \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -F "name=Apple iPhones" \
  -F "thumbnail=@/path/to/new_ios_icon.png"
```

---

## 5. Delete ChildCategory

Remove a child category. Fails if it contains products.

- **URL**: `/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes (Admin)

### curl Example

```bash
curl -X DELETE http://localhost:5000/api/childCategory/1 \
  -H "Authorization: Bearer ADMIN_TOKEN"
```
