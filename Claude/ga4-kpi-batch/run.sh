#!/bin/bash
# GA4日次レポートを実行してChatworkに投稿する
cd "$(dirname "$0")"
set -a; source .env; set +a
source .venv/bin/activate
python main.py
