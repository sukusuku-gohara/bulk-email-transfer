#!/bin/bash
# Caddy設定追加スクリプト（bulk-mail.suku2.biz）

echo "[1/2] Caddyfileにbulk-mail設定を追加中..."
python3 - << 'PYEOF'
with open("/etc/caddy/Caddyfile", "r") as f:
    content = f.read()

new_entry = """
bulk-mail.suku2.biz {
    root * /var/www/bulk-email/Claude/bulk-email-sender/public
    php_fastcgi unix//var/run/php/php8.4-fpm.sock
    file_server
    encode gzip
}
"""

if "bulk-mail.suku2.biz" in content:
    print("すでに設定済みです")
else:
    with open("/etc/caddy/Caddyfile", "w") as f:
        f.write(content + new_entry)
    print("Caddyfile更新完了")
PYEOF

echo "[2/2] Caddy再起動..."
systemctl reload caddy

echo ""
echo "=============================="
echo " 設定完了！"
echo " アクセス: https://bulk-mail.suku2.biz/login"
echo "=============================="
