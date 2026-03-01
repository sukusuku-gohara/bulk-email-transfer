# Gemini Eyecatch Generator

記事の本文を入力するだけで、Geminiが魅力的なアイキャッチ画像の「アイデア出し」から「ラフ制作」、そして「最高品質の本番画像生成（Imagen 3 等）」までを一気通貫で行うWebアプリケーションです。

## 技術スタック
- **Frontend**: Next.js (App Router), React, Tailwind CSS
- **Backend**: Next.js API Routes (Node.js/TypeScript)
- **AI Models**:
  - Text Generation: `gemini-2.5-flash` (アイデア生成、プロンプト構築)
  - Rough Images: `gemini-2.5-flash-image` (Nano Banana - ラフ画像3枚)
  - Final Image: `gemini-3-pro-image-preview` (Nano Banana Pro - 高品質本番画像)
- **Validation**: AJV (JSON Schema verification)
- **Storage**: Local JSON File (`.data/jobs.json`) ※ MVP版仕様

## セットアップ手順

1. 依存関係のインストール
```bash
npm install
```

2. 環境変数の設定
プロジェクト直下に `.env.local` ファイルを作成し、以下の内容を記述してください。
```env
GEMINI_API_KEY=あなたのGemini_APIキーをここに入力
```

3. 開発用サーバーの起動
```bash
npm run dev
```

ブラウザで `http://localhost:3000` にアクセスしてください。

## アーキテクチャとPrompt Registry
プロンプトは全て `prompts/` ディレクトリ配下のMarkdownとしてバージョン管理されています。
出力するJSON Schemaの定義は `schemas/` フォルダで管理され、バックエンドで一貫して検証（バリデーション・リトライ処理）が行われます。これにより「生成されたJSONが壊れていて画面が崩れる」ことを強力に防いでいます。

- **Step A**: アイデア抽出 (`stepA_ideation.md`)
- **Step B**: ラフ用指示 (`stepB_rough_image.md`)
- **Step C**: システムプロンプト作成 (`stepC_system_prompt_ja.md`)
- **Step D**: 本番用パラメータ作成 (`stepD_final_json.md`)

## セキュリティ対策
- **APIキー漏洩防止**: クライアント（ブラウザ）からは直接Gemini APIを叩かず、必ず `/api/workflows/*` を経由するサーバーサイド実行としています。
- **プロンプトインジェクション対策**: `prompts/common_system.md` により、入力された記事本文内に不可視の命令が含まれていても実行しない強力な制約を定義しています。

## 免責・注意点
- アプリケーションを実行するとローカルに `.data/jobs.json` が生成され保存されます。
- 無料枠のAI Studio APIキーを利用する場合、高頻度でアクセスするとレートリミット（429エラー）が発生する可能性があるので注意してください。ラフ画生成（Step B）はシーケンシャルに呼び出し負荷を抑える工夫をしています。
- 必要に応じて、以下のモデル指定箇所をお使いのGCPプロジェクトやAPIプランに合わせて変更してください：
  - `src/lib/gemini/client.ts`: テキスト生成（`gemini-2.5-flash`）、ラフ画像（`gemini-2.5-flash-image`）
  - `src/app/api/workflows/finalImage/route.ts`: 最終画像（`gemini-3-pro-image-preview`）
