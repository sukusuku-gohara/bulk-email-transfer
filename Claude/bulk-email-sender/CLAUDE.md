# CLAUDE.md — 一斉メール配信システム (bulk-email)

## プロジェクト概要

自社の独自ドメインメールアドレス（Google Workspace連携）から約1,000件の宛先に一斉メールを配信するWebシステム。

## 技術スタック

- **言語/FW:** PHP 8.3 / Laravel 13
- **DB:** MySQL 8
- **キュー:** Redis + Laravel Queue
- **フロント:** Blade + Tailwind CSS + Alpine.js
- **認証:** Laravel Breeze
- **メール送信:** Google Workspace SMTP（ポート587 / TLS）
- **配信リスト:** Google Sheets API v4（サービスアカウント認証）
- **サーバー:** Ubuntu 24.04 LTS（VPS）/ Nginx / Supervisor

## コーディング規約

### 全般
- 言語は日本語。コメント・コミットメッセージ・ドキュメントすべて日本語で書く
- 1ファイル1責任。ControllerにビジネスロジックNG → `app/Services/` に集約
- 設定値はハードコードせず `config/bulkmail.php` で一元管理
- 秘密情報は `.env` で管理。コードに直書き厳禁。`.env.example` にキー名だけ記載

### 命名規則
- Model: 単数形 PascalCase (`Campaign`, `Recipient`, `OpenLog`)
- Migration: Laravel標準の `create_xxx_table` 形式
- Service: `XxxService` (`CampaignService`, `SpreadsheetService`)
- Job: `XxxJob` (`SendCampaignJob`)
- Command: `xxx:yyy` (`recipients:sync`, `campaign:send`)
- Enum: `app/Enums/` に配置、PascalCase (`CampaignStatus`, `BounceType`)

### テスト
- Feature テストを基本とする（`tests/Feature/`）
- 配信フロー単位でテストを作成
- メール送信のテストは `Mail::fake()` を使用
- DB関連は `RefreshDatabase` トレイトを使用

### Git運用
- ブランチ: `feature/phase-{N}-{機能名}` (例: `feature/phase-1-db-design`)
- コミット: `[Phase {N}] 変更内容の要約` (例: `[Phase 1] campaigns テーブルの migration 追加`)
- Phase完了時に `main` へマージ

## ディレクトリ構成

```
bulk-email/
├── CLAUDE.md
├── agents/
│   ├── orchestrator.md
│   ├── backend.md
│   ├── frontend.md
│   ├── database.md
│   ├── tester.md
│   └── reviewer.md
├── docs/
│   └── requirements.md
├── app/
│   ├── Console/Commands/      # Artisanコマンド
│   ├── Enums/                 # Enum定義
│   ├── Http/Controllers/      # コントローラー
│   ├── Jobs/                  # Queueジョブ
│   ├── Mail/                  # Mailable クラス
│   ├── Models/                # Eloquent モデル
│   └── Services/              # ビジネスロジック
├── config/
│   └── bulkmail.php           # 本システム固有の設定
├── database/
│   └── migrations/
├── resources/
│   └── views/
│       ├── layouts/
│       ├── components/
│       ├── campaigns/
│       ├── recipients/
│       └── unsubscribes/
├── routes/
│   └── web.php
└── tests/
    └── Feature/
```

## 制約・注意事項

- **Google Workspace送信上限:** 1日2,000件。1日に複数回配信しない運用ルールを守る
- **スロットリング:** 1秒あたり2〜3通に制限。一気に送らない
- **配信停止リンク必須:** Gmail要件。メール本文 + `List-Unsubscribe` ヘッダーの両方に設定
- **開封トラッキングの限界:** 画像ブロック環境では検知不可。記録値は「最低でもこれだけ開封された」と解釈する

## Agent チーム

| Agent | ファイル | 役割 |
|-------|---------|------|
| orchestrator | `agents/orchestrator.md` | 全体統括・タスク分解・進行管理 |
| backend | `agents/backend.md` | メール送信・API連携・トラッキング実装 |
| frontend | `agents/frontend.md` | 管理画面UI構築 |
| database | `agents/database.md` | DB設計・migration・Model・Enum |
| tester | `agents/tester.md` | テスト作成・品質保証 |
| reviewer | `agents/reviewer.md` | コードレビュー・セキュリティチェック |

## フェーズ

| Phase | 内容 | 主担当 |
|-------|------|--------|
| 1 | 環境構築・DB設計・Sheets API連携 | orchestrator → database, backend |
| 2 | メール送信（SMTP・Queue・スロットリング） | backend |
| 3 | 開封トラッキング | backend |
| 4 | 管理画面 | frontend |
| 5 | 迷惑メール対策・配信停止 | backend |
| 6 | テスト・レビュー・デプロイ | tester, reviewer |
