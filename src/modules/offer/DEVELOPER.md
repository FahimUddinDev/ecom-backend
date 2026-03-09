# Offer Module Developer Documentation

The Offer module manages time-bound promotions and discounts applied directly to products or variants.

## Architecture Overview

- **Routes (`offer.routes.ts`)**: Endpoints for offers and the `offerOnProduct` sub-module.
- **Controller (`offer.controller.ts`)**: Thin handlers for offer lifecycle.
- **Service (`offer.service.ts`)**: Business logic for offers, including date normalization.
- **Model (`offer.model.ts`)**: Prisma data access for offers.
- **Sub-Module (`offerOnProduct`)**: Manages the mapping between offers and products/variants.

## Data Model

- `name`: Display name of the offer.
- `offerType`: `PRODUCT_OFFER`, `CATEGORY_OFFER`, etc.
- `discountType`: `PERCENTAGE` or `FIXED_AMOUNT`.
- `discountValue`: Numeric discount.
- `status`: `ACTIVE`, `INACTIVE`.
- `startDate / endDate`: Validity period.

## Core Logic & Rules

1.  **Ownership**: Offers are managed by **Admins** or the **Seller** who created them.
2.  **Relationship Management**: Offers are linked to products via the `offerOnProduct` module. This allows a single offer to apply to many products or specific variants.
3.  **Date Integrity**: Start and end dates are converted to `Date` objects in the service to ensure consistent format in the database.
4.  **Soft States**: Offers use a `status` field to be toggled without deletion.

## API Endpoints

### Offers

| Method   | Endpoint | Auth | Description                          |
| :------- | :------- | :--- | :----------------------------------- |
| `GET`    | `/`      | No   | List offers with filtering.          |
| `POST`   | `/`      | Yes  | Create a new offer.                  |
| `GET`    | `/:id`   | No   | Get offer details with linked items. |
| `PUT`    | `/:id`   | Yes  | Update offer.                        |
| `DELETE` | `/:id`   | Yes  | Delete offer.                        |

### Offer-to-Product Mapping (`offerOnProduct`)

| Method   | Endpoint          | Auth | Description                         |
| :------- | :---------------- | :--- | :---------------------------------- |
| `POST`   | `/on-product`     | Yes  | Link an offer to a product/variant. |
| `GET`    | `/on-product`     | No   | List mappings.                      |
| `DELETE` | `/on-product/:id` | Yes  | Remove a mapping.                   |

## Validation

- `offerSchema`: `name` (req), `offerType` (req), `discountType` (req), `discountValue` (req), `startDate` (req).
