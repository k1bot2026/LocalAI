#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
PLIST_NAME="com.localai.gateway"
PLIST_SRC="$SCRIPT_DIR/$PLIST_NAME.plist"
PLIST_DEST="$HOME/Library/LaunchAgents/$PLIST_NAME.plist"

echo "=== LocalAI Gateway Installer ==="
echo ""

echo "[1/7] Checking for Ollama..."
if ! command -v ollama &> /dev/null; then
  echo "  Ollama not found. Installing via Homebrew..."
  if ! command -v brew &> /dev/null; then
    echo "  ERROR: Homebrew not found. Install Ollama manually from https://ollama.ai"
    exit 1
  fi
  brew install ollama
else
  echo "  Ollama found: $(ollama --version)"
fi

echo "[2/7] Pulling Qwen2.5-Coder-7B model..."
ollama pull qwen2.5-coder:7b-instruct

echo "[3/7] Creating custom localai-coder model..."
ollama create localai-coder -f "$PROJECT_DIR/config/Modelfile"

echo "[4/7] Installing dependencies..."
cd "$PROJECT_DIR"
npm install

echo "[5/7] Building packages..."
npm run build

echo "[6/7] Linking CLI globally..."
cd "$PROJECT_DIR/cli"
npm link
cd "$PROJECT_DIR"

echo "[7/7] Installing launchd service..."
if [ -f "$PLIST_DEST" ]; then
  launchctl unload "$PLIST_DEST" 2>/dev/null || true
fi
sed "s|__PROJECT_DIR__|$PROJECT_DIR|g" "$PLIST_SRC" > "$PLIST_DEST"
launchctl load "$PLIST_DEST"

echo ""
echo "=== Installation Complete ==="
echo ""
echo "  Gateway:  http://localhost:5577"
echo "  Health:   http://localhost:5577/health"
echo "  CLI:      local-ai \"your prompt here\""
echo "  MCP:      Add to ~/.claude/settings.json (see below)"
echo ""
echo "  Add this to your Claude Code MCP settings:"
echo "  {"
echo "    \"mcpServers\": {"
echo "      \"localai\": {"
echo "        \"command\": \"node\","
echo "        \"args\": [\"$PROJECT_DIR/mcp-server/dist/index.js\"]"
echo "      }"
echo "    }"
echo "  }"
echo ""
