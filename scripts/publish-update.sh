#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

CHANNEL="${1:-preview}"
shift || true
MESSAGE="${*:-Update from Termux}"

case "$CHANNEL" in
  preview|production) ;;
  *) echo "Channel must be preview or production." >&2; exit 1 ;;
esac

if ! command -v eas >/dev/null 2>&1; then
  echo "EAS CLI is not installed. Run: npm install --global eas-cli" >&2
  exit 1
fi

eas update --channel "$CHANNEL" --message "$MESSAGE" --non-interactive
