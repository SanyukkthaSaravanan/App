# Deploying Flaire (Pilot — Option A)

**Architecture:** frontend on **Vercel**, backend on **Render**, database on **Supabase**.

> The live desktop camera scanner (`/api/ocr/scan-live`) only works locally — it
> needs a physical camera + the Python process. In the deployed app the "Scan
> medication" button shows **"Desktop only"** and users enter meds manually. Everything
> else (auth, tracking, insights, Whisper STT) works in the cloud.

---

## 0. One-time prep (already done in the repo)
- ✅ `server/tsconfig.json` builds to `dist/index.js` (so `npm start` works)
- ✅ `.gitignore` excludes `node_modules`, `dist`, and all `.env` files
- ✅ `server/.env` removed from git tracking (secrets no longer committed)
- ✅ `vercel.json` (frontend) and `render.yaml` (backend) added
- ✅ Live scanner auto-disabled in production builds

> ⚠️ Your Supabase **service_role key** and **JWT secret** were previously committed
> to git history. Before making the repo public, rotate them:
> Supabase → Settings → API → "Reset service_role"; and pick a new `JWT_SECRET`.

## 1. Push to GitHub
```bash
git add -A
git commit -m "Prepare for Vercel + Render deploy"
git push
```
(Create a GitHub repo first if you haven't: `gh repo create` or via github.com.)

## 2. Backend → Render
1. [dashboard.render.com](https://dashboard.render.com) → **New** → **Blueprint** → connect this repo.
2. Render reads `render.yaml` and creates the **flaire-api** service (root = `server/`).
3. Set the secret env vars (marked `sync: false`):
   | Key | Value |
   |-----|-------|
   | `SUPABASE_URL` | `https://ssuliljulxdtgrtwhrvs.supabase.co` |
   | `SUPABASE_SERVICE_ROLE_KEY` | your (rotated) service_role key |
   | `JWT_SECRET` | a long random string |
   | `OPENAI_API_KEY` | your OpenAI key (or leave blank) |
   | `CORS_ORIGIN` | *(fill in after step 3 — your Vercel URL)* |
4. Deploy. Note the URL, e.g. `https://flaire-api.onrender.com`. Check `…/api/health` returns `{"ok":true}`.

## 3. Frontend → Vercel
1. [vercel.com/new](https://vercel.com/new) → import this repo. It auto-detects Vite via `vercel.json`.
2. Add an Environment Variable:
   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | your Render URL from step 2, e.g. `https://flaire-api.onrender.com` |
3. Deploy. Note the URL, e.g. `https://flaire.vercel.app`.

## 4. Wire CORS (the step everyone forgets)
Back in **Render** → flaire-api → Environment, set:
```
CORS_ORIGIN = https://flaire.vercel.app
```
Save (Render redeploys). Without this, the browser blocks the frontend's API calls.

## 5. Verify
- Open the Vercel URL → sign up → log in → add a medication.
- If login fails with "Cannot reach the database", your Supabase project is paused — restore it in the Supabase dashboard.

---

## Free-tier gotchas (fine for a pilot)
- **Render free** spins the backend down after ~15 min idle → first request takes ~30–50s to wake.
- **Supabase free** pauses after ~1 week idle → restore from the dashboard.
- Tell pilot testers the first load after a quiet period may be slow.

## Local development (unchanged)
```bash
# terminal 1 — backend
cd server && npm run dev        # http://localhost:4000

# terminal 2 — frontend
npm run dev                     # http://localhost:5173
```
The live camera scanner works locally because the backend runs on your machine.
