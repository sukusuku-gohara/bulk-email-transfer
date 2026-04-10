#!/bin/bash
# Supervisor設定スクリプト

echo "[1/2] Supervisor設定ファイルを作成中..."
python3 - << 'PYEOF'
content = """[program:bulk-email-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/bulk-email/Claude/bulk-email-sender/artisan queue:work redis --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/bulk-email/Claude/bulk-email-sender/storage/logs/worker.log
stopwaitsecs=3600
"""
with open("/etc/supervisor/conf.d/bulk-email-worker.conf", "w") as f:
    f.write(content)
print("Supervisor設定ファイルを作成しました")
PYEOF

echo "[2/2] Supervisorを再起動..."
supervisorctl reread && supervisorctl update && supervisorctl start "bulk-email-worker:*" || true

echo ""
supervisorctl status
echo ""
echo "=============================="
echo " Supervisor設定完了！"
echo "=============================="
