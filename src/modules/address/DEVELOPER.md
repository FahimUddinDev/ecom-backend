# Address Module Developer Documentation

The Address module manages user-related addresses, providing functionality for creating, retrieving, updating, and deleting addresses. It includes sophisticated logic for handling deletions based on order history.

## Architecture Overview

The module follows a standard controller-service-model pattern:

- **Routes (`address.routes.ts`)**: Defines API endpoints and applies middleware (authentication/validation).
- **Controller (`address.controller.ts`)**: Handles HTTP requests/responses and extracts user data from the authentication context.
- **Service (`address.service.ts`)**: Contains business logic, permission checks, and data orchestration.
- **Model (`address.model.ts`)**: Interacts directly with Prisma for database operations.
- **Validator (`address.validator.ts`)**: Defines the Yup schema for input validation.

## Data Model

The `Address` model includes the following key fields:

- `userId`: Link to the owner (User).
- `street`, `city`, `state`, `country`, `postalCode`, `addressLine`: Physical address details.
- `latitude`, `longitude`: Optional coordinates.
- `status`: Boolean flag used for soft deletion.

## Core Logic: Soft vs. Hard Delete

The module implements a specific deletion strategy in `address.service.ts`:

1.  **Blocked Deletion**: If an address is referenced by any **ACTIVE** orders, deletion is blocked (400 Bad Request).
2.  **Soft Delete**: If an address is referenced by **ANY** historical orders (but no active ones), it is soft-deleted by setting `status: false`. This preserves historical data for the orders.
3.  **Hard Delete**: If an address has no associated orders, it is permanently removed from the database.

## API Endpoints

| Method   | Endpoint | Auth | Description                                                                  |
| :------- | :------- | :--- | :--------------------------------------------------------------------------- |
| `GET`    | `/`      | No   | List addresses (filterable by `userId`). Only active addresses are returned. |
| `POST`   | `/`      | Yes  | Create a new address for the authenticated user.                             |
| `GET`    | `/:id`   | No   | Get details for a specific active address.                                   |
| `PUT`    | `/:id`   | Yes  | Update an address. Restricted to owner or admin.                             |
| `DELETE` | `/:id`   | Yes  | Delete or soft-delete an address. Restricted to owner or admin.              |

## Permissions

- **Read**: Publicly accessible (for active addresses).
- **Create**: Authenticated users only.
- **Update/Delete**: Restricted to the **Owner** of the address or a user with the **Admin** role.

## Validation Schema

Input is validated using the `addressSchema` in `address.validator.ts`.

- **Required**: `street` (min 5), `city` (min 2), `state` (min 2), `country` (min 3), `addressLine` (min 3).
- **Optional**: `postalCode`, `latitude` (-90 to 90), `longitude` (-180 to 180).
