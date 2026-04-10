<?php

namespace App\Services;

use App\Models\Recipient;
use Google\Client;
use Google\Service\Sheets;
use Illuminate\Support\Facades\Log;

class SpreadsheetService
{
    private Sheets $sheetsService;

    public function __construct()
    {
        // サービスアカウント認証でGoogleクライアントを初期化
        $client = new Client();
        $client->setAuthConfig(config('bulkmail.google_credentials_path'));
        $client->addScope(Sheets::SPREADSHEETS_READONLY);
        $this->sheetsService = new Sheets($client);
    }

    /**
     * スプレッドシートからメールアドレス一覧を取得する
     *
     * @param string|null $sheetName シート名（省略時はconfig値を使用）
     * @return array{email: string, name: string|null}[]
     */
    public function fetchRecipients(?string $sheetName = null): array
    {
        $spreadsheetId = config('bulkmail.spreadsheet_id');
        $sheet = $sheetName ?? 'Sheet1';
        $range = "{$sheet}!A:B";

        try {
            $response = $this->sheetsService->spreadsheets_values->get($spreadsheetId, $range);
            $rows = $response->getValues() ?? [];

            return $this->parseRows($rows);
        } catch (\Exception $e) {
            Log::error('Google Sheets API呼び出し失敗', [
                'error' => $e->getMessage(),
                'spreadsheet_id' => $spreadsheetId,
                'range' => $range,
            ]);
            throw $e;
        }
    }

    /**
     * スプレッドシートからデータを取得してreicipientsテーブルへ同期する
     *
     * @return array{new: int, updated: int, skipped: int}
     * @throws \Exception API呼び出し失敗時
     */
    public function syncRecipients(): array
    {
        $rows = $this->fetchRecipients();

        if (empty($rows)) {
            return ['new' => 0, 'updated' => 0, 'skipped' => 0];
        }

        $syncedAt = now();
        $newCount = 0;
        $updatedCount = 0;
        $skippedCount = 0;

        foreach ($rows as $row) {
            $email = $row['email'];
            $name = $row['name'];

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

        return ['new' => $newCount, 'updated' => $updatedCount, 'skipped' => $skippedCount];
    }

    /**
     * スプレッドシートの行データを整形する
     * A列=メールアドレス、B列=名前（省略可）
     *
     * @param array $rows
     * @return array{email: string, name: string|null}[]
     */
    private function parseRows(array $rows): array
    {
        $recipients = [];

        foreach ($rows as $row) {
            // A列（メールアドレス）が空の行はスキップ
            $email = trim($row[0] ?? '');
            if (empty($email)) {
                continue;
            }

            // メールアドレスの形式チェック
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                continue;
            }

            $recipients[] = [
                'email' => strtolower($email),
                'name' => trim($row[1] ?? '') ?: null,
            ];
        }

        return $recipients;
    }
}
