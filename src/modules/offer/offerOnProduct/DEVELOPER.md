# OfferOnProduct Sub-Module Developer Documentation

This sub-module manages the junction between Offers and Products/Variants, facilitating the many-to-many relationship.

## Architecture Overview

- **Routes (`offerOnProduct.routes.ts`)**: Nested routes within `/api/offer/on-product`.
- **Controller (`offerOnProduct.controller.ts`)**: Logic for linking/unlinking items.
- **Service (`offerOnProduct.service.ts`)**: Core mapping logic.
- **Model (`offerOnProduct.model.ts`)**: Prisma access for the mapping table.

## Data Model

- `offerId`: ID of the promotion.
- `productId`: ID of the target product.
- `variantId`: Optional ID for variant-specific offers.

## Core Logic & Rules

1.  **Strict Linking**: When an offer is linked to a product, the service can also target specific variants.
2.  **Bulk Deletion**: Supports removing links by ID.
3.  **Filtered Retrieval**: Allows fetching mappings by `offerId`, `productId`, or `variantId`.

## API Endpoints

| Method   | Endpoint | Auth | Description                         |
| :------- | :------- | :--- | :---------------------------------- |
| `GET`    | `/`      | No   | List all offer-product links.       |
| `POST`   | `/`      | Yes  | Link an offer to a product/variant. |
| `GET`    | `/:id`   | No   | Get mapping details.                |
| `DELETE` | `/:id`   | Yes  | Remove a link.                      |

## Validation

- `offerOnProductSchema`: `offerId` (req), `productId` (req), `variantId` (opt).
