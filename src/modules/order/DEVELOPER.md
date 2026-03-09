# Order Module Developer Documentation

The Order module is the core transactional component of the backend, managing the complete lifecycle from checkout to delivery and potential returns.

## Architecture Overview

- **Routes (`order.routes.ts`)**: Defines endpoints for orders, returns, and item-level status updates. All routes are authenticated.
- **Controller (`order.controller.ts`)**: Manages the flow between status updates and complex service calls.
- **Service (`order.service.ts`)**: Large service file containing complex transaction logic for creation, cancellation, and returns.
- **Model (`order.model.ts`)**: Prisma data access for orders, order items, and returns.
- **Validator (`order.validator.ts`)**: Comprehensive schemas for order placement and status transitions.

## Data Model

### Orders

- `orderNumber`: Unique alphanumeric identifier (e.g., ORD-12345).
- `userId`: The customer who placed the order.
- `status`: Enum (`pending`, `processing`, `shipped`, `delivered`, `cancelled`).
- `subTotal`, `discountAmount`, `shippingFee`, `totalAmount`: Financial breakdown.
- `paymentMethod`: Enum/String.
- `deliveryAddressId` / `pickupAddressId`: Links to the `Address` model.

### OrderItem & ReturnOrder

- **OrderItem**: Individual products/variants in an order. Tracks its own `status` for seller management.
- **ReturnOrder**: Tracks return requests, including reasons, images, and approval status.

## Core Logic & Rules

### 1. Order Creation (`createOrder`)

Executed within a **Prisma Transaction** to ensure atomicity:

- **Address Validation**: Ensures delivery address belongs to the user and pickup address is active.
- **Pricing & Offers**: Iterates through items, applying the **best available offer** (product or variant level).
- **Stock Management**: Checks stock availability and decrements `stockQuantity` while incrementing `soldQuantity`.
- **Coupon Logic**: Validates code, checks expiry, usage limits, and ensures the user hasn't used it previously.
- **Cleanup**: Automatically clears the user's `Cart` upon successful order creation.

### 2. Status Management

- **Hierarchical Permission**:
  - **Admins** can update any order/item status.
  - **Sellers** can only update the status of `OrderItems` or `Orders` containing their products.
- **Timestamps**: Automatically records `deliveredAt`, `processedAt`, etc., when status changes.

### 3. Cancellations & Returns

- **Cancellations**: Allowed only for `pending` orders. Restores stock quantities.
- **Returns**: Allowed for `delivered` items. Requires a reason and optional images. Approving a return initiates a stock restoration.

## API Endpoints

| Method  | Endpoint              | Auth         | Description                                                    |
| :------ | :-------------------- | :----------- | :------------------------------------------------------------- |
| `GET`   | `/`                   | Yes          | List orders (Paginated; User: self, Seller: related products). |
| `POST`  | `/`                   | Yes          | Place a new order.                                             |
| `GET`   | `/:id`                | Yes          | Get detailed order summary.                                    |
| `PATCH` | `/:id`                | Admin/Seller | Update overall order status.                                   |
| `POST`  | `/:id/cancel`         | User         | Cancel a pending order (restores stock).                       |
| `POST`  | `/:id/return`         | User         | Request a return for a delivered order.                        |
| `PATCH` | `/returns/:id/status` | Admin/Seller | Approve/Reject a return request.                               |
| `PATCH` | `/items/:id/status`   | Admin/Seller | Update status for a specific item (for split shipments).       |

## Validation

- `createOrderSchema`: `deliveryAddressId` (req), `items` (req array of `{productId, quantity, variantId?}`).
- `returnOrderSchema`: `orderItemId` (req), `reason` (req).
