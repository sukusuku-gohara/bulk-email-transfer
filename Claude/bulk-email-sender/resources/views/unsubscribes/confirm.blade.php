<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>配信停止の確認</title>
    <style>
        body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f3f4f6; margin: 0; }
        .card { background: white; border-radius: 8px; padding: 40px; max-width: 440px; width: 100%; box-shadow: 0 2px 8px rgba(0,0,0,.1); text-align: center; }
        h1 { font-size: 1.3rem; margin-bottom: 12px; }
        p { color: #555; font-size: .9rem; }
        .email { font-weight: bold; color: #1f2937; margin: 12px 0; }
        button { background: #dc2626; color: white; border: none; padding: 12px 32px; border-radius: 6px; font-size: 1rem; cursor: pointer; margin-top: 16px; }
        button:hover { background: #b91c1c; }
    </style>
</head>
<body>
    <div class="card">
        <h1>メール配信の停止</h1>
        <p>以下のアドレスへのメール配信を停止しますか？</p>
        <div class="email">{{ $email }}</div>
        <form method="POST" action="{{ route('unsubscribe.store') }}">
            @csrf
            <input type="hidden" name="token" value="{{ $token }}">
            <button type="submit">配信を停止する</button>
        </form>
    </div>
</body>
</html>
