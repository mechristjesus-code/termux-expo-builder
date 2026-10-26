#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  ./scripts/build-request.sh android preview
  ./scripts/build-request.sh android production
  ./scripts/build-request.sh ios production
  ./scripts/build-request.sh all production

Required environment variable:
  N8N_BUILD_WEBHOOK_URL=https://your-n8n.example/webhook/termux-expo-build

Optional:
  N8N_BUILD_WEBHOOK_SECRET=shared-secret
EOF
}

PLATFORM="${1:-}"
PROFILE="${2:-preview}"

if [[ -z "${N8N_BUILD_WEBHOOK_URL:-}" ]]; then
  echo "N8N_BUILD_WEBHOOK_URL is not set." >&2
  usage
  exit 1
fi

case "$PLATFORM" in
  android|ios|all) ;;
  *) echo "Platform must be android, ios, or all." >&2; usage; exit 1 ;;
esac

case "$PROFILE" in
  preview|production) ;;
  *) echo "Profile must be preview or production." >&2; usage; exit 1 ;;
esac

REPO="${GITHUB_REPOSITORY:-mechristjesus-code/termux-expo-builder}"
BRANCH="${GITHUB_BRANCH:-main}"
REQUEST_ID="termux-$(date -u +%Y%m%dT%H%M%SZ)-$RANDOM"

payload=$(cat <<JSON
{
  "request_id": "$REQUEST_ID",
  "platform": "$PLATFORM",
  "profile": "$PROFILE",
  "repository": "$REPO",
  "ref": "$BRANCH",
  "source": "termux"
}
JSON
)

headers=(-H "Content-Type: application/json")
if [[ -n "${N8N_BUILD_WEBHOOK_SECRET:-}" ]]; then
  headers+=( -H "X-Build-Secret: ${N8N_BUILD_WEBHOOK_SECRET}" )
fi

echo "Requesting $PLATFORM/$PROFILE build from n8n..."
curl --fail-with-body --silent --show-error --request POST \
  "${headers[@]}" \
  --data "$payload" \
  "$N8N_BUILD_WEBHOOK_URL"
echo
