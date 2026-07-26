# Week 7 - Day 2 Assignment: JWT Authentication with Express

A Node.js Express server demonstrating JWT-based authentication — registration, login, token refresh, and logout.

## Features

- **User Registration** (`POST /api/auth/register`) — create an account with hashed passwords (bcryptjs)
- **User Login** (`POST /api/auth/login`) — authenticate and receive a JWT
- **Dual-Token Login** (`POST /api/auth/login-v2`) — returns short-lived access token + long-lived refresh token
- **Token Refresh** (`POST /api/auth/refresh`) — exchange a refresh token for a new access token
- **Profile** (`GET /api/profile`) — protected endpoint requiring a valid token
- **Logout** (`POST /api/auth/logout`) — revoke a token via server-side blacklist
- **Test Token** (`GET /api/test-token`) — demonstrates valid, expired, and tampered token scenarios

## How to Run

```bash
# 1. Install dependencies
npm install

# 2. Make sure .env exists with:
#    JWT_SECRET=your-super-secret-key-make-it-long-and-random-at-least-32-chars
#    PORT=3000

# 3. Start the server
npm start

# Or with auto-reload on file changes:
npm run dev
```

## API Endpoints

| Method | Path                  | Auth Required | Description                          |
|--------|-----------------------|---------------|--------------------------------------|
| GET    | `/api/test-token`     | No            | Test valid/expired/tampered tokens   |
| POST   | `/api/auth/register`  | No            | Register a new user                  |
| POST   | `/api/auth/login`     | No            | Login and get a token                |
| POST   | `/api/auth/login-v2`  | No            | Login and get access + refresh tokens|
| POST   | `/api/auth/refresh`   | No            | Get a new access token from refresh  |
| GET    | `/api/profile`        | Yes           | Get current user's profile           |
| POST   | `/api/auth/logout`    | Yes           | Revoke the current token             |

All protected endpoints expect an `Authorization: Bearer <token>` header.
