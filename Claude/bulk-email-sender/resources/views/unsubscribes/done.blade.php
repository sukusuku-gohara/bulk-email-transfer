<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>配信停止完了</title>
    <style>
        body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f3f4f6; margin: 0; }
        .card { background: white; border-radius: 8px; padding: 40px; max-width: 440px; width: 100%; box-shadow: 0 2px 8px rgba(0,0,0,.1); text-align: center; }
        h1 { font-size: 1.3rem; color: #16a34a; margin-bottom: 12px; }
        p { color: #555; font-size: .9rem; }
        .email { font-weight: bold; color: #1f2937; margin: 8px 0; }
    </style>
</head>
<body>
    <div class="card">
        <h1>✓ 配信停止が完了しました</h1>
        <p>以下のアドレスへのメール配信を停止しました。</p>
        <div class="email">{{ $email }}</div>
        <p style="margin-top: 16px; font-size: .8rem; color: #9ca3af;">今後このアドレスへのメール配信は行われません。</p>
    </div>
</body>
</html>
