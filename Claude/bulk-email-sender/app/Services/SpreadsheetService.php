<?php

namespace App\Services;

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
     * @return array{email: string, name: string|null}[]
     */
    public function fetchRecipients(): array
    {
        $spreadsheetId = config('bulkmail.spreadsheet_id');
        $range = config('bulkmail.spreadsheet_range');

        try {
            $response = $this->sheetsService->spreadsheets_values->get($spreadsheetId, $range);
            $rows = $response->getValues() ?? [];

            return $this->parseRows($rows);
        } catch (\Exception $e) {
            // API呼び出し失敗時はログに残して例外を再スロー
            Log::error('Google Sheets API呼び出し失敗', [
                'error' => $e->getMessage(),
                'spreadsheet_id' => $spreadsheetId,
                'range' => $range,
            ]);
            throw $e;
        }
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
