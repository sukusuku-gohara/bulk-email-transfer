#!/usr/bin/env bash
set -euo pipefail

SRC="/Users/kazuya/AIproduct/Claude/eyecatch-gen/"
DST_REPO="/Users/kazuya/repos/AIProduct"
DST_PATH="Claude/eyecatch-gen"

cd "$DST_REPO"

echo "==> Syncing..."
mkdir -p "$DST_PATH"

rsync -av --delete \
  --exclude '.git/' \
  --exclude 'AIProduct/' \
  --exclude 'node_modules/' \
  --exclude '.next/' \
  --exclude 'dist/' \
  --exclude 'out/' \
  --exclude '.DS_Store' \
  --exclude '.env.local' \
  "$SRC" "$DST_PATH/"

echo "==> Git status (after sync):"
git status --porcelain

# 変更がなければ終了
if git diff --quiet && git diff --cached --quiet; then
  echo "==> No changes to commit."
  exit 0
fi

echo "==> Staging..."
git add "$DST_PATH" .gitignore 2>/dev/null || true

# コミットメッセージ
MSG=${1:-"Sync eyecatch-gen"}
echo "==> Committing: $MSG"
git commit -m "$MSG" || {
  echo "==> Nothing to commit."
  exit 0
}

echo "==> Pushing..."
git push origin main

echo "==> Done."
