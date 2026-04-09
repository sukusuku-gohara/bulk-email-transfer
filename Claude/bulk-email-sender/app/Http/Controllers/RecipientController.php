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
            // 同期ロジックはSpreadsheetServiceに集約（RecipientsSyncCommandと共通）
            $result = $spreadsheetService->syncRecipients();
            $newCount = $result['new'];
            $updatedCount = $result['updated'];

            return back()->with('success', "同期完了: 新規 {$newCount}件、更新 {$updatedCount}件");
        } catch (\Exception $e) {
            return back()->with('error', 'スプレッドシートの取得に失敗しました: ' . $e->getMessage());
        }
    }
}
