#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE_URL="${EXPO_PUBLIC_AI_BASE_URL:-http://127.0.0.1:8080}"
PROMPT="${*:-}"
if [[ -z "$PROMPT" ]]; then
  echo "Usage: bash scripts/ai-command.sh \"Should this change be an OTA update or a new APK?\"" >&2
  exit 1
fi

payload=$(PROMPT="$PROMPT" python3 - <<'PY'
import json, os
print(json.dumps({
  "model": "local-gguf",
  "messages": [
    {"role": "system", "content": "You are the Termux Expo Builder copilot. Give safe, concrete commands and explain whether a change needs an OTA update or a native rebuild."},
    {"role": "user", "content": os.environ["PROMPT"]}
  ],
  "temperature": 0.2
}))
PY

curl --fail-with-body --silent --show-error \
  -H 'Content-Type: application/json' \
  -d "$payload" \
  "${BASE_URL%/}/v1/chat/completions" | python3 -c 'import json,sys; print(json.load(sys.stdin)["choices"][0]["message"]["content"])'
