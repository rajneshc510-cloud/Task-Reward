# TaskReward — Native Android Mobile App

TaskReward is a native Android application built with **Kotlin**, **Jetpack Compose**, and **Material 3**. It integrates with **Firebase Authentication** and **Cloud Firestore** for user accounts, real-time balances, task claims, and reward history.

## Platform & Architecture
- **Language**: Kotlin
- **UI Framework**: Jetpack Compose (Declarative Android UI)
- **Design System**: Material Design 3 (M3)
- **Architecture**: MVVM (Model-View-ViewModel) + Repository Pattern + StateFlow & SharedFlow
- **Database & Auth**: Firebase Authentication & Cloud Firestore

## Authentication (Indian Mobile Number + OTP)
- **Phone Login Screen**: Displayed before Home screen.
- **Default Country Code**: `+91` (India) pre-selected.
- **Validation**: Strict 10-digit validation (must start with 6, 7, 8, or 9).
- **OTP Screen**: 6-digit OTP verification view with individual digit input boxes.
- **Resend OTP**: 60-second active countdown timer before allowing resend.
- **Firebase Auth**: Uses `PhoneAuthProvider.verifyPhoneNumber` and `signInWithCredential`.
- **User Profile Management**: Automatically checks Firestore on authentication; creates new user profile on first login with `coins: 0` and `totalEarned: 0`, and loads existing profile on returning logins.
- **Security & Privacy**: OTP is never stored or exposed; verified securely by Firebase.
- **Logout**: Located in Profile screen; clears session and safely returns user to the Login screen.

## Main Screens
1. **Home Screen**:
   - App branding & subtitle: "Complete tasks and collect reward points"
   - Large gradient balance card displaying demo reward points and "DEMO REWARDS" badge
   - Daily tasks showcase: Daily Check-in (+10 pts), Daily Bonus (+20 pts), Complete Activity (+30 pts)
   - 1-tap navigation to the Tasks screen
2. **Tasks Screen**:
   - Daily Check-in (+10 demo points)
   - Daily Bonus (+20 demo points)
   - Complete Activity (+30 demo points)
   - One-claim-per-day enforcement with disabled state and daily key check
   - Live balance update and animated feedback
3. **Wallet Screen**:
   - Current demo reward points and estimated demo value calculation ($0.01/pt)
   - Transparent Demo Safety disclaimer: no cash withdrawals or bank/UPI requirements
   - Live transaction and reward earnings history
   - Polished empty state when no transactions exist
4. **Profile Screen**:
   - Circular "R" avatar, user name, email, account creation date
   - Quick coin balance & wallet shortcut
   - Referral program code with copy action
   - Contact Support and Settings dialogs
   - Sign out

## Firebase Firestore Collections & Schema
- `users`: `{ uid, name, email, coins, totalEarned, createdAt }`
- `tasks`: Static or dynamic daily task definitions
- `taskClaims`: `{ claimId: "{uid}_{taskId}_{YYYY-MM-DD}", userId, taskId, dateKey, claimedAt, pointsAwarded }`
- `transactions`: `{ id, userId, title, description, points, type, timestamp }`

## Opening in Android Studio
1. Open **Android Studio** (Koala / Ladybug or newer recommended).
2. Select **File > Open** and choose this project root directory.
3. Add your `google-services.json` inside the `app/` folder.
4. Sync Gradle and click **Run** (Green Play button) targeting an Android emulator (API 34+) or physical phone.
