# SubCategory Module Developer Documentation

The SubCategory module manages the second level of product classification, linking top-level Categories to granular ChildCategories.

## Architecture Overview

- **Routes (`subCategory.routes.ts`)**: Defines endpoints and integrates `multer` for thumbnail uploads.
- **Controller (`subCategory.controller.ts`)**: Handlers for CRUD operations on subcategories.
- **Service (`subCategory.service.ts`)**: Manages business logic, file system operations, and parent relationship validation.
- **Model (`subCategory.model.ts`)**: Prisma data access for subcategories.
- **Validator (`subCategory.validator.ts`)**: Yup schemas for create and update actions.

## Data Model

The `SubCategories` model includes:

- `categoryId`: Reference to the parent `Categories`.
- `name`: Unique name within the scope of the category.
- `thumbnail`: Path to the subcategory image.
- `childCategories`: Relation to `ChildCategories`.
- `products`: Relation to `Product`.

## Core Logic & Rules

1.  **Admin Only**: Modification operations (POST, PUT, DELETE) require the `admin` role.
2.  **Parent Relationship**: When creating, the `categoryId` must be valid. The unique constraint `name_categoryId` prevents duplicate subcategory names within the same parent category.
3.  **File Management**:
    - Old thumbnail files are purged from the server during updates or deletion.
4.  **Strict Deletion**: Deletion is blocked if the subcategory has associated `childCategories` or `products`.

## API Endpoints

| Method   | Endpoint | Auth  | Description                                                    |
| :------- | :------- | :---- | :------------------------------------------------------------- |
| `GET`    | `/`      | No    | List target subcategories (optionally filter by `categoryId`). |
| `POST`   | `/`      | Admin | Create a new subcategory with a thumbnail upload.              |
| `GET`    | `/:id`   | No    | Get a single subcategory by ID with its child categories.      |
| `PUT`    | `/:id`   | Admin | Update subcategory details.                                    |
| `DELETE` | `/:id`   | Admin | Delete a subcategory (if empty of children and products).      |

## Validation

- `subCategorySchema`: `name` (req, min 3), `categoryId` (req).
- `subCategoryUpdateSchema`: `name` (opt, min 3).
