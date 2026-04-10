#!/bin/bash
# ============================================================
# 一斉メール配信システム — 自動デプロイスクリプト
# 使い方: bash deploy.sh
# ============================================================

set -e

REPO_URL="https://github.com/sukusuku-gohara/bulk-email-transfer.git"
APP_DIR="/var/www/bulk-email"
DB_NAME="bulk_email"
DB_USER="bulkmail"
DB_PASS="Bulkmail2026!"
DOMAIN="210.131.222.160"  # 後でドメインに変更

echo "=============================="
echo " デプロイ開始"
echo "=============================="

# ----------------------------------------
# 1. リポジトリのクローン
# ----------------------------------------
echo "[1/8] リポジトリをクローン中..."
if [ -d "$APP_DIR" ]; then
    cd "$APP_DIR"
    git pull origin main
else
    git clone "$REPO_URL" "$APP_DIR"
    cd "$APP_DIR"
fi

# ----------------------------------------
# 2. Composerパッケージインストール
# ----------------------------------------
echo "[2/8] Composerパッケージをインストール中..."
composer install --no-dev --optimize-autoloader --no-interaction

# ----------------------------------------
# 3. .env の作成
# ----------------------------------------
echo "[3/8] .env を設定中..."
if [ ! -f "$APP_DIR/.env" ]; then
    cp "$APP_DIR/.env.example" "$APP_DIR/.env"
fi

php artisan key:generate --force

# .env の設定を更新
sed -i "s|APP_ENV=.*|APP_ENV=production|" .env
sed -i "s|APP_DEBUG=.*|APP_DEBUG=false|" .env
sed -i "s|APP_URL=.*|APP_URL=http://$DOMAIN|" .env
sed -i "s|DB_CONNECTION=.*|DB_CONNECTION=mysql|" .env
sed -i "s|DB_HOST=.*|DB_HOST=127.0.0.1|" .env
sed -i "s|DB_PORT=.*|DB_PORT=3306|" .env
sed -i "s|DB_DATABASE=.*|DB_DATABASE=$DB_NAME|" .env
sed -i "s|DB_USERNAME=.*|DB_USERNAME=$DB_USER|" .env
sed -i "s|DB_PASSWORD=.*|DB_PASSWORD=$DB_PASS|" .env
sed -i "s|CACHE_STORE=.*|CACHE_STORE=redis|" .env
sed -i "s|QUEUE_CONNECTION=.*|QUEUE_CONNECTION=redis|" .env
sed -i "s|SESSION_DRIVER=.*|SESSION_DRIVER=redis|" .env

echo ""
echo "=============================="
echo " メール設定が必要です"
echo "=============================="
echo "以下をあとで .env に設定してください:"
echo "  MAIL_USERNAME=your-address@your-domain.com"
echo "  MAIL_PASSWORD=（Googleアプリパスワード）"
echo "  MAIL_FROM_ADDRESS=your-address@your-domain.com"
echo "  BULKMAIL_SPREADSHEET_ID=（スプレッドシートID）"
echo ""

# ----------------------------------------
# 4. パーミッション設定
# ----------------------------------------
echo "[4/8] パーミッションを設定中..."
chown -R www-data:www-data "$APP_DIR"
chmod -R 775 "$APP_DIR/storage" "$APP_DIR/bootstrap/cache"
mkdir -p "$APP_DIR/storage/app/google"
chown -R www-data:www-data "$APP_DIR/storage/app/google"

# ----------------------------------------
# 5. データベースのマイグレーション
# ----------------------------------------
echo "[5/8] データベースをマイグレーション中..."
php artisan migrate --force

# ----------------------------------------
# 6. Nginxの設定
# ----------------------------------------
echo "[6/8] Nginxを設定中..."
cat > /etc/nginx/sites-available/bulk-email << EOF
server {
    listen 80;
    server_name $DOMAIN;
    root $APP_DIR/public;
    index index.php;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    location / {
        try_files \$uri \$uri/ /index.php?\$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME \$realpath_root\$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
EOF

ln -sf /etc/nginx/sites-available/bulk-email /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# ----------------------------------------
# 7. Supervisorの設定（Queueワーカー）
# ----------------------------------------
echo "[7/8] Supervisorを設定中..."
cat > /etc/supervisor/conf.d/bulk-email-worker.conf << EOF
[program:bulk-email-worker]
process_name=%(program_name)s_%(process_num)02d
command=php $APP_DIR/artisan queue:work redis --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=$APP_DIR/storage/logs/worker.log
stopwaitsecs=3600
EOF

supervisorctl reread
supervisorctl update
supervisorctl start bulk-email-worker:* || true

# ----------------------------------------
# 8. キャッシュの最適化
# ----------------------------------------
echo "[8/8] キャッシュを最適化中..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo ""
echo "=============================="
echo " デプロイ完了！"
echo "=============================="
echo " アクセス: http://$DOMAIN"
echo ""
echo " 次のステップ:"
echo " 1. .env にメール設定を追加: nano $APP_DIR/.env"
echo " 2. Google認証情報を配置: $APP_DIR/storage/app/google/credentials.json"
echo " 3. 配信リストを同期: php $APP_DIR/artisan recipients:sync"
echo "=============================="
