#!/bin/bash
set -euo pipefail

PLIST_NAME="com.localai.gateway"
PLIST_DEST="$HOME/Library/LaunchAgents/$PLIST_NAME.plist"

echo "=== LocalAI Gateway Uninstaller ==="
echo ""

echo "[1/4] Stopping gateway service..."
if [ -f "$PLIST_DEST" ]; then
  launchctl unload "$PLIST_DEST" 2>/dev/null || true
  rm "$PLIST_DEST"
  echo "  Service removed."
else
  echo "  No service found."
fi

echo "[2/4] Unlinking CLI..."
npm unlink -g @localai/cli 2>/dev/null || true
echo "  CLI unlinked."

echo "[3/4] Removing custom model..."
ollama rm localai-coder 2>/dev/null || true
echo "  Model removed."

echo "[4/4] Cleanup complete."
echo ""
echo "  Note: The base model (qwen2.5-coder:7b-instruct) was NOT removed."
echo "  To remove it: ollama rm qwen2.5-coder:7b-instruct"
echo "  To remove Ollama entirely: brew uninstall ollama"
echo ""
