# AI-native GGUF architecture

The project treats AI as a local copilot layer. GGUF models run outside the APK through a llama.cpp-compatible server, normally in Termux or on a trusted LAN computer. The Android APK, iOS build, web app, Termux CLI, and n8n can all call the same OpenAI-compatible endpoint.

Keeping the model outside the app is intentional. A GGUF file can be hundreds of megabytes or several gigabytes, and bundling it into an APK would make distribution and updates slow. The app remains lightweight while the model can be swapped or upgraded independently.

## Start a local model server

Install a Termux-compatible `llama-server` binary, place a GGUF model in a private directory, then run:

```bash
export GGUF_MODEL_PATH=$HOME/models/your-model.gguf
bash scripts/gguf-server.sh
```

The server listens on port 8080 and exposes `/v1/chat/completions`. Keep it bound to your private network. Do not expose a local model endpoint to the public internet without authentication and TLS.

## Point the app at the model

Start Expo with a public runtime variable:

```bash
export EXPO_PUBLIC_AI_BASE_URL=http://127.0.0.1:8080
npm start
```

For a physical phone talking to Termux, use the phone's reachable LAN address instead of `127.0.0.1`, for example `http://192.168.1.50:8080`, and make sure the local firewall allows the port.

The in-app AI tab can decide whether a requested change is an OTA update or a new native build and can write the exact command to run. The same model can be queried from Termux:

```bash
bash scripts/ai-command.sh "Should adding camera permission use an OTA update or a new APK?"
```

## AI safety boundary

The copilot can recommend commands, prepare payloads, and explain release changes. It should not receive GitHub, Expo, Apple, Google Play, or Telegram secrets. Keep consequential actions behind n8n/GitHub credential stores and require explicit confirmation for public releases.
