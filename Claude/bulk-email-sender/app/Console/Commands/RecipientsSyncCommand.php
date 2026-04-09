<?php

namespace App\Console\Commands;

use App\Models\Recipient;
use App\Services\SpreadsheetService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class RecipientsSyncCommand extends Command
{
    protected $signature = 'recipients:sync';
    protected $description = 'Googleスプレッドシートから配信リストを同期する';

    public function handle(SpreadsheetService $spreadsheetService): int
    {
        $this->info('スプレッドシートからの同期を開始します...');

        try {
            $rows = $spreadsheetService->fetchRecipients();
        } catch (\Exception $e) {
            $this->error('スプレッドシートの取得に失敗しました: ' . $e->getMessage());
            Log::error('recipients:sync 失敗', ['error' => $e->getMessage()]);
            return self::FAILURE;
        }

        if (empty($rows)) {
            $this->warn('スプレッドシートにデータがありません。');
            return self::SUCCESS;
        }

        $syncedAt = now();
        $newCount = 0;
        $updatedCount = 0;
        $skippedCount = 0;

        foreach ($rows as $row) {
            $email = $row['email'];
            $name = $row['name'];

            // 重複チェック: すでに存在する場合は名前と同期日時を更新
            $recipient = Recipient::where('email', $email)->first();

            if ($recipient) {
                // バウンスで無効化されたアドレスは上書きしない
                if (!$recipient->is_active) {
                    $skippedCount++;
                    continue;
                }
                $recipient->update(['name' => $name, 'synced_at' => $syncedAt]);
                $updatedCount++;
            } else {
                Recipient::create([
                    'email' => $email,
                    'name' => $name,
                    'is_active' => true,
                    'bounce_count' => 0,
                    'synced_at' => $syncedAt,
                ]);
                $newCount++;
            }
        }

        $this->info("同期完了: 新規 {$newCount}件、更新 {$updatedCount}件、スキップ {$skippedCount}件");
        Log::info('recipients:sync 完了', compact('newCount', 'updatedCount', 'skippedCount'));

        return self::SUCCESS;
    }
}
