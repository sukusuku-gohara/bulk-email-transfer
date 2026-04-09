<?php

namespace App\Http\Controllers;

use App\Models\Recipient;
use App\Services\SpreadsheetService;
use Illuminate\Http\Request;

class RecipientController extends Controller
{
    // 配信リスト一覧
    public function index()
    {
        $recipients = Recipient::orderBy('email')->paginate(50);
        return view('recipients.index', compact('recipients'));
    }

    // スプレッドシートから同期
    public function sync(SpreadsheetService $spreadsheetService)
    {
        try {
            // recipients:sync コマンドと同じロジックをサービス経由で実行
            $rows = $spreadsheetService->fetchRecipients();
            $newCount = 0;
            $updatedCount = 0;
            $syncedAt = now();

            foreach ($rows as $row) {
                $recipient = Recipient::where('email', $row['email'])->first();
                if ($recipient) {
                    if (!$recipient->is_active) continue;
                    $recipient->update(['name' => $row['name'], 'synced_at' => $syncedAt]);
                    $updatedCount++;
                } else {
                    Recipient::create([
                        'email' => $row['email'],
                        'name' => $row['name'],
                        'is_active' => true,
                        'bounce_count' => 0,
                        'synced_at' => $syncedAt,
                    ]);
                    $newCount++;
                }
            }

            return back()->with('success', "同期完了: 新規 {$newCount}件、更新 {$updatedCount}件");
        } catch (\Exception $e) {
            return back()->with('error', 'スプレッドシートの取得に失敗しました: ' . $e->getMessage());
        }
    }
}
