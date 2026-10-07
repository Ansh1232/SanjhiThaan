# Saadh Sangat

Saadh Sangat helps Sikh students and professionals find Gurudwara programmes in their city, read the daily Hukamnama, and keep private reflections.

## Run locally

1. Configure `server/.env` from `server/.env.example`. Set `MONGO_URI`, `JWT_SECRET`, and `CLIENT_ORIGIN`. The server checks required values before it starts; keep the actual values in the ignored `.env` file.
2. In a terminal, install and prepare the backend:

   ```powershell
   cd server
   npm install
   npm run dev
   ```

   To grant administrator access, set `isAdmin: true` for the account in MongoDB. Signup does not grant administrator access.

3. In a second terminal, start the frontend:

   ```powershell
   cd client
   npm install
   npm run dev
   ```

The Vite development server runs at `http://127.0.0.1:3000`; the API runs at `http://127.0.0.1:5000`.

## Deploy

The client is deployed from `client/` on Vercel and the API from `server/` on Render. `render.yaml` defines the API service, health check, and required environment variables. Keep all secret values in the Render environment settings.

1. Create the API service from the Render Blueprint. Set `MONGO_URI`; Render generates `JWT_SECRET`. Set `CLIENT_ORIGIN` temporarily to `https://example.invalid` so the API can deploy before the client URL is known.
2. Create a Vercel project from this repository with `client/` as its Root Directory. Set `VITE_API_URL` to the deployed Render API URL followed by `/api`, then deploy. The `vercel.json` rewrite supports direct navigation to app routes.
3. Set Render's `CLIENT_ORIGIN` to the Vercel production URL and redeploy the API. In Atlas Network Access, allow the outbound IP ranges shown for the Render service's region.
4. Create an account through signup, then set that account's `isAdmin` field to `true` in MongoDB Atlas. Sign in again to access admin features. Confirm `/api/health` and try adding a listing.

The Render free service may sleep after 15 minutes without traffic; its first request after sleeping can take about a minute to wake.

## Pages

- `/` — guest landing page when signed out; dashboard when signed in
- `/sessions` — signed-in city-filtered sangat directory
- `/hukamnama` — daily Hukamnama, available without sign-in, with previous-day fallback when today's entry is not available
- `/notes` — private reflections, available only to signed-in users
- `/settings` — update your name and home city
- `/admin` — administer accounts and add directory listings; available only when the account has `isAdmin: true`
- `/login` and `/signup` — account access

Sangat listings are read from MongoDB through the API; there are no client demo records. Signup does not grant administrator access. An account with `isAdmin: true` can manage accounts and create listings through server-protected routes.
