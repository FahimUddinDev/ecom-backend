# Coupon Module Developer Documentation

The Coupon module manages promotional discount codes. It supports complex targeting, referral tracking, and usage limits.

## Architecture Overview

- **Routes (`coupon.routes.ts`)**: Defines endpoints for coupons, referrals, and usage tracking.
- **Controller (`coupon.controller.ts`)**: Large controller handling multiple entities (Coupon, Referral, Usage).
- **Service (`coupon.service.ts`)**: Orchestrates coupon logic, including complex date filtering and permission checks.
- **Model (`coupon.model.ts`)**: Prisma data access for all coupon-related entities.
- **Validator (`coupon.validator.ts`)**: Validates coupon codes, types, and values.

## Data Model

### Coupon

- `code`: The unique alphanumeric code users enter.
- `referralCode`: Secondary code for referral tracking.
- `discountType`: `PERCENTAGE` or `FIXED_AMOUNT`.
- `discountValue`: The numeric value of the discount.
- `usageLimit`: Maximum number of times the coupon can be used.
- `startDate / endDate`: Validity period.
- `sellerId`: Optional. If set, the coupon is specific to a seller's products.

### Sub-Entities

- **CouponUsage**: Records every time a coupon is successfully applied by a user.
- **CouponReferral**: Tracks IP addresses and users who clicked through a referral link.

## Core Logic & Rules

1.  **Strict Permissions**: Coupons can be managed by **Admins** (all coupons) or **Sellers** (only coupons they created).
2.  **Flexible Targeting**: Coupons can be linked to specific `productIds` or `variantIds` via many-to-many relations (`ProductsOnCoupons`, `VariantsOnCoupons`).
3.  **Advanced Filtering**: `getCoupons` supports searching by code and filtering by date ranges (`createdAt`, `startDate`, `endDate`) using custom date parsing logic in the service.
4.  **Referral Tracking**: Supports tracking usage and referrals to analyze campaign performance.

## API Endpoints

### Coupons

| Method   | Endpoint | Auth | Description                                      |
| :------- | :------- | :--- | :----------------------------------------------- |
| `GET`    | `/`      | No   | List coupons (paginated, with search/filter).    |
| `POST`   | `/`      | Yes  | Create a new coupon (Seller/Admin).              |
| `GET`    | `/:id`   | No   | Get details, including linked products/variants. |
| `PUT`    | `/:id`   | Yes  | Update coupon details.                           |
| `DELETE` | `/:id`   | Yes  | Delete a coupon.                                 |

### Referrals & Usage

| Method | Endpoint    | Auth | Description                     |
| :----- | :---------- | :--- | :------------------------------ |
| `POST` | `/referral` | Yes  | Record a coupon referral.       |
| `POST` | `/usage`    | Yes  | Record a coupon usage instance. |

## Validation

- `couponSchema`: `code` (req), `discountType` (req), `discountValue` (req), `startDate` (req), `usageLimit` (req).
