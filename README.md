# 🔐 Auth Backend — JWT, Refresh Tokens & Google OAuth

A production-grade authentication backend built using **Node.js, Express, MongoDB**, implementing real-world security practices such as JWT access tokens, refresh token rotation, HTTP-only cookies, and Google OAuth 2.0.

This project is designed to reflect **industry authentication architecture**, not simplified tutorial implementations.

---

## 🚀 Features

### Authentication
- Email & password login
- Google OAuth 2.0 login
- Secure password hashing (bcrypt)
- JWT-based access tokens
- Refresh tokens with rotation
- Automatic session recovery

### Security
- HTTP-only cookies (no localStorage)
- Short-lived access tokens
- Long-lived refresh tokens
- Refresh token revocation
- Token reuse protection
- Backend-controlled sessions

### Authorization
- Role-based access control
- Roles: `user`, `admin`, `super-admin`
- Protected route middleware

### Developer Experience
- Swagger (OpenAPI) documentation
- Clean modular structure
- Environment-based configuration

---

## 🧠 Authentication Architecture

### Access Token
- Lifetime: 15 minutes
- Used for protected API access
- Stored in HTTP-only cookie

### Refresh Token
- Lifetime: 7 days
- Stored in HTTP-only cookie
- Stored in database
- Rotated on every refresh
- Revoked on logout

### OAuth Flow
- Google used only for identity verification
- Backend issues its own JWT tokens
- Google tokens are never stored
- Unified authentication system

---

## 📁 Project Structure

auth-backend/
│
├── config/
│ ├── db.js
│ ├── passport.js
│ └── swagger.js
│
├── middleware/
│ ├── authMiddleware.js
│ └── roleMiddleware.js
│
├── models/
│ └── User.js
│
├── routes/
│ └── authRoutes.js
│
├── .env
├── .gitignore
├── index.js
└── package.json




---

## ⚙️ Tech Stack

- Node.js
- Express.js
- MongoDB & Mongoose
- JSON Web Tokens (JWT)
- bcryptjs
- Passport.js (Google OAuth 2.0)
- Swagger UI
- Cookie-parser
- CORS

---

## 🔑 Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/authdb   OR you can make remote DB on mongoDB-atlas

JWT_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_EXPIRES_IN=15m

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

SUPER_ADMIN_EMAIL=admin@system.com

```

## ▶️ Getting Started
### Install dependencies

```bash
npm install
```
### start the server

```bash
node index.js
```
### Server runs at:

```
http://localhost:5000

```
## API Documentation (swagger)

### swagger UI available at :
     ```
     http://localhost:5000/api-docs
  ```




