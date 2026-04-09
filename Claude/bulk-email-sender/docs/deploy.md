# デプロイ手順書

## 前提環境

| 項目 | 内容 |
|------|------|
| OS | Ubuntu 24.04 LTS |
| Webサーバー | Nginx |
| PHP | 8.3 |
| DB | MySQL 8 |
| キュー | Redis + Laravel Queue (Supervisor) |
| ドメイン | 独自ドメイン（Google Workspace連携済み） |

---

## 1. サーバー初期セットアップ

### 1-1. 必要パッケージのインストール

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx mysql-server redis-server supervisor git unzip curl
# PHP 8.3
sudo add-apt-repository ppa:ondrej/php -y
sudo apt install -y php8.3 php8.3-fpm php8.3-mysql php8.3-redis php8.3-mbstring php8.3-xml php8.3-curl php8.3-zip
# Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
```

### 1-2. MySQL セットアップ

```bash
sudo mysql_secure_installation
sudo mysql -u root -p
```

```sql
CREATE DATABASE bulk_email CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'bulkmail'@'localhost' IDENTIFIED BY '安全なパスワードに変更';
GRANT ALL PRIVILEGES ON bulk_email.* TO 'bulkmail'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## 2. アプリケーションのデプロイ

### 2-1. リポジトリのクローン

```bash
cd /var/www
sudo git clone <リポジトリURL> bulk-email
sudo chown -R www-data:www-data bulk-email
cd bulk-email
```

### 2-2. Composer依存パッケージのインストール

```bash
composer install --no-dev --optimize-autoloader
```

### 2-3. 環境変数の設定

```bash
cp .env.example .env
nano .env
```

設定が必要な環境変数:

```
APP_NAME="一斉メール配信システム"
APP_ENV=production
APP_KEY=  # php artisan key:generate で生成
APP_DEBUG=false
APP_URL=https://your-domain.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=bulk_email
DB_USERNAME=bulkmail
DB_PASSWORD=（設定したパスワード）

CACHE_STORE=redis
QUEUE_CONNECTION=redis

MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-address@your-domain.com
MAIL_PASSWORD=（Googleアプリパスワード）
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your-address@your-domain.com
MAIL_FROM_NAME="配信元名"

BULKMAIL_SPREADSHEET_ID=（GoogleスプレッドシートのID）
BULKMAIL_SPREADSHEET_RANGE=Sheet1!A:B
```

### 2-4. アプリケーションキーの生成

```bash
php artisan key:generate
```

### 2-5. ストレージのパーミッション設定

```bash
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

### 2-6. Google サービスアカウント認証情報の配置

```bash
sudo mkdir -p storage/app/google
sudo nano storage/app/google/credentials.json
# → Googleコンソールからダウンロードした JSON の内容を貼り付け
sudo chown www-data:www-data storage/app/google/credentials.json
sudo chmod 600 storage/app/google/credentials.json
```

### 2-7. データベースのマイグレーション

```bash
php artisan migrate --force
```

### 2-8. フロントエンドのビルド

```bash
npm install
npm run build
```

---

## 3. Nginx の設定

```bash
sudo nano /etc/nginx/sites-available/bulk-email
```

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/bulk-email/public;
    index index.php;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/bulk-email /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

---

## 4. SSL証明書の設定（Let's Encrypt）

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 5. Laravel Queue Worker の設定（Supervisor）

```bash
sudo nano /etc/supervisor/conf.d/bulk-email-worker.conf
```

```ini
[program:bulk-email-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/bulk-email/artisan queue:work redis --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/bulk-email/storage/logs/worker.log
stopwaitsecs=3600
```

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start bulk-email-worker:*
```

---

## 6. 初期データの同期

```bash
# スプレッドシートから配信リストを同期
php artisan recipients:sync
```

---

## 7. 動作確認チェックリスト

- [ ] `https://your-domain.com/login` にアクセスしてログイン画面が表示される
- [ ] ログイン後にダッシュボードが表示される
- [ ] 配信リスト画面で「スプレッドシートから同期」ボタンが動作する
- [ ] テスト送信が自分のアドレスに届く
- [ ] Queue Workerが稼働している（`sudo supervisorctl status`）

---

## 8. 更新時のデプロイ手順

```bash
cd /var/www/bulk-email
git pull origin main
composer install --no-dev --optimize-autoloader
php artisan migrate --force
npm run build
php artisan config:cache
php artisan route:cache
php artisan view:cache
sudo supervisorctl restart bulk-email-worker:*
```

---

## 9. 運用上の注意事項

- **1日の送信上限**: Google Workspace は1日2,000件まで。同日に2回配信しない
- **Queue Worker の監視**: `sudo supervisorctl status` で定期的に稼働確認
- **ログの確認**: `tail -f storage/logs/laravel.log` でエラーを監視
- **バックアップ**: DBは定期バックアップを設定する

```bash
mysqldump -u bulkmail -p bulk_email > backup_$(date +%Y%m%d).sql
```
