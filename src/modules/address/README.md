# Address Module API Documentation

This module provides APIs for managing user addresses.

**Base URL**: `/api/address`

---

## Table of Contents

- [Create Address](#create-address)
- [Get All Addresses](#get-all-addresses)
- [Get Single Address](#get-single-address)
- [Update Address](#update-address)
- [Delete Address](#delete-address)

---

## 1. Create Address

Create a new address for the authenticated user.

- **URL**: `/`
- **Method**: `POST`
- **Auth Required**: Yes (Bearer Token)

### Request Body

```json
{
  "street": "123 Main St",
  "city": "New York",
  "state": "NY",
  "country": "USA",
  "postalCode": "10001",
  "addressLine": "Apartment 4B",
  "latitude": 40.7128,
  "longitude": -74.006
}
```

### curl Example

```bash
curl -X POST http://localhost:5000/api/address \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "postalCode": "10001",
    "addressLine": "Apartment 4B",
    "latitude": 40.7128,
    "longitude": -74.0060
  }'
```

---

## 2. Get All Addresses

Retrieve a list of active addresses.

- **URL**: `/`
- **Method**: `GET`
- **Auth Required**: No
- **Query Params**:
  - `userId` (optional): Filter addresses by User ID.

### curl Example

```bash
curl -X GET "http://localhost:5000/api/address?userId=1"
```

---

## 3. Get Single Address

Retrieve details of a specific address by its ID.

- **URL**: `/:id`
- **Method**: `GET`
- **Auth Required**: No

### curl Example

```bash
curl -X GET http://localhost:5000/api/address/1
```

---

## 4. Update Address

Update an existing address. Only the owner or an admin can update an address.

- **URL**: `/:id`
- **Method**: `PUT`
- **Auth Required**: Yes (Bearer Token)

### Request Body

```json
{
  "street": "456 Updated St",
  "city": "Jersey City",
  "state": "NJ"
}
```

### curl Example

```bash
curl -X PUT http://localhost:5000/api/address/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "street": "456 Updated St",
    "city": "Jersey City",
    "state": "NJ"
  }'
```

---

## 5. Delete Address

Delete an address. Only the owner or an admin can delete an address. Deletion may be blocked if there are active orders, or realized as a soft-delete if historical orders exist.

- **URL**: `/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes (Bearer Token)

### curl Example

```bash
curl -X DELETE http://localhost:5000/api/address/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```
