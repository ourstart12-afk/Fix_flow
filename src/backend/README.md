# FixFlow API

The local API is built with Express.js. Express routes handle authentication, repair requests, devices, and profile updates; Node.js built-in modules handle password hashing and local JSON storage.

## Start FixFlow

From the project root, run:

```powershell
npm run dev
```

This starts the API and React app together. On a fresh clone, run `npm install` once before `npm run dev`. Open the local URL printed in the terminal. If port 5173 is busy, Vite uses the next available port. The API health check is at `http://127.0.0.1:4000/api/health`. Press Ctrl+C to stop the app.

## Configure the manager account

Set these variables in the same PowerShell terminal before running `npm run dev`:

```powershell
$env:FIXFLOW_MANAGER_EMAIL = "manager@example.com"
$env:FIXFLOW_MANAGER_PASSWORD = "choose-a-password-with-8-or-more-characters"
$env:FIXFLOW_MANAGER_NAME = "FixFlow Manager"
npm run dev
```

Customer sign-up always creates a customer account. A manager account is created only when both manager email and password are configured; there are no built-in sample credentials.

## Reset a password during development

On the sign-in page, choose **Forgot password?**, enter the account email, and set a new password. This no-code reset is available only while the API runs locally in development. It does not send email or verify account ownership, so it is for local class testing only and is disabled in production.

## Local data and limits

Customer accounts are saved in `src/backend/data/users.json`; passwords use salted scrypt hashes. This local data folder is ignored by Git. Sessions use HTTP-only cookies and are stored in memory, so users must sign in again after the API restarts. This API is for the class prototype; a deployed app needs a database, HTTPS, and persistent session storage.
