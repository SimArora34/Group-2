# Contribiia App — Client Handover Documentation

**Version:** 1.0.0  
**Date:** April 10, 2026  
**Prepared by:** Group 2 — Capstone Project

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Getting Started](#3-getting-started)
4. [Project Structure](#4-project-structure)
5. [App Features & Screens](#5-app-features--screens)
6. [Navigation Architecture](#6-navigation-architecture)
7. [Backend & Database](#7-backend--database)
8. [Services Layer (API)](#8-services-layer-api)
9. [Data Types](#9-data-types)
10. [Reusable Components](#10-reusable-components)
11. [Design System](#11-design-system)
12. [Utilities](#12-utilities)
13. [Environment Variables](#13-environment-variables)
14. [Database Migrations](#14-database-migrations)
15. [Deployment & Build](#15-deployment--build)
16. [Known Limitations & Notes](#16-known-limitations--notes)
17. [Key Project References](#17-key-project-references)

---

## 1. Project Overview

**Contribiia** is a cross-platform mobile application (iOS, Android, and Web) that enables users to participate in savings circles (also known as contribution clubs). Users can pool funds together in groups, manage a digital wallet, send/receive money, link bank accounts and payment cards, and track their credit score — all within a single app.

The app is designed for the Canadian market, with built-in support for Canadian phone number formatting, postal codes, provinces, and Canadian banking institutions.

### Core Value Propositions

- **Savings Circles (Clubs):** Users create or join public/private savings groups with defined contribution amounts and rotating payouts.
- **Digital Wallet:** Deposit, withdraw, and send money peer-to-peer.
- **Identity Verification:** KYC flow with document upload and bank account linking.
- **Card Management:** Add, freeze, and manage personal and business payment cards.
- **Credit Score Tracking:** View and monitor credit score (screen available in tabs).

---

## 2. Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | React Native (Expo) | Expo SDK 54, RN 0.81.5 |
| **Language** | TypeScript (strict mode) | 5.9.2 |
| **Routing** | Expo Router (file-based) | 6.0.23 |
| **Backend** | Supabase (PostgreSQL + Auth + RLS) | Client SDK 2.98.0 |
| **Database** | PostgreSQL | v17 |
| **State/Storage** | AsyncStorage (native), localStorage (web) | 2.2.0 |
| **Animations** | React Native Reanimated | 4.1.1 |
| **Gestures** | React Native Gesture Handler | 2.28.0 |
| **Linting** | ESLint with Expo config | 9.25.0 |

### Key Dependencies

| Package | Purpose |
|---------|---------|
| `@supabase/supabase-js` | Backend client for auth, database, and storage |
| `expo-router` | File-based navigation |
| `expo-image-picker` | Document/photo upload for verification |
| `expo-file-system` | File management for uploads |
| `expo-haptics` | Haptic feedback on actions |
| `expo-clipboard` | Copy-to-clipboard functionality |
| `base64-arraybuffer` | Image encoding for Supabase storage |
| `react-native-safe-area-context` | Safe area handling across devices |
| `react-native-screens` | Native screen optimization |

---

## 3. Getting Started

### Prerequisites

- **Node.js** v18 or later
- **npm** (included with Node.js)
- **Git**
- **Expo Go** app on your mobile device, OR an Android/iOS emulator
- **Supabase CLI** (optional, for database management): `npm install -g supabase`

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd Group-2

# 2. Install root dependencies (Supabase CLI)
npm install

# 3. Install app dependencies
cd ContribiiaApp
npm install

# 4. Set up environment variables
#    Copy the example env file and fill in your Supabase credentials
cp .env.example .env
```

### Environment File (`.env`)

```
EXPO_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

### Running the App

```bash
# Start the development server
npx expo start

# Platform-specific:
npx expo start --android    # Android emulator
npx expo start --ios        # iOS simulator
npx expo start --web        # Web browser
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo development server |
| `npm run android` | Build and run on Android |
| `npm run ios` | Build and run on iOS |
| `npm run web` | Start web version |
| `npm run lint` | Run ESLint checks |
| `npm run reset-project` | Reset project to clean state |

---

## 4. Project Structure

```
Group-2/
├── package.json                    # Root: Supabase CLI dependency
├── tsconfig.json                   # Root TypeScript config
├── supabase/                       # Supabase project config & migrations
│   ├── config.toml                 # Local Supabase settings
│   └── migrations/                 # Database migration files
│       ├── 20260325000000_current_state.sql
│       └── 20260409000000_add_circles.sql
│
└── ContribiiaApp/                  # Main application
    ├── app.json                    # Expo app configuration
    ├── package.json                # App dependencies & scripts
    ├── tsconfig.json               # TypeScript strict config
    ├── eslint.config.js            # Linter configuration
    │
    ├── app/                        # Screens (file-based routing)
    │   ├── _layout.tsx             # Root stack navigator
    │   ├── index.tsx               # Entry/splash screen
    │   ├── edit-profile.tsx        # Profile editing
    │   ├── settings.tsx            # App settings
    │   ├── billing-address.tsx     # Billing address form
    │   ├── (onboarding)/           # Onboarding slides
    │   ├── (auth)/                 # Authentication flow
    │   ├── (verification)/         # KYC & identity verification
    │   ├── (tabs)/                 # Main tab navigation
    │   ├── (clubs)/                # Savings circles management
    │   └── (wallet)/               # Wallet operations
    │
    ├── components/                 # Reusable UI components
    │   ├── AppIcon.tsx             # Icon wrapper component
    │   ├── Button.tsx              # Standard button
    │   ├── ClubCard.tsx            # Club/circle card display
    │   ├── Input.tsx               # Text input component
    │   ├── JoinClubFlow.tsx        # Club joining wizard
    │   ├── Logo.tsx                # App logo component
    │   ├── ScreenHeader.tsx        # Screen header with back nav
    │   └── SelectModal.tsx         # Dropdown/selection modal
    │
    ├── constants/
    │   └── Colors.ts               # Design system color palette
    │
    ├── data/
    │   └── mockData.json           # Mock/demo data for development
    │
    ├── src/
    │   ├── lib/
    │   │   └── supabaseClient.ts   # Supabase client initialization
    │   ├── services/               # Business logic & API calls
    │   │   ├── authService.ts
    │   │   ├── bankAccountService.ts
    │   │   ├── cardService.ts
    │   │   ├── cashAdvanceService.ts
    │   │   ├── circleService.ts
    │   │   ├── clubEventService.ts
    │   │   ├── profileService.ts
    │   │   ├── transactionService.ts
    │   │   └── walletService.ts
    │   ├── stores/                 # State management (reserved)
    │   ├── types/
    │   │   └── index.ts            # TypeScript type definitions
    │   └── utils/
    │       ├── validation.ts       # Input validation & formatting
    │       └── rotation.ts         # Payout rotation logic
    │
    ├── assets/
    │   └── images/                 # App icons, logos, splash screens
    │
    └── android/                    # Android native build files
        ├── build.gradle
        ├── app/build.gradle
        └── ...
```

---

## 5. App Features & Screens

### 5.1 Onboarding (`(onboarding)/`)

| Screen | Description |
|--------|-------------|
| `index.tsx` | Swipeable intro slides: pooling funds, credit score tracking, security, wallet hub |

### 5.2 Authentication (`(auth)/`)

| Screen | Description |
|--------|-------------|
| `index.tsx` | Auth entry/landing |
| `login.tsx` | Email & password login |
| `signup.tsx` | New user registration |
| `forgot-password.tsx` | Password reset request |
| `email-sent.tsx` | Email sent confirmation |
| `verify-code.tsx` | OTP verification |
| `set-password.tsx` | New password entry |
| `password-success.tsx` | Password reset success |
| `terms.tsx` | Terms & conditions |

### 5.3 Identity Verification / KYC (`(verification)/`)

| Screen | Description |
|--------|-------------|
| `setup-overview.tsx` | Overview of verification steps |
| `legal-name.tsx` | Legal name, DOB, gender collection |
| `address.tsx` | Home address entry |
| `identity-intro.tsx` | ID verification introduction |
| `document-select.tsx` | Choose ID type (passport, driver's license, health card) |
| `document-upload/` | Upload ID document photos |
| `document-confirm/` | Confirm uploaded documents |
| `document-upload-2.tsx` | Secondary document upload |
| `identity-complete.tsx` | Identity verification complete |
| `bank-intro.tsx` | Bank linking introduction |
| `bank-select.tsx` | Select Canadian bank (BMO, Scotiabank, TD, CIBC, CWB, HSBC) |
| `bank-account-type.tsx` | Choose account type (savings/current) |
| `bank-manual.tsx` | Manual bank account entry |
| `bank-portal.tsx` | Bank portal integration |
| `bank-2fa.tsx` | Bank two-factor authentication |
| `bank-success.tsx` | Bank linking success |
| `complete.tsx` | Full verification complete |

### 5.4 Main Tabs (`(tabs)/`)

| Tab | Screen | Description |
|-----|--------|-------------|
| Home | `DashboardScreen.tsx` | Main dashboard with balance overview and activity |
| Wallet | `wallet.tsx` | Wallet balance, cards, and quick actions |
| Credit Score | `credit-score.tsx` | Credit score display and tracking |
| Profile | `profile.tsx` | User profile and account settings |

Hidden tab screens (accessible but not shown in tab bar):
- `clubs.tsx` — Clubs list accessed from dashboard
- `index.tsx` — Tab index redirect

### 5.5 Savings Circles / Clubs (`(clubs)/`)

| Screen | Description |
|--------|-------------|
| `clubs.tsx` | Browse and search clubs |
| `create-club.tsx` | Create a new savings circle |
| `edit-club.tsx` | Edit existing circle settings |
| `club-details.tsx` | View club details before joining |
| `club-overview.tsx` | Full overview of a joined club |
| `club-members.tsx` | View all members in a club |
| `member-profile.tsx` | View a specific member's profile |
| `member-agreement.tsx` | Club membership agreement |
| `joined-club.tsx` | Post-join confirmation |
| `club-confirmation.tsx` | Club action confirmations |
| `contribution-success.tsx` | Successful contribution confirmation |
| `recipient.tsx` | Current payout recipient details |
| `cash-advance.tsx` | Request a cash advance against contributions |
| `cash-advance-report.tsx` | View cash advance history |

### 5.6 Wallet Operations (`(wallet)/`)

| Screen | Description |
|--------|-------------|
| `add-money.tsx` | Add money to wallet |
| `withdraw-money.tsx` | Withdraw from wallet |
| `send-money.tsx` | P2P money transfer |
| `confirm-send.tsx` | Confirm P2P transfer |
| `confirmation.tsx` | Transaction confirmation |
| `transaction-history.tsx` | Full transaction log |
| `add-new-card.tsx` | Add a new payment card |
| `view-my-cards.tsx` | View and manage cards |
| `freeze-card.tsx` | Freeze/unfreeze a card |
| `billing-address.tsx` | Update card billing address |
| `manage-accounts.tsx` | Manage linked bank accounts |
| `setup-auto-load.tsx` | Auto-load wallet settings |
| `generate-invoice.tsx` | Generate payment invoice |
| `invoice-send-user.tsx` | Send invoice to another user |
| `qr-code.tsx` | QR code for receiving payments |
| `tap-to-pay.tsx` | NFC tap-to-pay |
| `biometrics.tsx` | Biometric authentication settings |
| `more.tsx` | Additional wallet options |

### 5.7 Standalone Screens

| Screen | Description |
|--------|-------------|
| `edit-profile.tsx` | Edit user profile details |
| `settings.tsx` | App settings |
| `billing-address.tsx` | Billing address management |

---

## 6. Navigation Architecture

The app uses **Expo Router** with file-based routing. Navigation is organized as a root `Stack` navigator containing route groups:

```
Root Stack (_layout.tsx)
│
├── index (Entry / Splash)
├── (onboarding) — Stack
│   └── Onboarding slides
├── (auth) — Stack
│   └── Login → Signup → Forgot Password → Verify → Set Password
├── (verification) — Stack
│   └── Setup Overview → Legal Name → Address → Document Upload → Bank Linking → Complete
├── (tabs) — Bottom Tab Navigator
│   ├── Home (DashboardScreen)
│   ├── Wallet
│   ├── Credit Score
│   └── Profile
├── (clubs) — Stack
│   └── Browse → Details → Create/Join → Overview → Members → Cash Advance
└── (wallet) — Stack
    └── Add Money → Withdraw → Send → Cards → History → Invoices → QR
```

**Default animation:** Slide from right  
**Tab bar:** 4 visible tabs — Home, Wallet, Credit Score, Profile  

---

## 7. Backend & Database

### 7.1 Supabase Overview

The app uses **Supabase** as its backend-as-a-service, providing:

- **Authentication:** Email/password with OTP-based password reset
- **PostgreSQL Database:** Managed, with Row Level Security (RLS)
- **Realtime:** Enabled for live data updates
- **Storage:** For document uploads (KYC)

### 7.2 Database Schema

#### Tables

| Table | Description | Key Fields |
|-------|-------------|------------|
| `profiles` | User profiles, auto-created on signup | `id` (FK to auth.users), `full_name`, `email`, `username`, addresses, verification fields |
| `wallets` | One wallet per user | `id`, `user_id`, `balance` |
| `transactions` | All deposit/withdrawal records | `id`, `user_id`, `wallet_id`, `amount`, `type` (deposit/withdraw) |
| `cards` | Payment cards (last 4 digits only) | `id`, `user_id`, `holder_name`, `last4`, `expiry`, `type`, `is_frozen`, `is_default` |
| `bank_accounts` | Linked bank accounts | `id`, `user_id`, `account_number`, `bank_name`, `account_type` |
| `circles` | Savings circles/clubs | `id`, `name`, `owner_id`, `contribution_amount`, `visibility`, `total_members` |
| `circle_members` | Club membership join table | `id`, `circle_id`, `user_id`, `joined_at` |

#### Entity Relationships

```
auth.users (Supabase Auth)
    │
    └──> profiles (1:1)
            │
            ├──> wallets (1:1)
            │       │
            │       └──> transactions (1:many)
            │
            ├──> cards (1:many)
            │
            ├──> bank_accounts (1:many)
            │
            ├──> circles (1:many, as owner)
            │
            └──> circle_members (many:many via join)
                    │
                    └──> circles
```

### 7.3 Database Functions (RPCs)

| Function | Description |
|----------|-------------|
| `wallet_deposit(p_amount)` | Adds funds to the calling user's wallet and creates a deposit transaction |
| `wallet_withdraw(p_amount)` | Deducts funds (with balance check) and creates a withdrawal transaction |
| `wallet_send(p_recipient_email, p_amount)` | Peer-to-peer transfer: withdraws from sender, deposits to recipient |
| `handle_new_user()` | Trigger function: auto-creates a profile and wallet when a new user signs up |

### 7.4 Row Level Security (RLS)

All tables have RLS enabled. Key policies:

- **Profiles:** Users can only read and update their own profile
- **Wallets:** Users can only read their own wallet
- **Transactions:** Users can only view their own transactions
- **Cards:** Users can only CRUD their own cards
- **Bank Accounts:** Users can only CRUD their own accounts
- **Circles:** Public circles are visible to all; private circles visible only to members; only owners can update/delete
- **Circle Members:** Members can view co-members; users can join circles; only owners can remove members

### 7.5 Security Notes

- **Wallet operations** are exclusively handled via `security definer` RPC functions — the client never directly updates wallet balances
- **Card numbers** are never stored in full; only the last 4 digits are retained for display
- The **anonymous key** used client-side only permits operations allowed by RLS policies
- **OTP-based** password reset (not magic links)

---

## 8. Services Layer (API)

All backend communication is encapsulated in service modules under `src/services/`. Each service uses the shared Supabase client from `src/lib/supabaseClient.ts`.

### 8.1 Auth Service (`authService.ts`)

| Function | Parameters | Description |
|----------|-----------|-------------|
| `signUp` | `email, password, fullName` | Register new user; sets full_name in metadata |
| `signIn` | `email, password` | Login with email/password |
| `signOut` | — | Logout current user |
| `resetPassword` | `email` | Send OTP for password reset |
| `verifyOtp` | `email, token` | Verify OTP token |
| `updatePassword` | `newPassword` | Set new password after OTP verification |

### 8.2 Wallet Service (`walletService.ts`)

| Function | Parameters | Description |
|----------|-----------|-------------|
| `getWallet` | — | Fetch current user's wallet and balance |
| `getTransactions` | — | Get transaction history (newest first) |
| `deposit` | `amount` | Add funds via `wallet_deposit` RPC |
| `withdraw` | `amount` | Remove funds via `wallet_withdraw` RPC (balance-checked) |
| `sendMoney` | `recipientEmail, amount` | P2P transfer via `wallet_send` RPC |
| `lookupUserByEmail` | `email` | Search for a user by email address |

### 8.3 Profile Service (`profileService.ts`)

| Function | Parameters | Description |
|----------|-----------|-------------|
| `getProfile` | `userId` | Get any user's profile by ID |
| `getCurrentProfile` | — | Get authenticated user's profile (with auth metadata fallback) |
| `updateCurrentProfile` | `updates` | Update profile fields and auth metadata |
| `saveVerificationInfo` | `legalName, dob, gender` | Save KYC identity information |
| `saveAddress` | `address fields` | Save home/verification address |

### 8.4 Circle Service (`circleService.ts`)

| Function | Parameters | Description |
|----------|-----------|-------------|
| `createCircle` | `name, amount, visibility, totalMembers` | Create a new savings circle |
| `getPublicCircles` | — | List all public circles |
| `getUserCircles` | `userId?` | Get circles the user is a member of |
| `getPrivateUserCircles` | — | Filter to private circles only |
| `getJoinedPublicCircles` | — | Filter to public circles only |
| `joinCircle` | `circleId, userId?` | Join a circle as a member |

### 8.5 Card Service (`cardService.ts`)

| Function | Parameters | Description |
|----------|-----------|-------------|
| `getCards` | — | Get all cards for the authenticated user |
| `getDefaultCard` | `type` | Get the default card (personal or business) |
| `addCard` | `card details` | Add a new payment card |
| `updateCard` | `id, updates` | Update card properties (freeze, default, etc.) |
| `deleteCard` | `id` | Delete a card |

### 8.6 Bank Account Service (`bankAccountService.ts`)

| Function | Parameters | Description |
|----------|-----------|-------------|
| `getBankAccounts` | — | Get all bank accounts for the user |
| `getDefaultBankAccount` | — | Get the primary bank account |
| `addBankAccount` | `account details` | Add a new bank account |
| `deleteBankAccount` | `id` | Delete a bank account |

### 8.7 Cash Advance Service (`cashAdvanceService.ts`)

| Function | Parameters | Description |
|----------|-----------|-------------|
| `requestCashAdvance` | `amount, details` | Submit a cash advance request |
| `getMyCashAdvances` | — | Get all cash advance requests |
| `getCashAdvanceById` | `id` | Get a specific cash advance |

### 8.8 Club Event Service (`clubEventService.ts`)

| Function | Parameters | Description |
|----------|-----------|-------------|
| `getLatestContributionForCurrentUser` | `circleId` | Get most recent contribution to a circle |
| `getLatestPayoutForCurrentUser` | `circleId` | Get most recent payout from a circle |
| `makeContribution` | `circleId, amount` | Record a contribution to a circle |

### 8.9 Transaction Service (`transactionService.ts`)

| Function | Parameters | Description |
|----------|-----------|-------------|
| `getUserTransactions` | `userId` | Get transactions for a specific user |
| `getCurrentUserTransactions` | — | Get transactions for the authenticated user |

---

## 9. Data Types

All TypeScript types are defined in `src/types/index.ts`:

```typescript
type UUID = string;

interface Profile {
  id, full_name, email, username, phone, created_at,
  // Verification: legal_name, date_of_birth, gender
  // Home address: address_line1, address_line2, city, province, postal_code
  // Personal billing: personal_addr1, personal_city, personal_province, personal_postal
  // Business billing: business_addr1, business_city, business_province, business_postal
}

interface Wallet       { id, user_id, balance, created_at }
interface Transaction  { id, user_id, wallet_id, amount, type('deposit'|'withdraw'), created_at }
interface Card         { id, user_id, holder_name, last4, expiry, type('personal'|'business'),
                         bank_name, is_frozen, is_default, billing_address fields, created_at }
interface BankAccount  { id, user_id, account_number, bank_name,
                         account_type('SAVINGS'|'CURRENT'), is_default, created_at }
interface Circle       { id, name, owner_id, contribution_amount,
                         visibility('public'|'private'), total_members, created_at }
interface CircleMember { id, circle_id, user_id, joined_at }

// Standard API response wrapper
interface ServiceResponse<T> { success, data?, error? }
```

---

## 10. Reusable Components

Located in `ContribiiaApp/components/`:

| Component | Purpose |
|-----------|---------|
| `AppIcon.tsx` | Icon wrapper using Expo vector icons (Ionicons) |
| `Button.tsx` | Styled button with primary/secondary/disabled states |
| `Input.tsx` | Text input with label, validation, and error display |
| `ScreenHeader.tsx` | Screen header with back navigation and title |
| `Logo.tsx` | App logo rendering |
| `ClubCard.tsx` | Card component displaying club/circle information |
| `JoinClubFlow.tsx` | Multi-step wizard for joining a savings circle |
| `SelectModal.tsx` | Modal dropdown/picker for selections (provinces, banks, etc.) |

---

## 11. Design System

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#1A7F7A` | Main teal — buttons, links, active states |
| `primaryDark` | `#155F5B` | Pressed/hover states |
| `primaryLight` | `#E8F5F5` | Tinted backgrounds |
| `accent` | `#E07B3A` | Orange accent for highlights |
| `white` | `#FFFFFF` | Backgrounds |
| `background` | `#FFFFFF` | Screen backgrounds |
| `surface` | `#F8F8F8` | Card/surface backgrounds |
| `border` | `#E0E0E0` | Standard borders |
| `borderLight` | `#F0F0F0` | Subtle borders |
| `textDark` | `#1A1A1A` | Primary text |
| `textMid` | `#444444` | Secondary text |
| `textLight` | `#888888` | Tertiary/muted text |
| `textPlaceholder` | `#AAAAAA` | Input placeholders |
| `error` | `#D32F2F` | Error states (red) |
| `success` | `#2E7D32` | Success states (green) |
| `disabled` | `#CCCCCC` | Disabled elements |
| `gradient1-3` | `#2A9D96` → `#D4EEEE` | Gradient backgrounds |

### Design Principles

- **Portrait-only** orientation
- **Edge-to-edge** layout on Android
- Professional teal/turquoise brand with orange accent
- Consistent `SafeAreaProvider` and `GestureHandlerRootView` wrapping
- Slide-from-right screen transitions

---

## 12. Utilities

### Validation (`src/utils/validation.ts`)

| Export | Description |
|--------|-------------|
| `PASSWORD_REGEX` | Requires: 8-64 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char |
| `CANADA_PHONE_REGEX` | Matches `(XXX) XXX-XXXX` format |
| `CANADA_POSTAL_CODE_REGEX` | Matches `X#X #X#` format (Canadian postal code) |
| `formatPhoneNumber(value)` | Auto-formats input to `(XXX) XXX-XXXX` |
| `formatCanadianPostalCode(value)` | Auto-formats input to `X#X #X#` |

### Rotation (`src/utils/rotation.ts`)

| Export | Description |
|--------|-------------|
| `getNextPayoutMember()` | Calculates the next recipient in a round-robin payout rotation for savings circles |

---

## 13. Environment Variables

The app requires two environment variables set via a `.env` file in the `ContribiiaApp/` directory:

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_SUPABASE_URL` | The Supabase project URL (e.g., `https://xxxxx.supabase.co`) |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | The Supabase anonymous/public API key |

These are accessed via `process.env.EXPO_PUBLIC_*` (Expo's built-in env variable support).

---

## 14. Database Migrations

Migrations are stored in `supabase/migrations/` and applied using the Supabase CLI.

| Migration | Date | Description |
|-----------|------|-------------|
| `20260325000000_current_state.sql` | March 25, 2026 | Baseline schema: profiles, wallets, transactions, cards, bank_accounts, triggers, RPC functions, RLS policies |
| `20260326_add_profile_verification_fields.sql` | March 26, 2026 | Adds `legal_name`, `date_of_birth`, `gender` to profiles (in `ContribiiaApp/supabase/`) |
| `20260409000000_add_circles.sql` | April 9, 2026 | Adds `circles` and `circle_members` tables with RLS policies |

### Applying Migrations

```bash
# Link to Supabase project
npx supabase link --project-ref <project-ref>

# Push all migrations
npx supabase db push

# Create a new migration
npx supabase migration new <migration_name>
```

---

## 15. Deployment & Build

### Supabase Projects

| Environment | Project Reference |
|-------------|-------------------|
| Development | `alkuarsycuqhvwdqkmya` |
| Production | `budfthcjotckvtgityhr` |

### Building for Production

```bash
# Install EAS CLI
npm install -g eas-cli

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios

# Build for Web (static export)
npx expo export --platform web
```

### App Configuration Highlights (`app.json`)

- **App Name:** ContribiiaApp
- **Scheme:** `contribiiaapp` (deep linking)
- **Android Package:** `com.anonymous.ContribiiaApp`
- **Icon:** `./assets/images/logo_S.png`
- **Splash Screen:** `./assets/images/splash-icon.png` with white background
- **New Architecture:** Enabled
- **React Compiler:** Enabled (experimental)
- **Typed Routes:** Enabled (experimental)

---

## 16. Known Limitations & Notes

1. **Mock Mode:** The tab layout currently has the Supabase auth guard bypassed for client demo purposes (noted in code comment: "MOCK MODE – Supabase auth guard bypassed for client demo"). This should be re-enabled for production.

2. **State Management:** The `src/stores/` directory is reserved but currently empty. Consider implementing global state management (Zustand, Redux, or Jotai) for complex state sharing as the app grows.

3. **Card Security:** Full card numbers and CVVs are never stored. Only the last 4 digits are retained. Full card processing requires integration with a payment processor (e.g., Stripe).

4. **Credit Score:** The credit score tab screen exists, but the integration with a credit reporting service has not been documented.

5. **Tap-to-Pay / NFC:** Screen exists but NFC hardware integration details are not specified.

6. **Invoice Generation:** Screen exists for generating and sending invoices to users.

7. **App Example:** An `app-example/` directory exists in the project — this is an Expo template reference and is not part of the production app.

8. **Duplicate Migration Directory:** Migrations exist in both `supabase/migrations/` (root) and `ContribiiaApp/supabase/migrations/`. The root directory is the canonical source.

---

## 17. Key Project References

| Resource | Location |
|----------|----------|
| Main App Code | `ContribiiaApp/` |
| Database Schema Documentation | `ContribiiaApp/src/docs/databaseSchema.md` |
| Database Migrations | `supabase/migrations/` |
| Supabase Config | `supabase/config.toml` |
| Environment Variables Template | `ContribiiaApp/.env.example` |
| Mock/Demo Data | `ContribiiaApp/data/mockData.json` |
| App Configuration | `ContribiiaApp/app.json` |
| Android Build Files | `ContribiiaApp/android/` |

### Supported Canadian Banks (for bank linking)

1. BMO (Bank of Montreal)
2. Scotiabank
3. TD Canada Trust
4. CIBC
5. CWB (Canadian Western Bank)
6. HSBC Canada

### Supported Government IDs (for KYC)

1. Passport
2. Driver's License
3. Health Card

### Supported Official Documents (for verification)

1. Utility Bill
2. Bank Statement
3. Statement of Benefits
4. Tax Assessment Notice

---

*This document was generated on April 10, 2026 and reflects the current state of the Contribiia application codebase.*
