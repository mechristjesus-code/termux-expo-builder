# n8n + Telegram build control

This project uses n8n as the control plane. Termux sends a JSON request to an n8n webhook, while Telegram can send the same request through a bot command. n8n then dispatches the GitHub Actions workflow, and GitHub Actions runs the Expo EAS build.

## Reconnect n8n

In Manus, open **Settings → Connectors → n8n**, choose reconnect, and approve the authorization card. The n8n server login must report an active token; enabling the connector alone is not enough.

If using your own n8n instance, make sure it is reachable over HTTPS and that the Telegram credential and GitHub credential are configured in n8n.

## Import the workflow

Import `n8n/telegram-eas-build.json` into n8n. Set these values in the imported nodes:

- `GITHUB_OWNER`: `mechristjesus-code`
- `GITHUB_REPO`: `termux-expo-builder`
- `GITHUB_WORKFLOW`: `eas-build.yml`
- `GITHUB_REF`: `main`

Attach a Telegram credential to the Telegram Trigger node and a GitHub credential with permission to dispatch Actions workflows to the GitHub API request node. Set the Expo token as the `EXPO_TOKEN` GitHub Actions repository secret.

The live workflow file must exist at `.github/workflows/eas-build.yml` in the repository. The ready-to-copy version is in `github-actions/eas-build.yml`. GitHub requires a token with Actions/workflow write permission to publish that path.

## Telegram commands

Send one of these messages to the bot:

```text
/build android preview
/build android production
/build ios production
/build all production
```

The bot responds with the GitHub Actions run URL. EAS then publishes the build page and artifact link when the build completes. For iOS, Apple signing credentials must already be configured in EAS.

## Termux client

After cloning the repository, run:

```bash
bash scripts/termux-setup.sh
source ~/.config/termux-expo-builder/env
bash scripts/build-request.sh android preview
```

The client sends only the platform, EAS profile, repository, branch, and a request ID. It never sends the Expo token or GitHub token from Termux.
