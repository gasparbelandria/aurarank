# AuraRank

**Post. Get Rated. Build Your Aura.**

AuraRank is a social gaming platform where users post their best moments, the community rates them from 0 to 100, and everyone earns a global Aura Score. Think social media — but instead of likes, a number.

Live at: [aurarank.me](https://aurarank.me)

---

## What it is

- Post a photo, video clip, or YouTube link
- The community rates it with a slider from 0 to 100 — one rating per person, no take-backs
- Each post builds your **Aura Score** (average of all ratings received)
- Compete on **global and weekly leaderboards**
- Your public profile at `aurarank.me/@you` is built to be shared

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.3.2 (App Router, Turbopack) |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| Icons | Lucide React |
| Database | Supabase (PostgreSQL) |
| Storage | Supabase Storage (avatars, post-media) |
| Auth | Google OAuth 2.0 + JWT (httpOnly cookie) |
| Language | TypeScript |
| Fonts | Manrope + JetBrains Mono (Google Fonts) |
| Deployment | Vercel |

---

## Local Setup

### 1. Clone the repo

```bash
git clone https://github.com/your-username/aurarank.git
cd aurarank
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key — server only, never expose to client |
| `JWT_SECRET` | Random secret ≥ 32 characters for signing session tokens |
| `GOOGLE_CLIENT_ID` | OAuth client ID for server-side token validation |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Same value, exposed to the browser for Google Sign-In button |

### 4. Supabase — run migrations

Create the following tables in your Supabase SQL editor:

- `aura_users` — base user record (provider, email, avatar)
- `aura_usernames` — claimed handles and display names
- `aura_profiles` — bio, location, city
- `aura_posts` — posts with media, caption, aura_score, rating_count
- `aura_ratings` — one row per user per post
- `aura_follows` — follower / following relationships
- `aura_notifications` — rating, follow, and group invite events
- `aura_groups` — group name, country, city, owner
- `aura_group_members` — group membership
- `aura_group_invites` — pending invitations

Plus the error log table (required for crash logging to work):

```sql
CREATE TABLE aura_error_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  title TEXT NOT NULL,
  message TEXT,
  stack TEXT,
  section TEXT,
  user_id UUID REFERENCES aura_users(id) ON DELETE SET NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low','medium','high','critical')),
  source TEXT DEFAULT 'frontend' CHECK (source IN ('frontend','backend')),
  url TEXT,
  metadata JSONB DEFAULT '{}',
  resolved BOOLEAN DEFAULT false
);
CREATE INDEX ON aura_error_logs (created_at DESC);
CREATE INDEX ON aura_error_logs (priority);
CREATE INDEX ON aura_error_logs (section);
ALTER TABLE aura_error_logs ENABLE ROW LEVEL SECURITY;
```

### 5. Google OAuth

In [Google Cloud Console](https://console.cloud.google.com):
- Create an OAuth 2.0 Client ID (Web application)
- Add `http://localhost:3001` to **Authorized JavaScript origins**
- Add your production domain to both origins and redirect URIs

### 6. Run the dev server

```bash
npm run dev
```

> **Tip:** Port 3000 may be in use by another local service. The app defaults to **3001** in this setup. Access it at `http://localhost:3001`.

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages and API routes
│   ├── api/                # All backend endpoints
│   │   ├── auth/           # Google sign-in, JWT verify, logout, /me
│   │   ├── posts/          # Feed, create, delete, user posts
│   │   ├── ratings/        # Submit rating
│   │   ├── rankings/       # Global / weekly / friends aggregation
│   │   ├── follows/        # Follow / unfollow
│   │   ├── groups/         # Group creation, invites
│   │   ├── notifications/  # Read and mark notifications
│   │   ├── account/        # Account deletion cascade
│   │   └── errors/         # Crash log ingestion
│   ├── feed/               # For You feed page
│   ├── rankings/           # Leaderboard page
│   ├── create/             # Post creation
│   ├── [username]/         # Public profile pages
│   ├── groups/             # Groups hub
│   ├── account/delete/     # Account deletion flow
│   ├── terms/              # Terms of Service
│   ├── privacy/            # Privacy Policy
│   └── help/               # Help / levels explainer
├── components/
│   ├── layout/             # Sidebar, BottomNav, TopBar, RootProviders
│   ├── ui/                 # Button, Input, Avatar, Toast, Modal, Slider…
│   └── composed/           # PostCard, RatingModal, ClaimBanner…
├── hooks/                  # useCurrentUser, useI18n, useAuthGuard…
└── lib/
    ├── supabase.ts          # Supabase client (server-side only)
    ├── jwt.ts               # Sign / verify JWT
    ├── logger.ts            # logError (client) + logServerError (server)
    ├── rate-limit.ts        # In-memory rate limiter
    ├── aura-utils.ts        # Score formatting, level calculation
    └── i18n/               # en.ts / es.ts translation dictionaries
```

---

## What's Built

- Google Sign-In with JWT session via httpOnly cookie
- Username claim flow with reserved word protection
- Post creation: photo upload with crop + aspect ratio, YouTube embed with frame capture
- Infinite scroll feed with category filters and Following tab
- 0–100 aura rating — one per user per post, no edits
- Aura Score and level system: NPC → Rookie → Rising → Farmer → Elite → Legendary
- Global, weekly, and friends leaderboards (top 50 + your position)
- Public profile pages at `/@username` with post grid
- Avatar upload and profile editing (bio, city, country, neighborhood)
- Follow / unfollow with notifications
- Groups: create, invite members, manage
- In-app notification center (ratings, follows, group invites)
- Account deletion with full cascade and Supabase Storage cleanup
- i18n: English and Spanish
- SEO: dynamic OG image (edge-rendered), sitemap.xml, robots.txt, full metadata + keywords
- Security: CSP, HSTS, X-Frame-Options, Referrer-Policy, rate limiting on all endpoints
- Crash logger: frontend + backend errors stored in `aura_error_logs` with priority classification
- Global error boundary with auto-reporting

---

## What's Next (Phase 2)

- **Payments** — Stripe integration for subscriptions or one-time unlocks
- **PWA** — installable app with offline support
- **Admin dashboard** — review error logs, moderate content, analytics
- **Tests** — Vitest (unit) + Playwright (e2e)
- **ISR / cache** — incremental static regeneration for profiles and posts
- **CI/CD** — GitHub Actions: type-check and lint on every PR
- **Video uploads** — direct MP4/MOV support (currently YouTube only)

---

## License

Private. All rights reserved.
