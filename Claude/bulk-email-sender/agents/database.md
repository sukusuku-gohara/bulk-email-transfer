# database — DB設計Agent

## 役割

テーブル設計、migration、Eloquent Model、Enumの作成を担当する。

## テーブル設計

### campaigns（配信キャンペーン）

| カラム | 型 | 説明 |
|--------|------|------|
| id | bigIncrements | PK |
| subject | string(255) | メール件名 |
| body_html | longText | メール本文（HTML） |
| status | enum | draft / sending / completed / failed |
| total_count | unsignedInteger | 配信対象数 |
| sent_count | unsignedInteger | 送信済み数 |
| opened_count | unsignedInteger | 開封数（キャッシュ用） |
| bounced_count | unsignedInteger | バウンス数 |
| sent_at | timestamp nullable | 送信開始日時 |
| completed_at | timestamp nullable | 送信完了日時 |
| created_at / updated_at | timestamps | Laravel標準 |

### recipients（配信先アドレス）

| カラム | 型 | 説明 |
|--------|------|------|
| id | bigIncrements | PK |
| email | string(255) unique | メールアドレス |
| name | string(255) nullable | 名前（将来用） |
| is_active | boolean default true | 有効/無効（バウンス超過で無効化） |
| bounce_count | unsignedTinyInteger default 0 | 連続バウンス回数 |
| synced_at | timestamp nullable | 最終同期日時 |
| created_at / updated_at | timestamps | |

### campaign_recipients（配信×宛先の中間テーブル）

| カラム | 型 | 説明 |
|--------|------|------|
| id | bigIncrements | PK |
| campaign_id | foreignId | campaigns.id |
| recipient_id | foreignId | recipients.id |
| tracking_id | uuid unique | 開封トラッキング用のユニークID |
| status | enum | pending / sent / failed / bounced |
| sent_at | timestamp nullable | 送信日時 |
| created_at | timestamp | |

インデックス: `(campaign_id, recipient_id)` にユニーク制約

### open_logs（開封ログ）

| カラム | 型 | 説明 |
|--------|------|------|
| id | bigIncrements | PK |
| campaign_recipient_id | foreignId | campaign_recipients.id |
| opened_at | timestamp | 開封日時 |
| ip_address | string(45) nullable | アクセス元IP |
| user_agent | string(500) nullable | ブラウザ/メーラー情報 |

### unsubscribes（配信停止）

| カラム | 型 | 説明 |
|--------|------|------|
| id | bigIncrements | PK |
| email | string(255) unique | 停止したアドレス |
| token | string(64) unique | 配信停止リンク用トークン |
| unsubscribed_at | timestamp | 停止日時 |
| created_at | timestamp | |

## Enum定義

### app/Enums/CampaignStatus.php
- `Draft` — 下書き
- `Sending` — 送信中
- `Completed` — 送信完了
- `Failed` — 送信失敗

### app/Enums/RecipientStatus.php
- `Pending` — 未送信
- `Sent` — 送信済み
- `Failed` — 送信失敗
- `Bounced` — バウンス

## Eloquent Model リレーション

- `Campaign` hasMany `CampaignRecipient`
- `Recipient` hasMany `CampaignRecipient`
- `CampaignRecipient` belongsTo `Campaign`, belongsTo `Recipient`, hasMany `OpenLog`
- `Campaign` hasManyThrough `Recipient` via `CampaignRecipient`

## コーディングルール

- Enumは `backed enum` (string型) で定義し、DBには文字列で保存
- Modelに `$casts` でEnum型を指定
- migration名は `create_xxx_table` / `add_xxx_to_yyy_table` 形式
- 外部キーには `->constrained()->cascadeOnDelete()` を設定
- `$fillable` を明示的に定義。`$guarded` は使わない
