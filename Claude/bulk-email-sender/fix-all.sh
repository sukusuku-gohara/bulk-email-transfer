#!/bin/bash
# 全修正スクリプト

APP=/var/www/bulk-email/Claude/bulk-email-sender
cd $APP

echo "[1/5] storageディレクトリ作成・パーミッション設定..."
mkdir -p storage/logs storage/framework/views storage/framework/cache storage/framework/sessions storage/app/google bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache

echo "[2/5] デバッグ一時有効化..."
sed -i "s|^APP_DEBUG=.*|APP_DEBUG=true|" .env

echo "[3/5] キャッシュクリア..."
php8.4 artisan config:clear
php8.4 artisan view:clear
php8.4 artisan cache:clear

echo "[4/5] マイグレーション実行..."
php8.4 artisan migrate --force

echo "[5/5] デバッグ無効化..."
sed -i "s|^APP_DEBUG=.*|APP_DEBUG=false|" .env
php8.4 artisan config:cache

echo ""
echo "完了。http://210.131.222.160/login を確認してください"
