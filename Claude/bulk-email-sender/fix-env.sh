#!/bin/bash
# .env設定・アプリキー生成スクリプト

APP=/var/www/bulk-email/Claude/bulk-email-sender

cd $APP

update_env() {
    KEY=$1; VALUE=$2
    if grep -q "^${KEY}=" .env; then
        sed -i "s|^${KEY}=.*|${KEY}=${VALUE}|" .env
    else
        echo "${KEY}=${VALUE}" >> .env
    fi
}

update_env APP_ENV production
update_env APP_DEBUG false
update_env APP_URL "http://210.131.222.160"
update_env DB_CONNECTION mysql
update_env DB_HOST 127.0.0.1
update_env DB_PORT 3306
update_env DB_DATABASE bulk_email
update_env DB_USERNAME bulkmail
update_env DB_PASSWORD Bulkmail2026
update_env CACHE_STORE redis
update_env QUEUE_CONNECTION redis
update_env SESSION_DRIVER redis

php8.4 artisan key:generate --force
php8.4 artisan config:clear
php8.4 artisan view:clear

echo "完了"
