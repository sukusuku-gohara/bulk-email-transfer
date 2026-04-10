# meets DB設計 修正指示プロンプト

以下のプロンプトを使用して、DB設計担当者（またはAI）にER図・マイグレーションの修正を指示してください。

---

## プロンプト本文

```
あなたは婚活マッチングプラットフォーム「meets」のデータベース設計担当です。
2026/03/23版のER図（meets20260323.pdf）に対するレビューが完了し、
最新の仕様書（meets_requirements_specification.md v1.2、meets_technical_requirements.md v1.1）
との間にいくつかの不整合・不足が確認されました。

以下の修正を実施してください。
修正後は、更新されたER図とLaravelマイグレーションファイルを出力してください。

---

## 【優先度：高】既存テーブルの修正（3件）

### 修正1: bookmarks（会員お気に入り）テーブル — 物理削除への変更
- `deleted_at`（削除日時）カラムを削除してください
- LaravelモデルからSoftDeletesトレイトを除外してください
- 削除処理は物理DELETE（$bookmark->delete() ではなく forceDelete 相当）にしてください
- 根拠: TR-079「削除はソフトデリートではなく物理削除とする」

### 修正2: bookmarks（会員お気に入り）テーブル — created_by_roleカラム追加
- `created_by_role` カラムを追加してください
  - 型: ENUM('member', 'agent')
  - NOT NULL
  - デフォルト値: 'member'
- このカラムは「誰がブックマークしたか」（会員本人 or 担当エージェント）を記録します
- 既存の`ラベル`カラムが同等の役割を果たしているなら統合を検討。そうでなければ別目的として両方残してください
- 根拠: TR-079 カラム定義「id, user_id, target_user_id, created_by_role, created_at」

### 修正3: bookmarks（会員お気に入り）テーブル — 複合ユニーク制約
- `user_id` + `target_user_id` に複合ユニーク制約を付与してください
- マイグレーション例:
  ```php
  $table->unique(['user_id', 'target_user_id']);
  ```
- 根拠: TR-079「user_id + target_user_id の複合ユニーク制約。重複ブックマークを防止」

---

## 【優先度：高】新規テーブル追加（1件）

### 追加1: agent_reviews（エージェント評価）テーブル
成婚退会時に会員がエージェントを5段階で評価する機能に対応するテーブルです。
現状、`仲人プロフィール`に集計値（評価点・レビュー件数）はありますが、個別レビューの格納先がありません。

```
テーブル名: agent_reviews
カラム:
  - id: ULID（PK）
  - reviewer_user_id: ULID（FK → users.id）評価した会員
  - agent_user_id: ULID（FK → users.id）評価されたエージェント
  - rating: TINYINT UNSIGNED NOT NULL（1〜5）CHECK制約付き
  - comment: TEXT NULLABLE（自由記述コメント）
  - created_at: TIMESTAMP NOT NULL
  - updated_at: TIMESTAMP NOT NULL

制約:
  - reviewer_user_id + agent_user_id の複合ユニーク（1会員につき1エージェント1レビュー）
  - rating の CHECK制約: rating BETWEEN 1 AND 5

リレーション:
  - reviewer_user_id → users.id（多対1）
  - agent_user_id → users.id（多対1）
```

根拠: BR-048「所属会員による評価（5段階）＋コメント入力」

---

## 【優先度：中】新規テーブル追加（3件）

### 追加2: violations（違反記録）テーブル
段階的ペナルティ（警告→14日停止→永久停止）の履歴を管理するテーブルです。
現状、`ユーザー`テーブルに`違反回数`はありますが、個別の違反履歴が追えません。

```
テーブル名: violations
カラム:
  - id: ULID（PK）
  - user_id: ULID（FK → users.id）違反した会員
  - violation_type: VARCHAR(50) NOT NULL（例: 'ng_word', 'harassment', 'fake_profile', 'payment_fraud'）
  - description: TEXT NULLABLE（違反の詳細説明）
  - evidence_url: VARCHAR(500) NULLABLE（証拠のURL/スクリーンショット等）
  - action_taken: ENUM('warning', 'suspension_14d', 'permanent_ban') NOT NULL
  - detected_at: TIMESTAMP NOT NULL（違反検知日時）
  - suspension_start: TIMESTAMP NULLABLE（停止開始日時）
  - suspension_until: TIMESTAMP NULLABLE（停止解除日時）
  - handled_by_user_id: ULID NULLABLE（FK → users.id）対応した管理者
  - created_at: TIMESTAMP NOT NULL
  - updated_at: TIMESTAMP NOT NULL

インデックス:
  - user_id（違反履歴の高速参照）
  - (user_id, action_taken)（段階的ペナルティ判定用）
```

根拠: BR-054, BR-055, BR-028

### 追加3: announcements（お知らせ配信）テーブル
セグメント別の運営お知らせ（全会員/エージェントのみ/特定地域等）を管理するテーブルです。
既存の`通知`テーブルは個別ユーザー向けであり、全体配信には対応していません。

```
テーブル名: announcements
カラム:
  - id: ULID（PK）
  - title: VARCHAR(200) NOT NULL
  - body: TEXT NOT NULL
  - target_segment: ENUM('all', 'members_only', 'agents_only', 'ambassadors_only') NOT NULL DEFAULT 'all'
  - target_conditions: JSON NULLABLE（地域や属性での絞り込み条件）
  - priority: ENUM('low', 'normal', 'high', 'urgent') NOT NULL DEFAULT 'normal'
  - published_at: TIMESTAMP NULLABLE（公開日時。NULLなら下書き）
  - expires_at: TIMESTAMP NULLABLE（掲載終了日時）
  - created_by_user_id: ULID（FK → users.id）作成した管理者
  - created_at: TIMESTAMP NOT NULL
  - updated_at: TIMESTAMP NOT NULL

インデックス:
  - (target_segment, published_at)（セグメント別の有効お知らせ取得用）
  - published_at（時系列での取得用）
```

根拠: BR-057

### 追加4: ng_words（NGワード辞書）テーブル
チャットのNGワードフィルタリングに使用する辞書テーブルです。
初期100ワード、運用で随時追加・更新されます。

```
テーブル名: ng_words
カラム:
  - id: ULID（PK）
  - word: VARCHAR(100) NOT NULL
  - category: VARCHAR(50) NOT NULL DEFAULT 'general'（例: 'contact_info', 'harassment', 'spam', 'general'）
  - is_active: BOOLEAN NOT NULL DEFAULT TRUE
  - created_by_user_id: ULID NULLABLE（FK → users.id）登録した管理者
  - created_at: TIMESTAMP NOT NULL
  - updated_at: TIMESTAMP NOT NULL

制約:
  - word のユニーク制約（同一ワードの重複登録防止）

インデックス:
  - (is_active, category)（アクティブワードのカテゴリ別取得用）
```

根拠: BR-027, NFR-509

---

## 【優先度：中】インデックス追加（既存テーブル）

以下のインデックスをマイグレーションに追加してください:

| # | テーブル | カラム | 種別 | 目的 |
|---|---------|--------|------|------|
| 1 | users | last_login_at | 単体 B-tree | 最終ログイン日時での絞り込み・ソート（TR-078, TR-080） |
| 2 | member_profiles | created_at | 単体 B-tree | NEWバッジ判定・登録日ソート（TR-080） |
| 3 | users | (last_login_at DESC, created_at DESC) | 複合 B-tree | 推奨順ソートの高速化（TR-011） |
| 4 | bookmarks | target_user_id | 単体 B-tree | 被ブックマーク数の集計高速化（TR-012） |

---

## 【優先度：低】設計検討事項（要回答）

以下は修正ではなく、設計方針の確認事項です。回答をコメントとして記載してください。

### 検討1: 月次お見合い申込回数の管理方式
現在`お見合い申込`テーブルに`月次申込回数スナップショット`カラムがありますが、
以下のどちらの方式を採用しますか？

- **案A**: 専用カウンターテーブル `monthly_request_counts(user_id, year_month, count)` を新設
- **案B**: リアルタイム算出 `COUNT(*) WHERE user_id = ? AND created_at BETWEEN 月初 AND 月末`
- **推奨**: Phase 1（1,000名規模）では案Bで十分。スナップショットカラムは削除を推奨

### 検討2: 振込テーブルのアンバサダー分配
成婚料の分配（エージェント + アンバサダー + meets手数料10%）において、
`振込`テーブルの`振込種別`カラムで以下を区別できるか確認してください:

- agent_success_fee（エージェント成婚報酬）
- ambassador_referral_fee（アンバサダー紹介報酬）
- platform_fee（meets手数料）

1件の成婚に対して複数の振込レコードを生成する設計であるか確認してください。

---

## 出力形式

1. 更新後のER図（draw.io XML形式 or PlantUML形式）
2. Laravelマイグレーションファイル一式
3. 検討事項への回答コメント
4. 変更サマリ（何をどう変えたかの一覧）
```

---

## 使用方法

1. 上記プロンプトをそのままDB設計担当者またはAIに渡してください
2. 出力されたER図・マイグレーションをレビューし、仕様書と再度突き合わせてください
3. 検討事項の回答が返ってきたら、方針を決定して仕様書にも反映してください
