# ChildCategory Module Developer Documentation

The ChildCategory module manages the most granular level of product classification.

## Architecture Overview

- **Routes (`childCategory.routes.ts`)**: Defines endpoints and integrates `multer` for thumbnail uploads.
- **Controller (`childCategory.controller.ts`)**: Handlers for ChildCategory CRUD.
- **Service (`childCategory.service.ts`)**: Business logic, including file system cleanup and parent (SubCategory) relationship management.
- **Model (`childCategory.model.ts`)**: Prisma data access.
- **Validator (`childCategory.validator.ts`)**: Yup schemas.

## Data Model

The `ChildCategories` model includes:

- `subCategoryId`: Reference to parent `SubCategories`.
- `name`: Unique name within the scope of the subcategory.
- `thumbnail`: Path to the image.
- `products`: Relation to `Product`.

## Core Logic & Rules

1.  **Admin Only**: Creation, update, and deletion restricted to the `admin` role.
2.  **Uniqueness**: The `name_subCategoryId` constraint prevents duplicate child category names under the same subcategory.
3.  **Strict Deletion**: A child category cannot be deleted if it contains `products`.
4.  **File Management**: Thumbnails are automatically deleted from the server upon update or deletion.

## API Endpoints

| Method   | Endpoint | Auth  | Description                                                   |
| :------- | :------- | :---- | :------------------------------------------------------------ |
| `GET`    | `/`      | No    | List child categories (optionally filter by `subCategoryId`). |
| `POST`   | `/`      | Admin | Create a new child category with thumbnail upload.            |
| `GET`    | `/:id`   | No    | Get a single child category by ID.                            |
| `PUT`    | `/:id`   | Admin | Update child category details.                                |
| `DELETE` | `/:id`   | Admin | Delete a child category (if it has no products).              |

## Validation

- `childCategorySchema`: `name` (req, min 3), `subCategoryId` (req).
- `childCategoryUpdateSchema`: `name` (opt, min 3).
