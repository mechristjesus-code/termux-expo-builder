# APK, web, and continuous updates

This project targets three surfaces from one Expo codebase:

- **Android APK/AAB:** built by EAS Build. The `preview` profile produces an installable APK; `production` is intended for a store-oriented AAB.
- **iOS:** built by EAS Build. Apple signing credentials are required for distribution.
- **Web:** run locally with `npm run web`; deploy the web bundle to a static host or web platform when ready.

## Continuous updates

The project includes `expo-updates`, an app-version runtime policy, and `preview`/`production` EAS channels. After the first EAS project is linked and a new preview/production binary is installed, JavaScript, layout, text, and bundled image changes can be published without reinstalling:

```bash
npm run update:preview -- "Fix the dashboard layout"
npm run update:production -- "Release new onboarding copy"
```

The first command expands to `eas update --channel preview --message "..."`. The second publishes to the production channel. The GitHub Actions template at `github-actions/eas-update.yml` can publish on push or by manual dispatch.

## Changes that still require a new APK/iOS build

Create a new binary when changing native dependencies, Expo SDK versions, app permissions, native configuration, the app icon, deep-linking configuration, or anything else that changes the native runtime. Publish an OTA update for JavaScript, styling, copy, and compatible assets.

## First-time setup

From Termux:

```bash
npm install --global eas-cli
eas login
eas init
npm run update:configure
npm run build:android
```

`eas update:configure` writes the project-specific EAS update URL and project ID. It must be run after `eas init` by the owner of the Expo project; this template intentionally does not invent a project ID.

After installing the first APK, publish a preview update and relaunch the app twice to verify that it receives the update. Keep production updates on the production channel and preview testing on the preview channel.
