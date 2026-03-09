# AdditionalInfo Sub-Module Developer Documentation

This module allows for extensible product specifications (e.g., "Weight", "Dimensions", "Warranty").

## Architecture Overview

- **Routes (`additionalinfo.routes.ts`)**: Simple CRUD routes.
- **Controller (`additionalinfo.controller.ts`)**: Handlers for managing info entries.
- **Service (`additionalinfo.service.ts`)**: Logic for creating and updating specification pairs.
- **Model (`additionalinfo.model.ts`)**: Prisma data access.

## Data Model

- `productId`: Back-reference to the Product.
- `title`: The key (e.g., "Color").
- `description`: The value (e.g., "Deep Blue").

## Core Logic & Rules

1.  **Ownership**: Only product owners (Sellers) or Admins can modify additional info.
2.  **Uniqueness**: Multiple info entries can exist per product, but titles should typically be unique per product for clarity.

## API Endpoints

| Method   | Endpoint | Auth | Description                           |
| :------- | :------- | :--- | :------------------------------------ |
| `GET`    | `/`      | No   | List all info entries.                |
| `POST`   | `/`      | Yes  | Add a new specification to a product. |
| `GET`    | `/:id`   | No   | Get an info entry detail.             |
| `PUT`    | `/:id`   | Yes  | Update an info entry.                 |
| `DELETE` | `/:id`   | Yes  | Remove an info entry.                 |

## Validation

- `additionalInfoSchema`: `productId` (req), `title` (req), `description` (req).
