# Review Module Developer Documentation

The Review module allows customers to rate and review products they have purchased. It ensures quality feedback by linking reviews to specific order items.

## Architecture Overview

- **Routes (`review.routes.ts`)**: Defines endpoints and integrates `multer` for multi-image uploads.
- **Controller (`review.controller.ts`)**: Handles review submission, updates, and deletion.
- **Service (`review.service.ts`)**: Business logic, including verification of orders and order items.
- **Model (`review.model.ts`)**: Prisma data access for reviews, orders, and products.
- **Validator (`review.validator.ts`)**: Yup schema for ratings and comments.

## Data Model

The `Review` model includes:

- `userId`: ID of the customer.
- `productId`: ID of the product being reviewed.
- `orderId`: ID of the order containing the product.
- `orderItemId`: ID of the specific line item in the order.
- `rating`: Integer (1-5).
- `comment`: Text content.
- `images`: Array of strings (image paths).

## Core Logic & Rules

1.  **Purchase Required**: Ratings and reviews are intended for users who have purchased the product (verified by `orderId` and `orderItemId` in the request).
2.  **Review Tracking**: When a review is created, the corresponding `OrderItem` is marked as `isReviewed: true` using the `updateOrderItem` service.
3.  **Ownership**: Only the user who wrote the review can update or delete it (unless deleted by an admin).
4.  **Image Uploads**: Supports up to 10 images per review via `handleUpload({ images: 10 })`.

## API Endpoints

| Method   | Endpoint | Auth | Description                                           |
| :------- | :------- | :--- | :---------------------------------------------------- |
| `GET`    | `/`      | No   | List reviews (filterable by `productId` or `userId`). |
| `POST`   | `/`      | Yes  | Create a new review for a purchased product.          |
| `GET`    | `/:id`   | No   | Get details for a specific review.                    |
| `PATCH`  | `/:id`   | Yes  | Update a review's rating, comment, or images.         |
| `DELETE` | `/:id`   | Yes  | Remove a review.                                      |

## Validation

- `reviewSchema`: `rating` (req, 1-5), `comment` (req, min 3), `productId` (req), `orderId` (req), `orderItemId` (req).
