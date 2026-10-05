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

## Installing on a phone

**Download link (always the newest version):**
https://github.com/nickprocenko/MMI/releases/latest/download/MMI-Members.apk

Open the link on the phone, tap the downloaded file, and allow installing from your browser when Android
asks. Play Protect may say the app is unrecognized because it isn't from the Play Store; choose
**Install anyway**. To update later, open the same link again. The new version installs over the old one and
keeps your data.

> If you installed a build from the **Actions** page before releases existed, uninstall it once first.
> Those builds were signed with a different key.

### How releases are made

Every push to the default branch that touches `android/` runs the **Android app** workflow. It builds a
release APK signed with MMI's key and publishes it as a new GitHub Release (`app-v0.1.<build>`). Builds on
other branches and PRs only produce a debug APK under the run's **Artifacts**.

The signing key is kept in two repository secrets (Settings → Secrets and variables → Actions):

| Secret | Contents |
|---|---|
| `MMI_KEYSTORE_BASE64` | The release keystore (`mmi-release.jks`), base64-encoded |
| `MMI_KEYSTORE_PASSWORD` | Its password, used for both the store and the `mmi` key |

Keep a backup of the keystore and password somewhere safe, such as a password manager. GitHub secrets
can't be read back. If the key is lost, future builds can't install as updates, and everyone would have to
uninstall and reinstall, losing local data. Never commit the keystore; `.gitignore` blocks `*.jks`.

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
