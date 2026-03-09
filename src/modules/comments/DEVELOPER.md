# Comments Module Developer Documentation

The Comments module enables product-specific discussion threads. It supports anonymous commenting, nested replies, and image attachments.

## Architecture Overview

- **Routes (`comments.routes.ts`)**: Defines endpoints, including optional authentication for top-level comments and required authentication for replies/edits.
- **Controller (`comments.controller.ts`)**: Manages the multi-layered logic of comments and replies.
- **Service (`comments.service.ts`)**: Core logic for creating, fetching, and updating comments.
- **Model (`comments.model.ts`)**: Prisma data access, using a dedicated `commentInclude` for product, user, and parent relationship details.
- **Validator (`comments.validator.ts`)**: Yup schema for content and relationship IDs.

## Data Model

The `Comment` model includes:

- `productId`: ID of the product being discussed.
- `userId`: Optional (for anonymous comments).
- `parentId`: Optional (for replies).
- `content`: Text body of the comment.
- `images`: Array of strings (image paths).

## Core Logic & Rules

1.  **Anonymous Comments**: Top-level comments can be created without authentication.
2.  **Threaded Conversations**: Replies require a `parentId` and authentication.
3.  **Role-Based Replies**: (Future objective mentioned in history) Sellers can reply to comments on their products, admins can reply to anything.
4.  **Pagination**: `getComments` only returns top-level comments (`parentId: null`) by default, sorted by `createdAt desc`.
5.  **Image Uploads**: Supports up to 5 images per comment via `handleUpload({ images: 5 })`.

## API Endpoints

| Method   | Endpoint     | Auth | Description                                             |
| :------- | :----------- | :--- | :------------------------------------------------------ |
| `GET`    | `/`          | No   | List top-level comments for a product/user (paginated). |
| `POST`   | `/`          | Opt  | Create a new top-level comment.                         |
| `GET`    | `/:id`       | No   | Get a specific comment and its context.                 |
| `PATCH`  | `/:id`       | Yes  | Update comment content or images (Owner only).          |
| `DELETE` | `/:id`       | Yes  | Remove a comment (Owner/Admin only).                    |
| `POST`   | `/:id/reply` | Yes  | Create a reply to an existing comment.                  |

## Validation

- `commentSchema`: `content` (req, min 3), `productId` (req), `parentId` (opt).
