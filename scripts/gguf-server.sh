#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

MODEL_PATH="${GGUF_MODEL_PATH:-${HOME}/models/model.gguf}"
PORT="${GGUF_PORT:-8080}"
CONTEXT="${GGUF_CONTEXT:-4096}"

if ! command -v llama-server >/dev/null 2>&1; then
  echo "llama-server was not found. Install a Termux-compatible llama.cpp build first." >&2
  echo "Then run this script again with GGUF_MODEL_PATH=/path/to/model.gguf." >&2
  exit 1
fi
if [[ ! -f "$MODEL_PATH" ]]; then
  echo "GGUF model not found at $MODEL_PATH" >&2
  echo "Set GGUF_MODEL_PATH=/path/to/model.gguf and try again." >&2
  exit 1
fi

echo "Starting local GGUF server on http://127.0.0.1:${PORT}"
llama-server --model "$MODEL_PATH" --host 0.0.0.0 --port "$PORT" --ctx-size "$CONTEXT" --alias local-gguf
