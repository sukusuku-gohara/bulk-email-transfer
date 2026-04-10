#!/bin/bash
# Apache設定スクリプト

APP=/var/www/bulk-email/Claude/bulk-email-sender

echo "[1/3] Apache設定ファイルを作成中..."
python3 - << 'PYEOF'
content = """<VirtualHost *:80>
    ServerName 162.43.30.142
    DocumentRoot /var/www/bulk-email/Claude/bulk-email-sender/public

    <Directory /var/www/bulk-email/Claude/bulk-email-sender/public>
        AllowOverride All
        Require all granted
    </Directory>

    <FilesMatch \\.php$>
        SetHandler "proxy:unix:/var/run/php/php8.4-fpm.sock|fcgi://localhost"
    </FilesMatch>
</VirtualHost>
"""
with open("/etc/apache2/sites-available/bulk-email.conf", "w") as f:
    f.write(content)
print("Apache設定ファイルを作成しました")
PYEOF

echo "[2/3] モジュール有効化・サイト切り替え..."
a2enmod proxy_fcgi rewrite
a2ensite bulk-email
a2dissite 000-default

echo "[3/3] Apache再起動..."
systemctl reload apache2

echo ""
echo "=============================="
echo " Apache設定完了！"
echo " アクセス: http://162.43.30.142"
echo "=============================="
