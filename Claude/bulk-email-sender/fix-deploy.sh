#!/bin/bash
# ============================================================
# デプロイ構造修正スクリプト
# 使い方: bash fix-deploy.sh
# ============================================================

APP=/var/www/bulk-email/Claude/bulk-email-sender

echo "=============================="
echo " デプロイ修正開始"
echo "=============================="

# ----------------------------------------
# 1. guest.blade.php の @vite を CDN フォールバックに修正
# ----------------------------------------
echo "[1/3] guest.blade.php を修正中..."
python3 - << 'PYEOF'
import re

path = "/var/www/bulk-email/Claude/bulk-email-sender/resources/views/layouts/guest.blade.php"
with open(path, "r") as f:
    content = f.read()

old = "        @vite(['resources/css/app.css', 'resources/js/app.js'])"
new = """        @if(file_exists(public_path('build/manifest.json')))
            @vite(['resources/css/app.css', 'resources/js/app.js'])
        @else
            {{-- Viteビルド未実施時: Tailwind CDN を使用 --}}
            <script src="https://cdn.tailwindcss.com"></script>
        @endif"""

if old in content:
    content = content.replace(old, new)
    with open(path, "w") as f:
        f.write(content)
    print("guest.blade.php を修正しました")
else:
    print("すでに修正済みまたは対象行が見つかりません")
PYEOF

# ----------------------------------------
# 2. キャッシュクリア
# ----------------------------------------
echo "[2/3] キャッシュをクリア中..."
php8.4 $APP/artisan view:clear
php8.4 $APP/artisan cache:clear

# ----------------------------------------
# 3. Nginx の root パスを修正
# ----------------------------------------
echo "[3/3] Nginx 設定を修正中..."
python3 - << 'PYEOF'
path = "/etc/nginx/sites-available/bulk-email"
with open(path, "r") as f:
    content = f.read()

old = "root /var/www/bulk-email/public;"
new = "root /var/www/bulk-email/Claude/bulk-email-sender/public;"

if old in content:
    content = content.replace(old, new)
    with open(path, "w") as f:
        f.write(content)
    print("Nginx 設定を修正しました")
else:
    print("すでに修正済みまたは対象行が見つかりません")
PYEOF

nginx -t && systemctl reload nginx

echo ""
echo "=============================="
echo " 修正完了！"
echo " アクセス: http://210.131.222.160/login"
echo "=============================="
