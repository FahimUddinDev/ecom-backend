# Cart Module Developer Documentation

The Cart module manages temporary storage of products for users before they proceed to checkout. It supports single and bulk operations, handles variant-specific items, and enforces ownership and business rules.

## Architecture Overview

- **Routes (`cart.routes.ts`)**: Defines endpoints for cart management, including bulk and clear operations.
- **Controller (`cart.controller.ts`)**: Manages request flow, extracting user IDs and validating ownership for updates/deletions.
- **Service (`cart.service.ts`)**: Orchestrates cart logic, such as preventing self-purchases and handling bulk additions.
- **Model (`cart.model.ts`)**: Encapsulates Prisma queries, including complex upsert logic for bulk additions.
- **Validator (`cart.validator.ts`)**: Defines Yup schemas for single and bulk cart operations.

## Data Model

The `Cart` model consists of:

- `userId`: Reference to the `User`.
- `productId`: Reference to the `Product`.
- `variantId`: Optional reference to a specific product `Variant`.
- `quantity`: Number of items.
- `createdAt`, `updatedAt`: Timestamps.

The model uses a central `cartInclude` object to ensure product, variant, and user (limited fields) details are always nested in the response.

## Core Logic & Rules

1.  **Ownership Integrity**: Users can only view, update, or delete their own cart items. The `authenticate` middleware provides the `userId`, which is used in all filtering and verification steps.
2.  **No Self-Purchase**: Users are prevented from adding their own products (where `sellerId === userId`) to their cart.
3.  **Automatic Upsert**:
    - For single `POST /`, if the same `userId + productId + variantId` combination exists, the quantity is updated instead of creating a new record.
    - For bulk `POST /bulk`, the model performs an upsert-like logic inside a loop to increment quantities for existing items.
4.  **Bulk Operations**:
    - `POST /bulk`: Efficiently adds multiple items at once.
    - `DELETE /bulk`: Removes multiple items by ID after verifying that the user owns all of them.
5.  **Soft Deletion (Implicit)**: Deleting a cart item is a hard delete in the database as cart data is transient.

## API Endpoints

| Method   | Endpoint | Auth | Description                                                                  |
| :------- | :------- | :--- | :--------------------------------------------------------------------------- |
| `GET`    | `/`      | No   | List cart items with optional `userId` or `productId` filtering (paginated). |
| `POST`   | `/`      | Yes  | Add an item to the cart (or increment quantity if it exists).                |
| `POST`   | `/bulk`  | Yes  | Add multiple items to the cart at once.                                      |
| `DELETE` | `/bulk`  | Yes  | Remove multiple items by their IDs.                                          |
| `DELETE` | `/clear` | Yes  | Remove all items from the authenticated user's cart.                         |
| `GET`    | `/:id`   | No   | Get details for a specific cart row.                                         |
| `PATCH`  | `/:id`   | Yes  | Update the quantity of a specific cart item.                                 |
| `DELETE` | `/:id`   | Yes  | Remove a specific item from the cart.                                        |

## Permissions

- **Read**: Public (though typically used by the owner).
- **Modification**: Restricted to the **Owner** of the cart item. Ownership is verified in the controller for `PATCH` and `DELETE` (single/bulk).

## Validation

Schemas in `cart.validator.ts`:

- `cartSchema`: `productId` (req), `variantId` (opt), `quantity` (req, min 1).
- `updateCartSchema`: `quantity` (req, min 1).
- `bulkCartSchema`: Array of `items` matching `cartSchema`.
- `bulkDeleteSchema`: Array of `ids` (req).
