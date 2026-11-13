# FindIt

A full-stack lost and found management system for educational institutions.
Internship project at Netcraftz (Full-Stack Development).

**Team:** Mohammed Ameen Vadakkethil (U19MT24S0079), Jerin B Philip (U19MT24S0118)

## What it does

- Register, log in, and reset a forgotten password by email link
- Report lost or found items with details and an optional photo
- Search and filter reports by keyword and type
- Submit an ownership claim on an item
- Admins review claims (approve or reject), manage listings, and see a dashboard
- Privacy: a finder's contact number is revealed only to the person whose claim is approved

## Tech stack

| Part | Technology |
|---|---|
| Frontend | React (Vite), React Router, plain CSS |
| Backend | Node.js, Express |
| Database | MySQL 8, accessed with mysql2 |
| Auth | bcrypt password hashing, JWT login tokens |
| Uploads | multer (photos stored on the server's disk) |
| Tools | VS Code, Git and GitHub, Postman |

## Project structure

```
findit project/
├── database/            SQL scripts (schema.sql, password_resets.sql)
├── findit-backend/      Express API (port 5000)
│   └── src/             routes, middleware, db connection, mailer
└── findit-frontend/     React app (port 5173)
    └── src/             pages, components, auth context, API helper
```

## How to run it

You need Node.js (LTS) and MySQL 8 installed.

### 1. Database

From the project folder:

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/password_resets.sql
```

### 2. Backend

```bash
cd findit-backend
npm install
```

Create a file named `.env` in `findit-backend` (copy `.env.example`) and fill it in:

```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=findit
JWT_SECRET=a_long_random_text
FRONTEND_URL=http://localhost:5173
```

Generate a secret with: `node -p "require('crypto').randomBytes(32).toString('hex')"`

Create the first admin account, then start the server:

```bash
node src/seedAdmin.js admin@college.edu YourAdminPassword
npm run dev
```

Check `http://localhost:5000/api/health`. It should say the database is connected.

### 3. Frontend

In a second terminal:

```bash
cd findit-frontend
npm install
```

Create `findit-frontend/.env` containing:

```
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev
```

Open `http://localhost:5173`.

### Password reset emails

With no email settings, the reset link is printed in the backend terminal.
To send real emails, fill in `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
and `MAIL_FROM` in the backend `.env`.

## API summary

| Method | Address | Access |
|---|---|---|
| POST | /api/auth/register, /login | Public |
| POST | /api/auth/forgot-password, /reset-password | Public |
| GET | /api/auth/me | Logged in |
| GET | /api/items, /api/items/:id, /api/categories | Public |
| GET | /api/items/mine | Logged in |
| POST | /api/items | Logged in (form data, optional photo) |
| PATCH, DELETE | /api/items/:id/status, /api/items/:id | Admin |
| POST | /api/claims | Logged in |
| GET | /api/claims/mine | Logged in |
| GET, PATCH | /api/claims, /api/claims/:id | Admin |
| GET | /api/stats | Admin |

## Security notes

- Passwords are stored only as bcrypt hashes
- Every database query uses placeholders, which prevents SQL injection
- Admin actions are checked on the server from the login token, not only in the browser
- Contact numbers are never included in public responses
- Uploaded photos are limited to JPG, PNG or WebP up to 3 MB, saved under random names
- Reset links are single-use, expire after 30 minutes, and only a hash of each token is stored

## Known limitations

- Photos are stored on the server's disk, so hosting needs a persistent disk or a storage service
- Resetting a password does not log out other devices until their tokens expire (7 days)
- An admin can set an item's status by hand, which can contradict its claims
- No email notification when a claim is approved or rejected