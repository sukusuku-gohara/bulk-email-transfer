# frontend — 管理画面UI開発Agent

## 役割

Blade + Tailwind CSS + Alpine.js で管理画面を構築する。PCからの利用のみ想定。

## 画面一覧

| 画面 | ルート | メソッド | Controller |
|------|--------|---------|------------|
| ダッシュボード | `/dashboard` | GET | DashboardController@index |
| メール作成 | `/campaigns/create` | GET | CampaignController@create |
| メール送信実行 | `/campaigns` | POST | CampaignController@store |
| テスト送信 | `/campaigns/test` | POST | CampaignController@test |
| 配信履歴一覧 | `/campaigns` | GET | CampaignController@index |
| 配信詳細 | `/campaigns/{id}` | GET | CampaignController@show |
| 配信リスト | `/recipients` | GET | RecipientController@index |
| リスト同期実行 | `/recipients/sync` | POST | RecipientController@sync |
| 配信停止者一覧 | `/unsubscribes` | GET | UnsubscribeController@index |

## Blade構成

```
resources/views/
├── layouts/
│   └── app.blade.php              # サイドバー + ヘッダー + メインエリア
├── components/
│   ├── button.blade.php           # ボタン（primary / danger / secondary）
│   ├── card.blade.php             # カード（タイトル + コンテンツ）
│   ├── table.blade.php            # テーブル（ヘッダー + ボディ slot）
│   ├── stat-card.blade.php        # 数値カード（ダッシュボード用）
│   ├── flash-message.blade.php    # 成功/エラーの通知バー
│   └── confirm-dialog.blade.php   # 確認ダイアログ（Alpine.js）
├── dashboard.blade.php
├── campaigns/
│   ├── index.blade.php            # 一覧テーブル + ページネーション
│   ├── create.blade.php           # 件名・本文フォーム + プレビュー
│   └── show.blade.php             # 配信詳細 + 開封者テーブル
├── recipients/
│   └── index.blade.php            # アドレス一覧 + 同期ボタン
└── unsubscribes/
    └── index.blade.php            # 配信停止者一覧
```

## UI設計ルール

- **配色:** Tailwindのデフォルトカラー。Primary=indigo-600、Danger=red-600、Success=green-600
- **レイアウト:** 左サイドバー（w-64）+ 右メインエリア。サイドバーにナビゲーション
- **テーブル:** 1ページ50件。Laravelの `->paginate(50)` を使用
- **開封率:** プログレスバー（`bg-indigo-600` の横棒グラフ）で表示
- **配信ボタン:** 赤系の目立つボタン + Alpine.jsの確認ダイアログ。2段階確認必須
- **プレビュー:** メール作成画面の右半分にリアルタイムプレビュー（Alpine.js `x-model` で連動）
- **フラッシュメッセージ:** `session('success')` / `session('error')` をページ上部に表示、3秒で自動非表示

## コーディングルール

- Bladeコンポーネントを積極的に使い、HTMLの重複を避ける
- CSSはTailwindユーティリティクラスのみ。カスタムCSS禁止
- JSはAlpine.jsインラインで完結。別ファイルに切り出さない
- フォームには `@csrf` を必ず付与
- バリデーションエラーは `@error('field')` で各フィールド下に赤文字表示
