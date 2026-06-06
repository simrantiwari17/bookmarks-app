# Bookmarks App

A small personal bookmark manager — linktree meets pocket. Save links privately, share a curated public page at `/@handle`.

## Features

- **Accounts** — Email + password sign-up and login (Supabase Auth)
- **Welcome email** — Sent via Resend on sign-up
- **Bookmarks** — Add, edit, delete bookmarks (title, URL, public/private)
- **Privacy** — Row Level Security in Supabase; server actions always scope by `user_id`
- **Public profile** — Unique `@handle` at `/<handle>` (public bookmarks only)
- **Dashboard** — Protected route for signed-in users

## Stack

- [Next.js 16](https://nextjs.org) (App Router, TypeScript)
- [Supabase](https://supabase.com) — auth + Postgres + RLS
- [Resend](https://resend.com) — transactional email
- [Vercel](https://vercel.com) — deployment

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run the schema in [`supabase/schema.sql`](supabase/schema.sql).
3. Copy **Project URL**, **anon key**, and **service role key** from **Project Settings → API**.
4. Under **Authentication → Providers**, ensure **Email** is enabled.

### 2. Resend

1. Create an account at [resend.com](https://resend.com).
2. Create an API key.
3. For local testing, use the default `onboarding@resend.dev` sender (delivers only to your Resend account email).
4. For production, verify a domain and set `RESEND_FROM_EMAIL`.

### 3. Environment variables

Copy the example file and fill in your keys:

```bash
cp .env.example .env.local
```

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server only — never expose to client) |
| `RESEND_API_KEY` | Resend API key |
| `RESEND_FROM_EMAIL` | Optional sender address |
| `NEXT_PUBLIC_APP_URL` | App base URL (`http://localhost:3000` locally) |

### 4. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import the project at [vercel.com/new](https://vercel.com/new).
3. Add the same environment variables from `.env.local` in **Project Settings → Environment Variables**.
4. Set `NEXT_PUBLIC_APP_URL` to your production URL (e.g. `https://your-app.vercel.app`).
5. Deploy.

Or use the CLI:

```bash
npx vercel
```

## Security model

- **Database**: RLS policies on `profiles` and `bookmarks` enforce ownership at the Postgres layer.
- **Server actions**: Bookmark mutations require an authenticated session and filter by `user_id`.
- **Middleware**: `/dashboard` and `/setup-profile` redirect unauthenticated visitors to `/login`.
- **Public reads**: Only bookmarks with `is_public = true` are visible to others (via RLS and explicit filters on the profile page).

## Project structure

```
src/
  app/
    [handle]/          # Public profile page
    auth/actions.ts    # Sign up, login, logout
    dashboard/         # Protected bookmark CRUD
    setup-profile/     # Claim @handle
    login/ signup/     # Auth pages
  lib/constants.ts     # Reserved handles
  utils/supabase/      # Supabase clients + session middleware
supabase/schema.sql    # Database schema + RLS
```
