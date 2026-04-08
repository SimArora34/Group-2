# Contribiia App

A React Native mobile app built with Expo and Supabase.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Environment Setup](#environment-setup)
- [Running the App](#running-the-app)
- [Database Migrations (Supabase)](#database-migrations-supabase)
  - [First-Time Setup](#first-time-setup-do-this-once)
  - [Making a Database Change](#making-a-database-change)
  - [Deploying to Production](#deploying-to-production)
  - [Pulling Changes a Teammate Made](#pulling-changes-a-teammate-made)

---

## Getting Started

### Prerequisites

Make sure you have the following installed before you begin:

- [Node.js](https://nodejs.org/) (version 18 or higher)
- [Git](https://git-scm.com/)
- A phone with the **Expo Go** app installed, or an Android/iOS emulator

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd ContribiiaApp
```

### 2. Install dependencies

```bash
npm install
```

---

## Environment Setup

The app needs a `.env` file to connect to Supabase. This file is **not committed to git** for security reasons.

1. Copy the example file:

```bash
cp .env.example .env
```

2. Ask a teammate for the correct `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` values and fill them in.

> The **DEVELOP** keys are for day-to-day development. The **PRODUCTION** keys are only used when deploying.

---

## Running the App

```bash
npx expo start
```

Then:
- Press **`a`** to open on Android emulator
- Press **`i`** to open on iOS simulator
- Scan the **QR code** with the Expo Go app on your phone

If you see a blank screen or cache issues, restart with a clean cache:

```bash
npx expo start --clear
```

---

## Database Migrations (Supabase)

We use the **Supabase CLI** to track and deploy database changes. Every change to the database (new table, new function, etc.) is saved as a `.sql` file in the `supabase/migrations/` folder and committed to git — so the whole team stays in sync.

> **Note:** We write migration files manually. This means **Docker is not required** for our workflow.

> **Important:** The `supabase/` folder lives at the **root of the repo** (next to `ContribiiaApp/`), not inside it. Run migration commands from the repo root.

---

### First-Time Setup (do this once)

You only need to do this once when you first clone the project or when setting up on a new machine.

#### Step 1 — Log in to Supabase

```bash
npx supabase login
```

This will open a browser window. Log in with the team Supabase account.

> You can also get an access token from https://supabase.com/dashboard/account/tokens and run:
> `npx supabase login --token YOUR_TOKEN_HERE`

#### Step 2 — Link to the development database

Run this from the **repo root** (the `Group-2` folder):

```bash
npx supabase link --project-ref alkuarsycuqhvwdqkmya
```

When prompted for a database password, ask the project owner.

---

### Making a Database Change

Whenever you need to add a table, change a column, or add a function:

#### Step 1 — Make your change in the Supabase Dashboard

Go to the **dev project** on https://supabase.com and make your change using the Table Editor or SQL Editor.

#### Step 2 — Create a migration file manually

Create a new `.sql` file in `supabase/migrations/`. The filename must start with a timestamp (`YYYYMMDDHHMMSS`) so migrations always run in order.

**Example filename:**
```
supabase/migrations/20260326120000_add_notifications_table.sql
```

Use the current date and time for the numbers. A few more examples:
- `20260326120000_add_notifications_table.sql`
- `20260326130000_add_profile_avatar_column.sql`
- `20260326140000_add_wallet_send_function.sql`

#### Step 3 — Write the SQL in that file

Open the file you just created and paste in the SQL for your change. For example:

```sql
-- Migration: add_notifications_table
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  message text,
  created_at timestamptz DEFAULT now()
);
```

#### Step 4 — Commit the migration file to git

```bash
git add supabase/migrations/
git commit -m "Add migration: add_notifications_table"
git push
```

> **Never delete or edit old migration files.** They are the permanent history of all database changes.

---

### Deploying to Production

Once your changes are tested on dev and your migration file is committed, deploy to production.

> **Only do this when the feature is ready.** Do not deploy unfinished work to production.

#### Step 1 — Link to the production database

```bash
npx supabase link --project-ref budfthcjotckvtgityhr
```

When prompted for a database password, ask the project owner for the **production** password.

#### Step 2 — Push all pending migrations

```bash
npx supabase db push
```

This runs any migration files that haven't been applied to production yet. You will see output confirming which files were applied.

#### Step 3 — Switch back to development

```bash
npx supabase link --project-ref alkuarsycuqhvwdqkmya
```

Always switch back to dev after deploying so you don't accidentally affect production next time.

---

### Applying a Teammate's Database Changes

If a teammate added a new migration file and pushed it to git, you need to apply it to the dev database.

#### Step 1 — Pull the latest code

```bash
git pull
```

#### Step 2 — Apply the new migrations

```bash
npx supabase db push
```

This runs any migration files your teammate added that haven't been applied to your linked database yet.

---

## Project Structure

```
ContribiiaApp/
├── app/                  # All screens (file-based routing via Expo Router)
│   ├── (auth)/           # Login, Signup screens
│   ├── (tabs)/           # Main tab screens (Home, Wallet, etc.)
│   └── (wallet)/         # Wallet sub-screens
├── components/           # Reusable UI components
├── constants/            # Colors, config values
├── src/
│   └── services/         # Supabase API calls (auth, wallet, profile, etc.)
├── supabase/
│   └── migrations/       # Database migration files — commit these to git
├── .env                  # Your local environment variables — do NOT commit
├── .env.example          # Template for .env — safe to commit
└── README.md
```

---

## Need Help?

- Expo docs: https://docs.expo.dev
- Supabase CLI docs: https://supabase.com/docs/reference/cli
- Ask in the group chat
