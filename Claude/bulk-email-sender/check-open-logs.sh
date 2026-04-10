#!/bin/bash
# 開封ログのIPアドレス・ユーザーエージェントを確認するスクリプト

php /var/www/bulk-email/Claude/bulk-email-sender/artisan tinker --execute="
App\Models\OpenLog::select('ip_address', 'user_agent')
    ->latest()
    ->limit(10)
    ->get()
    ->each(function(\$log) {
        echo \$log->ip_address . ' | ' . substr(\$log->user_agent, 0, 80) . PHP_EOL;
    });
"
