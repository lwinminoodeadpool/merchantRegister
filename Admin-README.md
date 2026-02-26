# Admin Portal Setup Guide

This folder contains two main projects:
1. `admin-api`: The AWS Lambda backend that connects to MongoDB.
2. `admin-frontend`: The React Vite application that displays the dashboard.

## Step 1: Deploy the Admin API to AWS Lambda
1. Go into the `admin-api` folder.
2. An `admin-api-function.zip` has already been generated for you. If you make changes to `index.js`, run your `zip -rq admin-api-function.zip .` command again.
3. Open AWS Console -> **Lambda** -> Create a **new** function named `AdminPortalApi` (Node.js 20.x).
4. Upload `admin-api-function.zip` to this new Lambda.
5. Set the following **Environment Variables** in the new Lambda:
   - `MONGODB_URI`: (Same as your merchant API)
   - `MONGODB_DB_NAME`: `merchant_db`
   - `JWT_SECRET`: (Whatever you want the admin secret to be)
   - `ADMIN_USERNAME`: (Choose your login, e.g., `admin`)
   - `ADMIN_PASSWORD`: (Choose your password, e.g., `password123`)

## Step 2: Create API Gateway for Admin
1. Open **API Gateway** -> Create an HTTP API (or REST API).
2. Create two routes pointing to your `AdminPortalApi` Lambda function:
   - `POST /login`
   - `GET /merchants`
3. Make sure **CORS** is configured to allow `*` (or your localhost origin) and headers `Authorization, Content-Type`.
4. Grab the **Invoke URL** of this API Gateway.

## Step 3: Run the Admin Frontend
1. Open `admin-frontend/src/components/LoginScreen.jsx` and `DashboardScreen.jsx`.
2. Find the line that says: `const API_URL = import.meta.env...`
3. Replace the fallback string with your NEW Admin API Gateway URL.
   * *Example:* `https://your-new-api.amazonaws.com/login` and `.../merchants`
4. In your terminal, run:
```bash
cd admin-frontend
npm run dev
```
5. Open `http://localhost:5173` (or `5174`), log in with your custom `ADMIN_USERNAME`, and view your MongoDB data!
