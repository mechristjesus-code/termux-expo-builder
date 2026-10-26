#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

PLATFORM="${1:-}"

case "$PLATFORM" in
  android) eas submit --platform android --profile production --latest --non-interactive ;;
  ios) eas submit --platform ios --profile production --latest --non-interactive ;;
  *)
    echo "Usage: bash scripts/submit-latest.sh android|ios" >&2
    exit 1
    ;;
esac
