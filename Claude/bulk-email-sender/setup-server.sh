#!/bin/bash
# ============================================================
# サーバー設定スクリプト（Nginx・Supervisor・キャッシュ）
# 使い方: bash setup-server.sh
# ============================================================

APP_DIR="/var/www/bulk-email"
DOMAIN="210.131.222.160"
PHP="php8.4"

echo "=============================="
echo " サーバー設定開始"
echo "=============================="

# ----------------------------------------
# Nginxの設定ファイルを作成
# ----------------------------------------
echo "[1/4] Nginx設定ファイルを作成中..."

python3 - << PYEOF
content = """server {
    listen 80;
    server_name """ + "$DOMAIN" + """;
    root """ + "$APP_DIR" + """/public;
    index index.php;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    location / {
        try_files \$uri \$uri/ /index.php?\$query_string;
    }

    location ~ \\.php\$ {
        fastcgi_pass unix:/var/run/php/php8.4-fpm.sock;
        fastcgi_param SCRIPT_FILENAME \$realpath_root\$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\\.(?!well-known).* {
        deny all;
    }
}
"""
with open("/etc/nginx/sites-available/bulk-email", "w") as f:
    f.write(content)
print("Nginx設定ファイルを作成しました")
PYEOF

ln -sf /etc/nginx/sites-available/bulk-email /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
echo "Nginx設定完了"

# ----------------------------------------
# Supervisorの設定ファイルを作成
# ----------------------------------------
echo "[2/4] Supervisor設定ファイルを作成中..."

python3 - << PYEOF
content = """[program:bulk-email-worker]
process_name=%(program_name)s_%(process_num)02d
command=""" + "$PHP $APP_DIR" + """/artisan queue:work redis --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=""" + "$APP_DIR" + """/storage/logs/worker.log
stopwaitsecs=3600
"""
with open("/etc/supervisor/conf.d/bulk-email-worker.conf", "w") as f:
    f.write(content)
print("Supervisor設定ファイルを作成しました")
PYEOF

supervisorctl reread
supervisorctl update
supervisorctl start "bulk-email-worker:*" || true
echo "Supervisor設定完了"

# ----------------------------------------
# パーミッション設定
# ----------------------------------------
echo "[3/4] パーミッションを設定中..."
chown -R www-data:www-data "$APP_DIR/storage" "$APP_DIR/bootstrap/cache"
chmod -R 775 "$APP_DIR/storage" "$APP_DIR/bootstrap/cache"
echo "パーミッション設定完了"

# ----------------------------------------
# キャッシュの最適化
# ----------------------------------------
echo "[4/4] キャッシュを最適化中..."
cd "$APP_DIR"
$PHP artisan config:cache
$PHP artisan route:cache
$PHP artisan view:cache
echo "キャッシュ最適化完了"

echo ""
echo "=============================="
echo " 設定完了！"
echo "=============================="
echo " アクセス: http://${DOMAIN}"
echo ""
echo " 次のステップ:"
echo " 1. メール設定: nano ${APP_DIR}/.env"
echo " 2. Google認証情報: nano ${APP_DIR}/storage/app/google/credentials.json"
echo " 3. 配信リスト同期: ${PHP} ${APP_DIR}/artisan recipients:sync"
echo "=============================="
