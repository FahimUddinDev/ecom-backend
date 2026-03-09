# Category Module API Documentation

API for managing product categories. Only admins can modify categories.

**Base URL**: `/api/category`

---

## 1. Get All Categories

Retrieve all categories with their full hierarchy (SubCategories and ChildCategories).

- **URL**: `/`
- **Method**: `GET`
- **Auth Required**: No

### curl Example

```bash
curl -X GET http://localhost:5000/api/category
```

---

## 2. Create Category

Create a new category. Requires a thumbnail file upload.

- **URL**: `/`
- **Method**: `POST`
- **Auth Required**: Yes (Admin)
- **Content-Type**: `multipart/form-data`

### Form Data

- `name`: "Electronics"
- `thumbnail`: file

### curl Example

```bash
curl -X POST http://localhost:5000/api/category \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -F "name=Electronics" \
  -F "thumbnail=@/path/to/image.jpg"
```

---

## 3. Get Single Category

Retrieve a specific category by its ID or name.

- **URL**: `/:id_or_name`
- **Method**: `GET`
- **Auth Required**: No

### curl Example

```bash
curl -X GET http://localhost:5000/api/category/electronics
```

---

## 4. Update Category

Update an existing category's name or thumbnail.

- **URL**: `/:id`
- **Method**: `PUT`
- **Auth Required**: Yes (Admin)
- **Content-Type**: `multipart/form-data`

### curl Example

```bash
curl -X PUT http://localhost:5000/api/category/1 \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -F "name=Computers" \
  -F "thumbnail=@/path/to/new_image.jpg"
```

---

## 5. Delete Category

Permanently remove a category. Fails if the category has subcategories or products.

- **URL**: `/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes (Admin)

### curl Example

```bash
curl -X DELETE http://localhost:5000/api/category/1 \
  -H "Authorization: Bearer ADMIN_TOKEN"
```
