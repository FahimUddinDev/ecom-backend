# Wishlist Module Developer Documentation

The Wishlist module allows users to save products for later viewing.

## Architecture Overview

- **Routes (`wishlist.routes.ts`)**: Defines endpoints for adding, listing, and removing wishlist items.
- **Controller (`wishlist.controller.ts`)**: Thin handlers for wishlist operations.
- **Service (`wishlist.service.ts`)**: Logic for managing personal wishlists.
- **Model (`wishlist.model.ts`)**: Prisma data access, including optimized includes for product and user details.
- **Validator (`wishlist.validator.ts`)**: Simple schema for validating product IDs.

## Data Model

- `userId`: The owner of the wishlist item.
- `productId`: The product being saved.

## Core Logic & Rules

1.  **Strict Ownership**: Users can only view and delete items from their own wishlist.
2.  **Uniqueness**: The database model prevents duplicate `productId` entries for the same `userId`.
3.  **No Anonymous Wishlists**: Adding to or deleting from a wishlist requires authentication.

## API Endpoints

| Method   | Endpoint | Auth | Description                                          |
| :------- | :------- | :--- | :--------------------------------------------------- |
| `GET`    | `/`      | Yes  | List all items in the authenticated user's wishlist. |
| `POST`   | `/`      | Yes  | Add a product to the wishlist.                       |
| `GET`    | `/:id`   | Yes  | Get a specific wishlist item detail.                 |
| `DELETE` | `/:id`   | Yes  | Remove an item from the wishlist.                    |

## Validation

- `wishlistSchema`: `productId` (req).
