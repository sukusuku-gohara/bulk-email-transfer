# meets Agent Team 使い方ガイド

## セットアップ手順

### 1. ファイルの配置
このフォルダの中身を、meetsプロジェクトのルートディレクトリにコピーしてください。

```bash
# プロジェクトルートに配置
cp CLAUDE.md /path/to/meets/
cp -r agents/ /path/to/meets/
cp -r docs/ /path/to/meets/

# 要件定義書もdocs/に配置（すでにアップロード済みのファイル）
cp meets_business_requirements.xlsx /path/to/meets/docs/
cp meets_requirements_specification.xlsx /path/to/meets/docs/
cp meets_technical_requirements.xlsx /path/to/meets/docs/
cp meets20260323.pdf /path/to/meets/docs/
cp meets_db_design_feedback_20260330.md /path/to/meets/docs/
cp meets_db_修正指示プロンプト.md /path/to/meets/docs/
```

最終的なディレクトリ構成:
```
meets/
├── CLAUDE.md                              ← 共通ルール
├── agents/
│   ├── orchestrator.md                    ← リードAgent
│   ├── database.md                        ← DB設計Agent
│   ├── backend.md                         ← バックエンドAgent
│   ├── frontend.md                        ← フロントエンドAgent
│   └── reviewer.md                        ← レビューAgent
├── docs/
│   ├── meets_business_requirements.xlsx
│   ├── meets_requirements_specification.xlsx
│   ├── meets_technical_requirements.xlsx
│   ├── meets20260323.pdf
│   ├── meets_db_design_feedback_20260330.md
│   └── meets_db_修正指示プロンプト.md
├── app/                                   ← Laravel ソースコード
├── routes/
├── resources/views/
└── ...
```

### 2. Claude Codeの起動

```bash
cd /path/to/meets
claude
```

## 使い方

### 基本：orchestrator（リードAgent）に指示を出す

一番のおすすめは、orchestratorに全体を任せる方法です。
orchestratorが自動的に他のAgentにTask（サブタスク）を振ります。

```
# 例1: 機能単位で指示
ユーザー認証とロール管理機能を実装してください。
対象要件はBR-001〜004です。
agents/orchestrator.md の手順に従って進めてください。

# 例2: DB設計から始める
agents/orchestrator.md に従い、Phase Aの基盤機能から
開発を始めてください。まずDBマイグレーションからお願いします。
```

### 個別Agent を直接呼ぶ場合

特定の作業だけをやりたい場合は、Agentを直接指定できます。

```
# DB設計だけ
agents/database.md に従い、bookmarksテーブルの修正を行ってください。
docs/meets_db_修正指示プロンプト.md の修正1〜3を反映してください。

# バックエンド実装だけ
agents/backend.md に従い、ブックマーク機能のCRUDを実装してください。
対象要件: BR-079

# フロントエンドだけ
agents/frontend.md に従い、既存の検索結果HTMLに
NEWバッジ（BR-081）と最終ログイン日ラベル（BR-078）を追加してください。

# コードレビュー
agents/reviewer.md に従い、app/Http/Controllers/Member/BookmarkController.php
をレビューしてください。対象要件: BR-079
```

### 実行の流れ（イメージ）

```
あなた → orchestrator に「お見合い申込機能を作って」と指示
              ↓
         orchestrator が要件を読む（BR-014, BR-065〜067）
              ↓
         Task① database Agent → マイグレーション・モデル作成
              ↓
         Task② backend Agent → コントローラ・サービス・ルーティング実装
              ↓
         Task③ frontend Agent → Bladeテンプレート変換
              ↓
         Task④ reviewer Agent → コードレビュー
              ↓
         orchestrator が結果を統合して報告
```

## Tips

### トークン節約のコツ
- 1回の指示で扱う機能は1〜2個に絞る（全機能を一度に作ろうとしない）
- orchestratorに「Phase Aだけ」「BR-014だけ」と範囲を明確に指定する
- レビューは複数機能まとめて依頼してOK

### うまくいかないとき
- エラーが出たら、エラーメッセージをそのまま貼って「修正してください」
- 要件と違う実装になったら「BR-XXXの受け入れ基準AC-XXX-Xを満たしていません」と具体的に指摘
- Agent間で矛盾が出たら、orchestratorに「database Agentとbackend Agentの実装を統合してください」

### 注意事項
- 各Agentは CLAUDE.md を自動的に読みます（Claude Codeの仕様）
- agents/ 配下の .md ファイルは、Taskの system prompt として参照されます
- docs/ 配下のファイルは、Agentが必要に応じて読みに行きます
