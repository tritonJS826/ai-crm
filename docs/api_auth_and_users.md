# Authentication & User API Documentation

## Overview

This document describes the authentication and user management endpoints of the **br-general-python** backend. It defines how users register, log in, refresh tokens, retrieve their profile data, and log out.

All endpoints follow REST conventions and return JSON. Authentication uses **JWT (JSON Web Token)** with short-lived access tokens and long-lived refresh tokens.

---

## 🧹 Endpoints Summary

| Endpoint                    | Method | Description                                  | Auth Required |
| --------------------------- | ------ | -------------------------------------------- | ------------- |
| `/br-general/auth/register` | `POST` | Register a new user (includes name and role) | ❌ No          |
| `/br-general/auth/login`    | `POST` | Authenticate and get tokens                  | ❌ No          |
| `/br-general/auth/refresh`  | `POST` | Refresh access & refresh tokens              | ❌ No          |
| `/br-general/users/me`      | `GET`  | Get current logged-in user                   | ✅ Yes         |
| `/br-general/auth/logout`   | `POST` | Logout (stateless, frontend clears tokens)   | ✅ Yes         |

---

## 🗾 Endpoint Details

### 1. **Register** — `/br-general/auth/register`

**Method:** `POST`

Registers a new user with email, password, name, and role.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "strongpassword123",
  "name": "John Doe",
  "role": "PATIENT"
}
```

**Fields:**

* `email`: Unique email address (string)
* `password`: User password (string)
* `name`: Display name (string)
* `role`: Enum, one of `PATIENT` or `DOCTOR`

**Responses:**

* `200 OK` → User created successfully
* `400 Bad Request` → Email already registered

**Example (curl):**

```bash
curl -X POST http://localhost:8000/br-general/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","password":"pass1234","name":"John Doe","role":"PATIENT"}'
```

---

### 2. **Login** — `/br-general/auth/login`

**Method:** `POST`

Authenticates user and returns **access** and **refresh** tokens.

**Form Data:**

```
username=<email>
password=<password>
```

**Response Example:**

```json
{
  "user": {
    "id": "cmgcn2b0x0000epmlabcxyz",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "PATIENT"
  },
  "tokens": {
    "access_token": "<JWT_ACCESS_TOKEN>",
    "refresh_token": "<JWT_REFRESH_TOKEN>",
    "token_type": "bearer"
  }
}
```

**Example (curl):**
```bash
curl -X POST http://localhost:8000/br-general/auth/login \
  -d 'username=user@example.com' -d 'password=pass1234'
```

---

### 3. **Refresh Tokens** — `/br-general/auth/refresh`

**Method:** `POST`

Generates a new access/refresh token pair using an existing refresh token. The old pair becomes invalid after expiration.

**Request Body:**

```json
{
  "access_token": "<expired or valid access token>",
  "refresh_token": "<valid refresh token>"
}
```

**Response Example:**

```json
{
  "user": {
    "id": "cmgcn2b0x0000epmlabcxyz",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "PATIENT"
  },
  "tokens": {
    "access_token": "<new_access_token>",
    "refresh_token": "<new_refresh_token>",
    "token_type": "bearer"
  }
}
```

**Example (curl):**
```bash
curl -X POST http://localhost:8000/br-general/auth/refresh \
  -H 'Content-Type: application/json' \
  -d '{"access_token":"<expired>","refresh_token":"<valid_refresh>"}'
```

---

### 4. **Get Current User** — `/br-general/users/me`

**Method:** `GET`

Returns the current authenticated user. Requires a valid access token.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response Example:**

```json
{
  "user": {
    "id": "cmgcn2b0x0000epmlabcxyz",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "PATIENT"
  },
  "tokens": null
}
```

If access token is expired and refresh token is provided in the header:

```
X-Refresh-Token: <refresh_token>
```

then backend automatically rotates tokens and includes new ones in response headers:

```
X-New-Access-Token: <new_access_token>
X-New-Refresh-Token: <new_refresh_token>
```

---


---

### 5. **Logout** — `/br-general/auth/logout`

**Method:** `POST`

Stateless endpoint that allows users to log out from the frontend.
Since JWT tokens are stateless and not stored server-side, this endpoint simply confirms logout.
Frontend should delete tokens locally.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response Example:**

```json
{
  "message": "Logged out successfully"
}
```

---

## 🔐 Token Logic

| Token Type    | Purpose                     | Lifetime | Location                       |
| ------------- | --------------------------- |----------| ------------------------------ |
| Access Token  | Used for API authentication | 3 hours  | Header `Authorization: Bearer` |
| Refresh Token | Used to renew access tokens | 7 days   | Stored client-side securely    |

Both tokens contain:

* `sub`: User ID
* `iat`: Issued-at timestamp
* `exp`: Expiration timestamp
* `jti`: Unique ID (enables replay protection only when combined with server-side tracking of used JTIs)
* `type`: `access` or `refresh`

---

## 💻 Frontend Integration Notes

* Always store **both tokens** after login or registration.
* Use the `access_token` in `Authorization` header for all requests.
* When receiving `401 Unauthorized` with message `Token expired`, call `/br-general/auth/refresh`.
* After `/refresh`, replace both tokens in storage.
* On logout → simply delete tokens from client (backend is stateless).

**Best practice:** Keep refresh token in HTTP-only cookie or secure storage.

---

## ⚙️ Backend Implementation Notes

### AuthService Highlights

* Uses **Argon2** for password hashing (secure & modern).
* Adds `iat` and `jti` claims to JWT for traceability.
* Uses unified configuration via `settings` for all cryptographic parameters.
* Handles token decoding gracefully — expired or invalid tokens return meaningful results.

### Configuration (from `.env`)

```
JWT_SECRET_KEY=<your_secret>
ACCESS_TOKEN_EXPIRE_MINUTES=180 # 3 hours
REFRESH_TOKEN_EXPIRE_MINUTES=10080  # 7 days
JWT_ALGORITHM=HS256
```

---

## ✅ Example Flow Summary

1. **Register** → create user (with name + role)
2. **Login** → get access + refresh tokens
3. **Use** `/users/me` → authorized actions
4. **Expire** access → auto-refresh or manual `/refresh`
5. **Logout** → delete tokens client-side

---

**Version:** 1.1.0  
**Last Updated:** 2025-10-05
**Author:** br-general-python API Team
