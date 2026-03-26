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
cd ContriibiaApp
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

We use the **Supabase CLI** to track and deploy database changes. This means every change to the database (new table, new function, etc.) is saved as a file in the `supabase/migrations/` folder and committed to git — so the whole team stays in sync.

> **Important:** Always run these commands from inside the `ContriibiaApp` folder.

---

### First-Time Setup (do this once)

You only need to do this once when you first clone the project or when setting up on a new machine.

#### Step 1 — Log in to Supabase

```bash
npx supabase login
```

This will open a browser window. Log in with the team Supabase account.

#### Step 2 — Initialize the Supabase folder (only if it doesn't exist yet)

```bash
npx supabase init
```

> Skip this if the `supabase/` folder already exists in the project.

#### Step 3 — Link to the development database

```bash
npx supabase link --project-ref alkuarsycuqhvwdqkmya
```

When prompted for a database password, ask the project owner.

#### Step 4 — Pull the current database schema

```bash
npx supabase db pull
```

This creates migration files in `supabase/migrations/` that capture the current state of the database. Commit these files to git.

---

### Making a Database Change

Whenever you need to add a table, change a column, or add a function:

#### Step 1 — Make your change

Make the change directly in the **Supabase Dashboard** on the development project, or write the SQL yourself.

#### Step 2 — Generate a migration file

```bash
npx supabase db diff --use-migra -f describe_your_change_here
```

Replace `describe_your_change_here` with a short name for your change, using underscores instead of spaces. Examples:
- `add_wallet_send_function`
- `add_notifications_table`
- `add_profile_avatar_column`

This creates a new file in `supabase/migrations/` with a timestamp and your name.

#### Step 3 — Review the file

Open the newly created file in `supabase/migrations/` and make sure it looks correct — it should contain only the SQL for the change you made.

#### Step 4 — Commit the migration file to git

```bash
git add supabase/migrations/
git commit -m "Add migration: describe_your_change_here"
git push
```

> Never delete or edit old migration files. They are a permanent history of all database changes.

---

### Deploying to Production

Once your changes are tested on the dev database and your migration file is committed, follow these steps to deploy to the production database.

> **Only do this when the feature is ready.** Do not deploy unfinished work to production.

#### Step 1 — Switch the link to the production database

```bash
npx supabase link --project-ref budfthcjotckvtgityhr
```

When prompted for a database password, ask the project owner for the **production** password.

#### Step 2 — Push all pending migrations

```bash
npx supabase db push
```

This applies any migration files that haven't been run on production yet. You will see output confirming which migrations were applied.

#### Step 3 — Switch back to development

```bash
npx supabase link --project-ref alkuarsycuqhvwdqkmya
```

Always switch back to dev after deploying so you don't accidentally run future changes on production.

---

### Pulling Changes a Teammate Made

If a teammate made a database change and pushed a new migration file, you need to apply it to your linked dev database.

#### Step 1 — Pull the latest code from git

```bash
git pull
```

#### Step 2 — Apply the new migrations

```bash
npx supabase db push
```

This will apply any new migration files from your teammates to your linked database.

---

## Project Structure

```
ContriibiaApp/
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
