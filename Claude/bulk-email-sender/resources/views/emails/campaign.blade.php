<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $campaign->subject }}</title>
</head>
<body style="font-family: sans-serif; line-height: 1.6; color: #333;">
    {!! $campaign->body_html !!}

    <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;">

    <p style="font-size: 12px; color: #888;">
        このメールの配信を停止するには
        <a href="{{ url('/unsubscribe/' . $campaignRecipient->tracking_id) }}">こちら</a>
        をクリックしてください。
    </p>

    @if(config('bulkmail.tracking_pixel_enabled'))
        {{-- 開封トラッキングピクセル（1x1透明GIF） --}}
        <img src="{{ url('/track/' . $campaignRecipient->tracking_id) }}"
             width="1" height="1"
             style="display:none;"
             alt="">
    @endif
</body>
</html>
