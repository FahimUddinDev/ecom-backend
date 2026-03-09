## Admin Panel - Address Module Requirements

### Pages (page name + what should be on the page)

#### Address List page

- **Page name:** Address List (or Addresses)
- **Purpose:** Browse/search/filter all addresses and perform actions (view/edit/delete).
- **Must include:**
  - Table/grid of addresses with at least: `id`, `userId`, `street`, `city`, `state`, `country`, `postalCode`, `status`
  - Global search input (text) that searches across address fields
  - Filters: user, city, state, country, status (active/inactive)
  - Sorting controls (e.g., by id, city, country)
  - Pagination controls (page, page size)
  - Row actions: view details, edit, delete

#### Address Detail page

- **Page name:** Address Detail
- **Purpose:** Show full address record with all fields.
- **Must include:**
  - Display all returned fields: `id`, `userId`, `street`, `city`, `state`, `country`, `postalCode`, `latitude`, `longitude`, `addressLine`, `status`
  - Action buttons: edit, delete, back to list

#### Address Create / Edit page

- **Page name:** Create Address / Edit Address
- **Purpose:** Create a new address or update an existing one.
- **Must include:**
  - Form fields: `street`, `city`, `state`, `country`, `addressLine`, optional `postalCode`, `latitude`, `longitude`
  - Client-side validation matching API rules (min length, format, latitude/longitude ranges)
  - Submit button and cancel/back button

### 1) API Overview (endpoint summary)

All Address routes live under:

- **Base URL:** `/address`

#### Endpoints

| Method | Path             | Auth    | Purpose                                 |
| ------ | ---------------- | ------- | --------------------------------------- |
| GET    | `/address`       | ❌ none | List addresses (supports query filters) |
| GET    | `/address/:slug` | ❌ none | Get one address by `id`                 |
| POST   | `/address`       | ✅ yes  | Create new address                      |
| PUT    | `/address/:slug` | ✅ yes  | Update existing address                 |
| DELETE | `/address/:slug` | ✅ yes  | Delete address (soft/hard delete logic) |

> **Auth note:** Create/Update/Delete require `authenticate` middleware (logged-in user).

---

### 2) Address Payload Schema (what fields UI must send/expect)

#### Required fields (create/update)

- `street` (string, min 5)
- `city` (string, min 2)
- `state` (string, min 2)
- `country` (string, min 3)
- `addressLine` (string, min 3)

#### Optional fields

- `postalCode` (string; letters/numbers/spaces/hyphens allowed)
- `latitude` (number; -90 → 90)
- `longitude` (number; -180 → 180)

#### Response / Returned fields

- `id`
- `userId`
- `street`
- `city`
- `state`
- `country`
- `postalCode`
- `latitude`
- `longitude`
- `addressLine`

---

### 3) Search + Filtering (current backend support)

#### ✅ Supported filter today

- Filter by user: `GET /address?userId=123`
  - Returns only addresses where `status = true` (active addresses).

#### 🔧 Recommended admin panel filters (needs backend support)

To build a complete admin experience, you can add support for:

- Free-text search across address fields (`search`)
- Filter by `city`, `state`, `country`
- Filter by `status` (active / inactive)
- Pagination (`page`, `limit`)
- Sorting (`sortBy`, `order`)

---

### 4) Admin Panel UI Requirements

#### List view (table/grid)

- Search box (text)
- Filters: user, city, state, country, status
- Sorting (e.g., by `id`, `city`, `country`)
- Pagination (page / limit)

**API call**
`GET /address?userId=...&search=...&city=...&state=...&country=...&status=...&page=...&limit=...`

#### View detail

**API call**
`GET /address/{id}`

#### Create address

**API call**
`POST /address`

Body: `{ street, city, state, country, addressLine, postalCode?, latitude?, longitude? }`

#### Edit address

**API call**
`PUT /address/{id}`

Body: same as create (partial updates allowed)

#### Delete address

**API call**
`DELETE /address/{id}`

**Deletion logic**

- If address is used in any **active** orders → error (cannot delete)
- If address is used in **past orders** → soft delete (`status=false`)
- If address is never used in orders → hard delete

---

### 5) Naming conventions (API / UI)

- Model: `Address`
- API base: `/address`
- Resource ID param: `id` (called `slug` in routes, but it’s numeric)
- Fields: `street`, `city`, `state`, `country`, `addressLine`, `postalCode`, `latitude`, `longitude`, `userId`

---

### 6) Next Step (extend filtering / search)

If you want full “search + all filter types + pagination” support, you can extend the backend to accept query params for `search`, `city`, `state`, `country`, `status`, `page`, `limit`, etc. Let me know and I can provide the exact code changes.

---

## Admin Panel - Auth Module Requirements

### Pages (page name + what should be on the page)

#### Login page

- **Page name:** Login
- **Purpose:** Authenticate an admin (or user) via email/password or Google.
- **Must include:**
  - Email input
  - Password input
  - Remember me checkbox (optional)
  - Submit button
  - Google sign-in button (calls `/auth/google`)
  - Show API error messages (invalid credentials, inactive account, unverified account)

#### Reset Password page

- **Page name:** Reset Password
- **Purpose:** Allow a logged-in user to change their password.
- **Must include:**
  - New password input (min 6 characters)
  - Submit button
  - Success / error feedback

### 1) API Overview (endpoint summary)

All Auth routes live under:

- **Base URL:** `/auth`

#### Endpoints

| Method | Path           | Auth    | Purpose                               |
| ------ | -------------- | ------- | ------------------------------------- |
| POST   | `/auth`        | ❌ none | Login with email/password             |
| POST   | `/auth/google` | ❌ none | Login with Google token               |
| POST   | `/auth/reset`  | ✅ yes  | Reset password for authenticated user |

> **Auth note:** `POST /auth/reset` requires `authenticate` middleware (valid token).

### 2) Auth Payload Schema (what fields UI must send/expect)

#### Login (email/password)

- `email` (string, must be a valid email)
- `password` (string, min 6 characters)
- `isRemember` (boolean, optional)

#### Google login

- `token` (string, Google ID token)

#### Reset password

- `newPassword` (string, min 6 characters)

### 3) Expected API responses

#### Successful login (email/password or Google)

- `token` (JWT)
- `id`
- `firstName`
- `lastName`
- `email`
- `createdAt`
- `role`
- `avatar`
- `kyc` (if present)

#### Reset password

- `{ message: "Password reset successfully" }`

---

### 4) Search + Filter notes (none currently)

The auth module does not expose list endpoints for searching/filtering users; it only provides login and reset endpoints. If you need an admin user list and filtering, the backend must be extended with user management endpoints (e.g. `GET /users`, `PATCH /users/:id`, `DELETE /users/:id`).

---

## Admin Panel - Cart Module Requirements

### Pages (page name + what should be on the page)

#### Cart list page

- **Page name:** Cart (or Cart Items)
- **Purpose:** View and manage cart items per user (admin view can list all cart items for any user).
- **Must include:**
  - Table/grid of cart items with fields: `id`, `userId`, `productId`, `productName` (if available), `variantId`, `quantity`, `createdAt`
  - Filters: user, product, date range (createdAt)
  - Sorting controls (createdAt desc by default, plus quantity, userId)
  - Pagination (page / limit)
  - Row actions: view item details, update quantity, delete
  - Bulk actions: delete selected items

#### Cart item detail page

- **Page name:** Cart Item Detail
- **Purpose:** Show full cart item details and allow updating quantity or deleting.
- **Must include:**
  - Display fields: `id`, `userId`, `productId`, `quantity`, `variantId`, `createdAt`, plus product/variant details if available
  - Update quantity input
  - Delete button
  - Back to list

#### Add to cart / Bulk add page (optional)

- **Page name:** Add to Cart
- **Purpose:** Allow admin to add items to a user’s cart or bulk add multiple items.
- **Must include:**
  - Single add form: `userId`, `productId`, optional `variantId`, `quantity`
  - Bulk add form: list of items with the same fields
  - Submit button

### 1) API Overview (endpoint summary)

All Cart routes live under:

- **Base URL:** `/cart`

#### Endpoints

| Method | Path          | Auth    | Purpose                                       |
| ------ | ------------- | ------- | --------------------------------------------- |
| GET    | `/cart`       | ❌ none | Get cart items (supports filters, pagination) |
| GET    | `/cart/:id`   | ❌ none | Get a single cart item                        |
| POST   | `/cart`       | ✅ yes  | Add item to cart                              |
| POST   | `/cart/bulk`  | ✅ yes  | Add multiple items to cart                    |
| PATCH  | `/cart/:id`   | ✅ yes  | Update cart quantity                          |
| DELETE | `/cart/:id`   | ✅ yes  | Remove a cart item                            |
| DELETE | `/cart/bulk`  | ✅ yes  | Delete multiple cart items by ids             |
| DELETE | `/cart/clear` | ✅ yes  | Clear cart for authenticated user             |

> **Auth note:** All modifying requests require an authenticated user token.

### 2) Cart Payload Schema (what fields UI must send/expect)

#### Add to cart

- `productId` (number, required)
- `variantId` (number, optional)
- `quantity` (number, required, min 1)

#### Bulk add to cart

- `items` (array of objects with the same fields as Add to Cart)

#### Update cart item

- `quantity` (number, required, min 1)

#### Bulk delete

- `ids` (array of cart item ids)

### 3) Filtering / Search (backend-supported)

#### Supported filters (via query params on `GET /cart`)

- `page` (number, optional)
- `limit` (number, optional)
- `userId` (number, optional)
- `productId` (number, optional)

#### Recommended admin panel filters (additional, requires backend changes)

- Text search across product name / user email (requires API support)
- Date range (createdAt)
- Quantity range

### 4) Example API calls (admin UI wiring)

**List cart items (with optional filters/pagination)**
`GET /cart?page=1&limit=25&userId=123&productId=456`

**Get a single cart item**
`GET /cart/{id}`

**Add item to cart**
`POST /cart`

Body:
`{ productId, variantId?, quantity }`

**Bulk add items**
`POST /cart/bulk`

Body:
`{ items: [{ productId, variantId?, quantity }, ...] }`

**Update cart item quantity**
`PATCH /cart/{id}`

Body:
`{ quantity }`

**Delete cart item**
`DELETE /cart/{id}`

**Bulk delete cart items**
`DELETE /cart/bulk`

Body:
`{ ids: [123, 456] }`

**Clear cart for the authenticated user**
`DELETE /cart/clear`

---

## Admin Panel - Category Module Requirements

### Pages (page name + what should be on the page)

#### Category list page

- **Page name:** Categories
- **Purpose:** Manage categories (view, create, edit, delete) with thumbnail support.
- **Must include:**
  - Table/grid of categories with at least: `id`, `name`, `thumbnail`, number of `subCategories` (if available)
  - Search box (text search by name)
  - Filters (if added in backend): status/active, has thumbnail
  - Sorting (name, createdAt)
  - Pagination (page / limit)
  - Row actions: view, edit, delete

#### Category detail page

- **Page name:** Category Detail
- **Purpose:** Show category detail and nested subcategories.
- **Must include:**
  - Display fields: `id`, `name`, `thumbnail`
  - Subcategories + child categories list (from response)
  - Edit button, delete button, back to list

#### Create / Edit category page

- **Page name:** Create Category / Edit Category
- **Purpose:** Create or update a category and upload a thumbnail.
- **Must include:**
  - Form fields: `name`, `thumbnail` (file upload)
  - Client-side validation: name required (min length 3)
  - Submit + cancel/back buttons

### 1) API Overview (endpoint summary)

All Category routes live under:

- **Base URL:** `/categories`

#### Endpoints

| Method | Path                | Auth    | Purpose                                          |
| ------ | ------------------- | ------- | ------------------------------------------------ |
| GET    | `/categories`       | ❌ none | List all categories (incl. nested subcategories) |
| GET    | `/categories/:slug` | ❌ none | Get category by id or name                       |
| POST   | `/categories`       | ✅ yes  | Create new category                              |
| PUT    | `/categories/:slug` | ✅ yes  | Update category (admin only)                     |
| DELETE | `/categories/:slug` | ✅ yes  | Delete category (admin only, checks refs)        |

> **Auth note:** Create/Update/Delete require `authenticate` middleware (admin role enforced in service).

### 2) Category Payload Schema (what fields UI must send/expect)

#### Create / Update category

- `name` (string, required, min 3)
- `thumbnail` (string, optional; will be uploaded via multipart/form-data)

### 3) Filtering / Search (current backend support)

#### Supported today

- List all categories: `GET /categories` (no filter params)
- Get by id or name: `GET /categories/:slug` (`slug` is numeric id or category name)

#### Recommended admin panel filters (requires backend changes)

- Search by name (query param `search`)
- Active/inactive status filter (if status field is added)
- Pagination (`page`, `limit`)
- Sorting (name, createdAt)

### 4) Example API calls (admin UI wiring)

**List categories**
`GET /categories`

**Get a single category**
`GET /categories/{idOrName}`

**Create category**
`POST /categories`

Body (multipart/form-data):

- `name`
- `thumbnail` (file)

**Update category**
`PUT /categories/{id}`

Body (multipart/form-data):

- `name`
- `thumbnail` (file)

**Delete category**
`DELETE /categories/{id}`

---

## Admin Panel - SubCategory Module Requirements

### Pages (page name + what should be on the page)

#### SubCategory list page

- **Page name:** SubCategories
- **Purpose:** Manage subcategories (view/create/edit/delete) under a parent category.
- **Must include:**
  - Table/grid of subcategories with fields: `id`, `name`, `categoryId`, `thumbnail`, number of `childCategories` (if available)
  - Search box (text search by name)
  - Filters: categoryId (parent), has thumbnail
  - Sorting (name, createdAt)
  - Pagination (page / limit)
  - Row actions: view, edit, delete

#### SubCategory detail page

- **Page name:** SubCategory Detail
- **Purpose:** Show subcategory detail and nested child categories.
- **Must include:**
  - Display fields: `id`, `name`, `thumbnail`, `categoryId`
  - Child categories list (from response)
  - Edit button, delete button, back to list

#### Create / Edit subcategory page

- **Page name:** Create SubCategory / Edit SubCategory
- **Purpose:** Create or update a subcategory and upload a thumbnail.
- **Must include:**
  - Form fields: `name`, `categoryId`, `thumbnail` (file upload)
  - Client-side validation: name required (min length 3), categoryId required
  - Submit + cancel/back buttons

### 1) API Overview (endpoint summary)

All SubCategory routes live under:

- **Base URL:** `/sub-categories`

#### Endpoints

| Method | Path                    | Auth    | Purpose                                           |
| ------ | ----------------------- | ------- | ------------------------------------------------- |
| GET    | `/sub-categories`       | ❌ none | List all subcategories (supports category filter) |
| GET    | `/sub-categories/:slug` | ❌ none | Get subcategory by id                             |
| POST   | `/sub-categories`       | ✅ yes  | Create new subcategory                            |
| PUT    | `/sub-categories/:slug` | ✅ yes  | Update subcategory (admin only)                   |
| DELETE | `/sub-categories/:slug` | ✅ yes  | Delete subcategory (admin only)                   |

> **Auth note:** Create/Update/Delete require `authenticate` middleware (admin role enforced in service).

### 2) SubCategory Payload Schema (what fields UI must send/expect)

#### Create subcategory

- `name` (string, required, min 3)
- `categoryId` (number, required)
- `thumbnail` (string, optional; will be uploaded via multipart/form-data)

#### Update subcategory

- `name` (string, required, min 3)
- `thumbnail` (string, optional; file upload)

### 3) Filtering / Search (current backend support)

#### Supported today

- `GET /sub-categories` supports `categoryId` query parameter (returns only those subcategories)
- `GET /sub-categories/:id` returns a single subcategory by id

#### Recommended admin panel filters (requires backend changes)

- Text search by name (`search`)
- Status (active/inactive)
- Pagination (`page`, `limit`)
- Sorting (name, createdAt)

### 4) Example API calls (admin UI wiring)

**List subcategories (filter by category)**
`GET /sub-categories?categoryId=123`

**Get a single subcategory**
`GET /sub-categories/{id}`

**Create subcategory**
`POST /sub-categories`

Body (multipart/form-data):

- `name`
- `categoryId`
- `thumbnail` (file)

**Update subcategory**
`PUT /sub-categories/{id}`

Body (multipart/form-data):

- `name`
- `thumbnail` (file)

**Delete subcategory**
`DELETE /sub-categories/{id}`

---

### Naming conventions (API / UI)

- Model: `Category`
- API base: `/categories`
- Resource ID param: `slug` (accepts numeric id or category name)
- Fields: `id`, `name`, `thumbnail`, `subCategories` (with `childCategories`)

---

## Admin Panel - ChildCategory Module Requirements

### Pages (page name + what should be on the page)

#### ChildCategory list page

- **Page name:** ChildCategories
- **Purpose:** Manage child categories (view/create/edit/delete) under a parent subcategory.
- **Must include:**
  - Table/grid of child categories with fields: `id`, `name`, `subCategoryId`, `thumbnail`
  - Search box (text search by name)
  - Filters: subCategoryId (parent), has thumbnail
  - Sorting (name, createdAt)
  - Pagination (page / limit)
  - Row actions: view, edit, delete

#### ChildCategory detail page

- **Page name:** ChildCategory Detail
- **Purpose:** Show child category detail.
- **Must include:**
  - Display fields: `id`, `name`, `thumbnail`, `subCategoryId`
  - Edit button, delete button, back to list

#### Create / Edit child category page

- **Page name:** Create ChildCategory / Edit ChildCategory
- **Purpose:** Create or update a child category and upload a thumbnail.
- **Must include:**
  - Form fields: `name`, `subCategoryId`, `thumbnail` (file upload)
  - Client-side validation: name required (min length 3), subCategoryId required
  - Submit + cancel/back buttons

### 1) API Overview (endpoint summary)

All ChildCategory routes live under:

- **Base URL:** `/child-categories`

#### Endpoints

| Method | Path                      | Auth    | Purpose                                                 |
| ------ | ------------------------- | ------- | ------------------------------------------------------- |
| GET    | `/child-categories`       | ❌ none | List all child categories (supports subCategory filter) |
| GET    | `/child-categories/:slug` | ❌ none | Get child category by id                                |
| POST   | `/child-categories`       | ✅ yes  | Create new child category                               |
| PUT    | `/child-categories/:slug` | ✅ yes  | Update child category (admin only)                      |
| DELETE | `/child-categories/:slug` | ✅ yes  | Delete child category (admin only)                      |

> **Auth note:** Create/Update/Delete require `authenticate` middleware (admin role enforced in service).

### 2) ChildCategory Payload Schema (what fields UI must send/expect)

#### Create child category

- `name` (string, required, min 3)
- `subCategoryId` (number, required)
- `thumbnail` (string, optional; will be uploaded via multipart/form-data)

#### Update child category

- `name` (string, required, min 3)
- `thumbnail` (string, optional; file upload)

### 3) Filtering / Search (current backend support)

#### Supported today

- `GET /child-categories` supports `subCategoryId` query parameter (returns only those child categories)
- `GET /child-categories/:id` returns a single child category by id

#### Recommended admin panel filters (requires backend changes)

- Text search by name (`search`)
- Status (active/inactive)
- Pagination (`page`, `limit`)
- Sorting (name, createdAt)

### 4) Example API calls (admin UI wiring)

**List child categories (filter by subcategory)**
`GET /child-categories?subCategoryId=123`

**Get a single child category**
`GET /child-categories/{id}`

**Create child category**
`POST /child-categories`

Body (multipart/form-data):

- `name`
- `subCategoryId`
- `thumbnail` (file)

**Update child category**
`PUT /child-categories/{id}`

Body (multipart/form-data):

- `name`
- `thumbnail` (file)

**Delete child category**
`DELETE /child-categories/{id}`
