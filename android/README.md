# MMI Members — Android app

A native Android app (Kotlin + Jetpack Compose) for MMI members to manage their profiles,
track certification goals, and log reports. It ships with built-in profiles for the team:

| Member | Role |
|---|---|
| Peter | Owner / Technician |
| Valeita | Owner / Admin |
| Nick | Owner / Technician |

## Features

- **Profile picker** — choose who's using the app; switch any time from Home or your profile.
- **Home** — personal greeting, open/completed goal counts, reports this month, overall team roadmap progress,
  next targets, and recent reports.
- **Goals** — seeded from the fuels certification roadmap (MC practical, TSSA PMH / LFHC / Site Operator / PM.1,
  20 L test measure, Schedule A admin, first client inspection). Filter by Mine / Team / All, assign to
  members or the whole team, track status and checklist steps. Ticking steps updates status automatically.
- **Reports** — log field work, inspections, training or admin with date, hours and details; filter by member
  and see total hours.
- **Team** — every member's profile, open goals and reports. Edit name, title, roles, contact info, bio and
  certifications.

Data is stored locally on the device (`mmi_data.json` in app storage). All storage goes through
`MmiRepository`, so it can later be replaced by a shared backend so all three members see the same data.

## Getting the APK

Every push that touches `android/` runs the **Android app** GitHub Actions workflow, which builds a debug APK.
Open the workflow run on GitHub → **Artifacts** → download `mmi-members-debug-apk`, unzip, and install
`app-debug.apk` on the phone (allow "install unknown apps" when prompted).

## Building locally

Requires JDK 17 and the Android SDK (Android Studio installs both).

```bash
cd android
./gradlew assembleDebug        # → app/build/outputs/apk/debug/app-debug.apk
./gradlew installDebug         # install on a connected device / emulator
```

Or open the `android/` folder in Android Studio and press Run.

## Project layout

```
app/src/main/java/com/mmi/members/
├── MainActivity.kt / MmiApplication.kt
├── data/          Models, built-in seed data (members + roadmap goals), JSON repository
└── ui/
    ├── MmiApp.kt        Navigation + bottom bar
    ├── MmiViewModel.kt  All state changes
    ├── components/      Avatars, cards, top bars
    ├── screens/         Profile select, Home, Goals, Reports, Team/Profile
    └── theme/           MMI navy/amber colour scheme (light + dark)
```
