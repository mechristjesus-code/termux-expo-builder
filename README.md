# termux-expo-builder

A reusable Expo + React Native + TypeScript starter for building Android and iOS apps from a GitHub repository, including from Termux. The starter is intentionally small: replace `App.tsx`, update the app identity in `app.json`, and keep the build pipeline.

## What is included

This repository contains a current Expo TypeScript starter, a mobile-first example screen, EAS profiles for development, preview APKs, and production releases, plus a GitHub Actions workflow that can run an Android, iOS, or all-platform build. Native folders are not committed; Expo and EAS generate the native projects when needed.

Expo Go is for quick device testing. EAS Build is what creates an installable Android APK/AAB or an iOS build. An iOS build can be started from Termux or GitHub Actions, but Apple credentials and Apple Developer enrollment are required for distribution.

## Use it from Termux

Install Termux from a trusted source such as F-Droid or GitHub Releases, then install Git and Node.js:

```bash
pkg update
pkg install git nodejs
```

Clone the public repository and install dependencies:

```bash
git clone https://github.com/mechristjesus-code/termux-expo-builder.git
cd termux-expo-builder
npm install
npm start
```

Open the QR code with Expo Go. For a phone-friendly tunnel when local network discovery is difficult, use `npx expo start --tunnel`.

## First-time Expo setup

Install or use the EAS CLI, authenticate, and link this local app to your own Expo project. The link step creates the project ID in the local configuration; do not commit an Expo access token.

```bash
npm install --global eas-cli
eas login
eas init
```

Before publishing, change these values in `app.json`:

```json
{
  "expo": {
    "name": "Your App Name",
    "slug": "your-app-slug",
    "ios": { "bundleIdentifier": "com.yourcompany.yourapp" },
    "android": { "package": "com.yourcompany.yourapp" }
  }
}
```

## Build an Android APK

The `preview` profile is configured to produce an installable APK:

```bash
npm run build:android
```

For a store-oriented Android App Bundle:

```bash
npm run build:android:production
```

EAS prints a build page and download link when the cloud build finishes. Builds run in Expo’s cloud service, so Termux does not need the Android SDK.

## Build for iOS

Use the production profile for a release-oriented iOS build:

```bash
npm run build:ios
```

EAS will request or reuse Apple signing credentials. iOS distribution requires an Apple Developer account; Expo Go remains available for development without creating a store build.

## GitHub Actions

Add an Expo access token to the repository as a secret named `EXPO_TOKEN`. In GitHub, open **Settings → Secrets and variables → Actions → New repository secret**. Create the token with `eas token:create` or from the Expo account settings, and never place it in source files.

The workflow in `.github/workflows/eas-build.yml` runs an Android preview build on pushes to `main`. It also supports manual runs from the Actions tab, where you can choose `android`, `ios`, or `all` and select the `preview` or `production` profile. iOS builds still require valid Apple credentials in the Expo project.

## Useful commands

```bash
npm run typecheck        # TypeScript validation
npm run doctor           # Expo project diagnostics
npm run web              # Run the web target locally
npm run build:all        # Production Android + iOS EAS build
```

## Telegram and n8n build control

The repository includes a Termux client and an importable n8n workflow. See [`n8n/README.md`](./n8n/README.md) to connect Telegram to GitHub Actions, then configure the webhook URL in Termux. Once configured, you can request a build without opening a browser:

```bash
bash scripts/termux-setup.sh
source ~/.config/termux-expo-builder/env
bash scripts/build-request.sh android preview
```

Telegram uses the same command format: `/build android preview`, `/build android production`, `/build ios production`, or `/build all production`.

## Customization

Replace the starter screen in `App.tsx`. Put non-secret runtime configuration in `.env` using `EXPO_PUBLIC_` variables and keep secrets in EAS/GitHub secret storage. Replace the files in `assets/` with your own square icon and splash artwork before distributing the app.

## APK, web, and continuous upgrades

This same project supports an installable Android APK, iOS builds, and a web target. It also includes `expo-updates` with separate `preview` and `production` channels. JavaScript, styling, copy, and compatible assets can be published over the air after the first binary is installed. Native dependencies, permissions, Expo SDK changes, and native configuration still require a new APK or iOS build. See [`docs/updates-and-platforms.md`](./docs/updates-and-platforms.md) for the complete setup.

For Google Play internal testing, TestFlight, and eventual store release, see [`docs/store-release.md`](./docs/store-release.md). The repository includes a manual GitHub Actions submission template in `github-actions/eas-submit.yml`.

## License

MIT. See [LICENSE](./LICENSE).
