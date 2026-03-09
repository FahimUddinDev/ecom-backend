# Category Module Developer Documentation

The Category module manages top-level product classifications. It establishes the root of the category hierarchy and ensures data integrity through strict deletion checks and admin-only permissions.

## Architecture Overview

- **Routes (`category.routes.ts`)**: Defines endpoints for category management, integrating `multer` for thumbnail uploads.
- **Controller (`category.controller.ts`)**: Thin layer handling request dispatch and file path mapping to services.
- **Service (`category.service.ts`)**: Implements business rules, including file system cleanup and recursive data fetching.
- **Model (`category.model.ts`)**: Prisma data access for categories.
- **Validator (`category.validator.ts`)**: Yup schema for category creation and updates.

## Data Model

The `Categories` model (mapped to `categories` in Prisma) includes:

- `name`: Unique name (stored in lowercase).
- `thumbnail`: Path to the category image.
- `subCategories`: Relation to `SubCategories`.
- `products`: Relation to `Product`.

## Core Logic & Rules

1.  **Admin Restricted**: Creating, updating, and deleting categories is restricted to users with the `admin` role.
2.  **File Management**:
    - Thumbnails are uploaded via `handleUpload({ thumbnail: 1 })`.
    - Old thumbnail files are automatically deleted from the server when a category is updated with a new image or when the category is deleted.
3.  **Strict Deletion**: A category can only be deleted if:
    - It has no associated subcategories.
    - It has no associated products.
4.  **Deep Fetching**: `getCategories` and `getCategory` retrieve a 3-level deep hierarchy (`Category -> SubCategory -> ChildCategory`) using Prisma's `select` logic.

## API Endpoints

| Method   | Endpoint | Auth  | Description                                                       |
| :------- | :------- | :---- | :---------------------------------------------------------------- |
| `GET`    | `/`      | No    | List all categories with their sub-tree (Sub & Child categories). |
| `POST`   | `/`      | Admin | Create a new category with a thumbnail upload.                    |
| `GET`    | `/:slug` | No    | Get a single category by ID or name with its full sub-tree.       |
| `PUT`    | `/:slug` | Admin | Update category name and/or thumbnail.                            |
| `DELETE` | `/:slug` | Admin | Delete a category (if it has no children or products).            |

## Validation

- `categorySchema`: `name` (req, min 3). `thumbnail` is handled via multipart form data.
