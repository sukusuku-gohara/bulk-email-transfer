#!/bin/bash
# =============================================================================
# meets ローカル環境セットアップスクリプト
# 使い方: bash setup.sh
# =============================================================================
set -e

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/app" && pwd)"
TEMP_DIR="/tmp/meets-laravel-scaffold-$$"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  meets ローカル環境セットアップ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# -----------------------------------------------------------------------
# 1. PHP バージョン確認
# -----------------------------------------------------------------------
PHP_BIN="${PHP_BIN:-php}"
PHP_VERSION=$($PHP_BIN -r "echo PHP_MAJOR_VERSION.'.'.PHP_MINOR_VERSION;")
echo "✓ PHP $PHP_VERSION"

# -----------------------------------------------------------------------
# 2. Composer インストール確認・インストール
# -----------------------------------------------------------------------
if ! command -v composer &>/dev/null; then
  echo "→ Composer をインストール中..."
  $PHP_BIN -r "copy('https://getcomposer.org/installer', '/tmp/composer-setup.php');"
  $PHP_BIN /tmp/composer-setup.php --install-dir=/usr/local/bin --filename=composer --quiet
  rm -f /tmp/composer-setup.php
  echo "✓ Composer インストール完了"
else
  echo "✓ Composer $(composer --version --no-ansi 2>/dev/null | awk '{print $3}')"
fi

# -----------------------------------------------------------------------
# 3. Laravel ボイラープレートを一時ディレクトリに生成してコピー
#    （artisan, public/, storage/, tests/, config/ など）
# -----------------------------------------------------------------------
echo ""
echo "→ Laravel 13 ボイラープレートを生成中（初回は数分かかります）..."
composer create-project laravel/laravel "$TEMP_DIR" --quiet --no-interaction

# コピーすべきディレクトリ・ファイル（カスタム実装を上書きしないもの）
COPY_ITEMS=(
  artisan
  public
  storage
  tests
  config
  database/factories
  database/seeders
  phpunit.xml
  package.json
  .env.example
)

echo "→ ボイラープレートファイルをコピー中..."
for item in "${COPY_ITEMS[@]}"; do
  src="$TEMP_DIR/$item"
  dst="$APP_DIR/$item"
  if [ -e "$src" ] && [ ! -e "$dst" ]; then
    cp -r "$src" "$dst"
  fi
done

# config/ は存在していてもカスタムファイル以外をマージ
for cfg in "$TEMP_DIR"/config/*.php; do
  fname=$(basename "$cfg")
  dst_cfg="$APP_DIR/config/$fname"
  if [ ! -f "$dst_cfg" ]; then
    cp "$cfg" "$dst_cfg"
  fi
done

# storage ディレクトリ構成を確保
mkdir -p "$APP_DIR/storage/app/public"
mkdir -p "$APP_DIR/storage/framework/cache/data"
mkdir -p "$APP_DIR/storage/framework/sessions"
mkdir -p "$APP_DIR/storage/framework/testing"
mkdir -p "$APP_DIR/storage/framework/views"
mkdir -p "$APP_DIR/storage/logs"
touch "$APP_DIR/storage/logs/.gitkeep" 2>/dev/null || true

# AppServiceProvider がなければ作成
PROVIDER_DIR="$APP_DIR/app/Providers"
mkdir -p "$PROVIDER_DIR"
if [ ! -f "$PROVIDER_DIR/AppServiceProvider.php" ]; then
  cp "$TEMP_DIR/app/Providers/AppServiceProvider.php" "$PROVIDER_DIR/AppServiceProvider.php" 2>/dev/null || \
  cat > "$PROVIDER_DIR/AppServiceProvider.php" <<'EOF'
<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}
    public function boot(): void {}
}
EOF
fi

# 一時ディレクトリを削除
rm -rf "$TEMP_DIR"
echo "✓ ボイラープレートコピー完了"

# -----------------------------------------------------------------------
# 4. composer install（vendor/ がなければ実行）
# -----------------------------------------------------------------------
cd "$APP_DIR"

if [ ! -d "vendor" ]; then
  echo ""
  echo "→ composer install を実行中（しばらくお待ちください）..."
  composer install --no-interaction --quiet
  echo "✓ 依存パッケージインストール完了"
else
  echo "✓ vendor/ は既に存在します"
fi

# -----------------------------------------------------------------------
# 5. .env 作成・設定
# -----------------------------------------------------------------------
if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "✓ .env を作成しました"
fi

# DB設定を更新（SQLiteではなくMySQLを使用）
if grep -q "^DB_CONNECTION=sqlite" .env 2>/dev/null; then
  sed -i '' 's/^DB_CONNECTION=.*/DB_CONNECTION=mysql/'       .env
  sed -i '' 's/^# DB_HOST=/DB_HOST=/'                       .env
  sed -i '' 's/^DB_HOST=.*/DB_HOST=127.0.0.1/'              .env
  sed -i '' 's/^# DB_PORT=/DB_PORT=/'                       .env
  sed -i '' 's/^DB_PORT=.*/DB_PORT=3306/'                   .env
  sed -i '' 's/^# DB_DATABASE=/DB_DATABASE=/'               .env
  sed -i '' 's/^DB_DATABASE=.*/DB_DATABASE=meets/'          .env
  sed -i '' 's/^# DB_USERNAME=/DB_USERNAME=/'               .env
  sed -i '' 's/^DB_USERNAME=.*/DB_USERNAME=root/'           .env
  sed -i '' 's/^# DB_PASSWORD=/DB_PASSWORD=/'               .env
  echo "✓ .env を MySQL 設定に更新しました"
fi

# -----------------------------------------------------------------------
# 6. アプリキー生成
# -----------------------------------------------------------------------
if grep -q "APP_KEY=$" .env 2>/dev/null || ! grep -q "^APP_KEY=base64:" .env 2>/dev/null; then
  php artisan key:generate --no-interaction
  echo "✓ APP_KEY を生成しました"
else
  echo "✓ APP_KEY は設定済みです"
fi

# -----------------------------------------------------------------------
# 7. MySQL データベース作成
# -----------------------------------------------------------------------
echo ""
echo "→ データベース 'meets' を作成中..."
DB_PASSWORD=$(grep "^DB_PASSWORD=" .env | cut -d'=' -f2-)
if [ -z "$DB_PASSWORD" ]; then
  if mysql -u root -e "CREATE DATABASE IF NOT EXISTS meets CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null; then
    echo "✓ データベース 'meets' を確認・作成しました（パスワードなし）"
  else
    echo "  ※ MySQL に接続できませんでした"
    echo "  　.env の DB_PASSWORD を設定してから php artisan migrate を実行してください"
  fi
else
  if mysql -u root -p"$DB_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS meets CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null; then
    echo "✓ データベース 'meets' を確認・作成しました"
  else
    echo "  ※ MySQL に接続できませんでした。.env の DB_PASSWORD を確認してください"
  fi
fi

# -----------------------------------------------------------------------
# 8. マイグレーション実行
# -----------------------------------------------------------------------
echo ""
echo "→ マイグレーションを実行中..."
if php artisan migrate --no-interaction 2>&1; then
  echo "✓ マイグレーション完了"
else
  echo "  ※ マイグレーション失敗。DB設定を確認後 'php artisan migrate' を実行してください"
fi

# -----------------------------------------------------------------------
# 9. ストレージリンク作成
# -----------------------------------------------------------------------
php artisan storage:link --no-interaction 2>/dev/null && echo "✓ storage:link 作成" || true

# -----------------------------------------------------------------------
# 完了メッセージ
# -----------------------------------------------------------------------
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  セットアップ完了！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "開発サーバーを起動するには:"
echo ""
echo "  cd $APP_DIR"
echo "  php artisan serve"
echo ""
echo "ブラウザで http://localhost:8000 を開いてください"
echo ""
echo "ログイン画面: http://localhost:8000/auth"
echo ""
