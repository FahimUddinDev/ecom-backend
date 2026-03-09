# Products Module Developer Documentation

The Products module is the primary catalog management component. It supports multi-image uploads, hierarchical category linking, and extension through variants and additional information.

## Architecture Overview

- **Routes (`products.routes.ts`)**: Defines endpoints and integrates `multer` for complex image handling (thumbnail + gallery).
- **Controller (`products.controller.ts`)**: Manages request parsing and file path normalization.
- **Service (`products.service.ts`)**: Large service file implementing complex CRUD, image cleanup, and deletion logic.
- **Model (`products.model.ts`)**: Prisma data access for products, ensuring comprehensive data selection for UI.
- **Validator (`products.validator.ts`)**: Use for validating basic product fields.

## Data Model

- `name`, `slug`: Unique human and URL identifiers.
- `price`, `currency`, `stockQuantity`: Basic commerce fields.
- `thumbnail`, `images`: Path strings for visual assets.
- `tags`: Array of keywords for search/discovery.
- `hasVariants`: Boolean flag indicating if the product uses the `Variant` sub-module.
- `categoryId`, `subCategoryId`, `childCategoryId`: Links to the 3-level category hierarchy.

## Core Logic & Rules

### 1. Advanced Deletion (`deleteProduct`)

- **Active Order Guard**: Deletion is blocked if there are any `pending` orders.
- **History Check**: If an order history exists (but none are active), the product is soft-deleted by setting `status: draft`.
- **Hard Delete**: If no order history exists, the product and all associated `additionalInfo`, `variants`, `offersOnProduct`, and `couponsOnProduct` are deleted via a transaction.

### 2. Image Management

- **Replacement**: When updating a thumbnail or removing gallery images, the service uses `fs.unlink` to physically remove the old files from the `uploads/` directory.
- **Normalization**: Paths are stored as `/public/<filename>` to facilitate client-side URL mapping.

### 3. Search & Filtering (`getProducts`)

The service builds a complex `where` clause supporting:

- **Full-text search**: Matches name, description, and tags.
- **Price Range**: Min/Max filters.
- **Date Ranges**: `createdAt` filtering.
- **Meta Filters**: `inStock`, `rating`, `popularity`.

## API Endpoints

| Method   | Endpoint | Auth | Description                                            |
| :------- | :------- | :--- | :----------------------------------------------------- |
| `GET`    | `/`      | No   | Highly filtered list of products (paginated).          |
| `POST`   | `/`      | Yes  | Create a product with 1 thumbnail and up to 10 images. |
| `GET`    | `/:id`   | No   | Get product details by ID or Slug.                     |
| `PUT`    | `/:id`   | Yes  | Update product (handles image replacement/removal).    |
| `DELETE` | `/:id`   | Yes  | Complex deletion (Soft or Hard based on history).      |

## Sub-Modules

- **AdditionalInfo**: Managed in the `additionalInfo/` subdirectory for product specifications.
- **Variant**: Managed in the `variant/` subdirectory for distinct options (size, color, etc.).
