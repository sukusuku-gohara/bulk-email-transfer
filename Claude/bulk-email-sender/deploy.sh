#!/bin/bash
# ============================================================
# 一斉メール配信システム — 自動デプロイスクリプト
# 使い方: bash deploy.sh
# ============================================================

set -e

APP_DIR="/var/www/bulk-email"
REPO_URL="https://github.com/sukusuku-gohara/bulk-email-transfer.git"
DB_NAME="bulk_email"
DB_USER="bulkmail"
DB_PASS="Bulkmail2026"
DOMAIN="210.131.222.160"
PHP="php8.4"

echo "=============================="
echo " デプロイ開始"
echo "=============================="

# ----------------------------------------
# 1. リポジトリのクローン or 更新
# ----------------------------------------
echo "[1/8] リポジトリをクローン中..."
if [ -d "$APP_DIR/.git" ]; then
    cd "$APP_DIR" && git pull origin main
else
    git clone "$REPO_URL" "$APP_DIR"
    cd "$APP_DIR"
fi
cd "$APP_DIR"

# ----------------------------------------
# 2. Composerパッケージインストール
# ----------------------------------------
echo "[2/8] Composerパッケージをインストール中..."
COMPOSER_ALLOW_SUPERUSER=1 composer install --no-dev --optimize-autoloader --no-interaction

# ----------------------------------------
# 3. .env の作成・設定
# ----------------------------------------
echo "[3/8] .env を設定中..."
if [ ! -f "$APP_DIR/.env" ]; then
    cp "$APP_DIR/.env.example" "$APP_DIR/.env"
    $PHP artisan key:generate --force
fi

# DB設定を書き込む（既存行を置換、なければ追記）
update_env() {
    KEY=$1
    VALUE=$2
    if grep -q "^${KEY}=" .env; then
        sed -i "s|^${KEY}=.*|${KEY}=${VALUE}|" .env
    else
        echo "${KEY}=${VALUE}" >> .env
    fi
}

update_env APP_ENV production
update_env APP_DEBUG false
update_env APP_URL "http://${DOMAIN}"
update_env DB_CONNECTION mysql
update_env DB_HOST 127.0.0.1
update_env DB_PORT 3306
update_env DB_DATABASE "${DB_NAME}"
update_env DB_USERNAME "${DB_USER}"
update_env DB_PASSWORD "${DB_PASS}"
update_env CACHE_STORE redis
update_env QUEUE_CONNECTION redis
update_env SESSION_DRIVER redis

# ----------------------------------------
# 4. パーミッション設定
# ----------------------------------------
echo "[4/8] パーミッションを設定中..."
chown -R www-data:www-data "$APP_DIR"
chmod -R 775 "$APP_DIR/storage" "$APP_DIR/bootstrap/cache"
mkdir -p "$APP_DIR/storage/app/google"
chown root:root "$APP_DIR/.env"
chmod 600 "$APP_DIR/.env"

# ----------------------------------------
# 5. データベースのマイグレーション
# ----------------------------------------
echo "[5/8] データベースをマイグレーション中..."
$PHP artisan migrate --force

# ----------------------------------------
# 6. Nginxの設定
# ----------------------------------------
echo "[6/8] Nginxを設定中..."

tee /etc/nginx/sites-available/bulk-email > /dev/null << NGINX
server {
    listen 80;
    server_name ${DOMAIN};
    root ${APP_DIR}/public;
    index index.php;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    location / {
        try_files \$uri \$uri/ /index.php?\$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.4-fpm.sock;
        fastcgi_param SCRIPT_FILENAME \$realpath_root\$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/bulk-email /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# ----------------------------------------
# 7. Supervisorの設定（Queueワーカー）
# ----------------------------------------
echo "[7/8] Supervisorを設定中..."

tee /etc/supervisor/conf.d/bulk-email-worker.conf > /dev/null << SUPERVISOR
[program:bulk-email-worker]
process_name=%(program_name)s_%(process_num)02d
command=${PHP} ${APP_DIR}/artisan queue:work redis --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=${APP_DIR}/storage/logs/worker.log
stopwaitsecs=3600
SUPERVISOR

supervisorctl reread
supervisorctl update
supervisorctl start "bulk-email-worker:*" || true

# ----------------------------------------
# 8. キャッシュの最適化
# ----------------------------------------
echo "[8/8] キャッシュを最適化中..."
$PHP artisan config:cache
$PHP artisan route:cache
$PHP artisan view:cache

echo ""
echo "=============================="
echo " デプロイ完了！"
echo "=============================="
echo " アクセス: http://${DOMAIN}"
echo ""
echo " 次のステップ:"
echo " 1. メール設定を追加: nano ${APP_DIR}/.env"
echo "    MAIL_MAILER=smtp"
echo "    MAIL_HOST=smtp.gmail.com"
echo "    MAIL_PORT=587"
echo "    MAIL_USERNAME=your@domain.com"
echo "    MAIL_PASSWORD=アプリパスワード"
echo "    MAIL_ENCRYPTION=tls"
echo "    MAIL_FROM_ADDRESS=your@domain.com"
echo "    BULKMAIL_SPREADSHEET_ID=スプレッドシートID"
echo ""
echo " 2. Google認証情報を配置:"
echo "    nano ${APP_DIR}/storage/app/google/credentials.json"
echo ""
echo " 3. 配信リストを同期:"
echo "    ${PHP} ${APP_DIR}/artisan recipients:sync"
echo "=============================="
