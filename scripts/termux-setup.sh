#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

pkg update -y
pkg install -y git curl jq nodejs

read -r -p "n8n build webhook URL: " webhook
read -r -p "Optional shared webhook secret (press Enter to skip): " secret

profile_dir="${HOME}/.config/termux-expo-builder"
mkdir -p "$profile_dir"
{
  printf 'export N8N_BUILD_WEBHOOK_URL=%q\n' "$webhook"
  if [[ -n "$secret" ]]; then
    printf 'export N8N_BUILD_WEBHOOK_SECRET=%q\n' "$secret"
  fi
  printf 'export GITHUB_REPOSITORY=%q\n' "mechristjesus-code/termux-expo-builder"
  printf 'export GITHUB_BRANCH=%q\n' "main"
} > "$profile_dir/env"

cat <<EOF
Saved configuration to $profile_dir/env.
Load it in this Termux session with:
  source $profile_dir/env

Then request an APK with:
  ./scripts/build-request.sh android preview
EOF
