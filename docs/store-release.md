# Store release flow

This project can build and submit Android and iOS binaries from Termux or GitHub Actions. EAS Submit uploads an Android App Bundle (`.aab`) to Google Play Console and an iOS archive (`.ipa`) to App Store Connect.

## Google Play

Create the app in [Google Play Console](https://play.google.com/console/), using the same Android package ID from `app.json`. Set up the Google Play service account in EAS following Expo's Android submission setup. Keep the JSON key in EAS credentials or a secure CI secret; do not commit it.

Build a production Android App Bundle:

```bash
npm run build:android:production
```

Upload the newest build to the internal testing track as a draft:

```bash
npm run submit:android
```

The first Play release should be tested internally. Complete the store listing, content declarations, screenshots, testers, and any Google requirements in Play Console. Promote the draft from internal testing to closed/open testing and then production when ready. The template deliberately uses `track: internal` and `releaseStatus: draft` so a command cannot accidentally publish directly to everyone.

## Apple TestFlight and App Store

Create the app in App Store Connect using the iOS bundle identifier from `app.json`. Configure Apple signing and App Store Connect credentials in EAS. Build and upload from any OS:

```bash
npm run build:ios
npm run submit:ios
```

The upload appears in TestFlight after Apple processing. TestFlight distribution is separate from App Store release. Complete metadata, screenshots, privacy details, export compliance, and review submission in App Store Connect before releasing publicly.

## GitHub automation

After configuring EAS credentials, add `EXPO_TOKEN` to GitHub Actions secrets. The optional `github-actions/eas-submit.yml` workflow can submit the latest build manually from the Actions tab. Keep store credentials in Expo/EAS or GitHub encrypted secrets, never in `app.json` or a public repository.
