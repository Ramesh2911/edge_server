# Real Estate Backend API

A production-ready REST API built with Node.js, Express.js, MySQL, and JWT Authentication.

---

## Technology

- Node.js
- Express.js
- MySQL
- mysql2
- JWT Authentication
- bcryptjs
- Multer
- Nodemailer

---

## Features

- User Authentication
- Role Based Access
- Property Management
- Property Verification
- Buyer Interest (Poke)
- Lead Management
- Banner Management
- Blog Management
- SEO Management
- Notifications
- Contact Management

---

## User Roles

- Super Admin
- Admin A
- Admin B
- Owner
- Broker
- Developer
- Buyer

---

## Installation

Clone Project

```bash
git clone https://github.com/your-repo/real-estate-backend.git
```

Go to project

```bash
cd real-estate-backend
```

Install packages

```bash
npm install
```

Configure Environment

```bash
cp .env.example .env
```

Start Development Server

```bash
npm run dev
```

Start Production

```bash
npm start
```

---

## Project Structure

```
backend
│
├── src
│
├── config
├── controllers
├── middleware
├── routes
├── services
├── helpers
├── validations
├── uploads
├── logs
│
├── app.js
└── server.js
```

---

## API Base URL

```
http://localhost:5000/api/v1
```

---

## Authentication

JWT Bearer Token

```
Authorization: Bearer <token>
```

---

## Folder Upload Structure

```
uploads/

property/
    images/
    documents/

profile/

banner/

blog/
```

---

## Database

MySQL

Database Name

```
real_estate_db
```

---

## Run Project

Development

```bash
npm run dev
```

Production

```bash
npm start
```

---

## Response Format

Success

```json
{
    "success": true,
    "message": "Success",
    "data": {}
}
```

Error

```json
{
    "success": false,
    "message": "Something went wrong"
}
```

---

## Security

- JWT Authentication
- Password Hashing (bcryptjs)
- Helmet
- CORS
- Rate Limiter
- Input Validation

---

## Author

Ramesh