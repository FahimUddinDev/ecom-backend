# Variant Sub-Module Developer Documentation

The Variant module manages product variations like Size, Color, or Style, each with its own inventory and pricing.

## Architecture Overview

- **Routes (`variant.routes.ts`)**: Endpoints for variant CRUD and image management.
- **Controller (`variant.controller.ts`)**: Normalizes variant updates.
- **Service (`variant.service.ts`)**: Handles variant logic, including stock synchronization and image cleanup.
- **Model (`variant.model.ts`)**: Prisma data access.

## Data Model

- `productId`: Parent product link.
- `name`: Variation name (e.g., "Large - Red").
- `price`, `stockQuantity`: Override values for this specific variant.
- `images`: Variant-specific image gallery.
- `thumbnail`: Variant-specific primary image.

## Core Logic & Rules

1.  **Inheritance**: If a product `hasVariants` is true, the order logic primarily looks at Variant prices and stock.
2.  **Image Cleanup**: Like products, variants automatically delete old image files from the server when replaced or deleted.
3.  **Synchronization**: The service ensures that variant operations are strictly linked to their parent product's ownership.

## API Endpoints

| Method   | Endpoint | Auth | Description                                 |
| :------- | :------- | :--- | :------------------------------------------ |
| `GET`    | `/`      | No   | List all variants.                          |
| `POST`   | `/`      | Yes  | Create a new variant for a product.         |
| `GET`    | `/:id`   | No   | Get variant details.                        |
| `PUT`    | `/:id`   | Yes  | Update variant (supports image management). |
| `DELETE` | `/:id`   | Yes  | Remove a variant and its files.             |

## Validation

- `variantSchema`: `productId` (req), `name` (req), `price` (req), `stockQuantity` (req).
