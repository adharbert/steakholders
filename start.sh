#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Add Homebrew Node to PATH if npm isn't already found
if ! command -v npm &>/dev/null; then
  export PATH="/home/linuxbrew/.linuxbrew/bin:$PATH"
fi

# Add dotnet tools (for dotnet-ef etc.)
export PATH="$HOME/.dotnet/tools:$PATH"

cleanup() {
  echo ""
  echo "Stopping Steakholders Meatup..."
  kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
  wait "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
  echo "Done."
}
trap cleanup INT TERM EXIT

echo "==> Starting backend..."
cd "$ROOT/backend/SteakholdersMeatup"
dotnet run &
BACKEND_PID=$!

echo "==> Starting frontend..."
cd "$ROOT/frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "  Backend:  http://localhost:5000"
echo "  Swagger:  http://localhost:5000/swagger"
echo "  Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop."

wait "$BACKEND_PID" "$FRONTEND_PID"
