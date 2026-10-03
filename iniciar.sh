#!/usr/bin/env bash

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo "=========================================================="
echo "  ROVIRO FORÇA DE VENDAS & TORRE DE CONTROLE B2B          "
echo "=========================================================="

trap 'kill $(jobs -p) 2>/dev/null' EXIT

echo "Iniciando backend em http://localhost:3004..."
(cd "$ROOT_DIR/server" && bun run src/index.ts) &

echo "Iniciando frontend em http://localhost:5176..."
(cd "$ROOT_DIR/client" && bun run dev) &

wait
