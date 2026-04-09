<?php

namespace App\Console\Commands;

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
            // 同期ロジックはSpreadsheetServiceに集約
            $result = $spreadsheetService->syncRecipients();
        } catch (\Exception $e) {
            $this->error('スプレッドシートの取得に失敗しました: ' . $e->getMessage());
            Log::error('recipients:sync 失敗', ['error' => $e->getMessage()]);
            return self::FAILURE;
        }

        if ($result['new'] === 0 && $result['updated'] === 0 && $result['skipped'] === 0) {
            $this->warn('スプレッドシートにデータがありません。');
            return self::SUCCESS;
        }

        $newCount = $result['new'];
        $updatedCount = $result['updated'];
        $skippedCount = $result['skipped'];

        $this->info("同期完了: 新規 {$newCount}件、更新 {$updatedCount}件、スキップ {$skippedCount}件");
        Log::info('recipients:sync 完了', compact('newCount', 'updatedCount', 'skippedCount'));

        return self::SUCCESS;
    }
}
