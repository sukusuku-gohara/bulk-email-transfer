<?php

namespace App\Http\Controllers;

use App\Models\Unsubscribe;
use App\Models\CampaignRecipient;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class UnsubscribeController extends Controller
{
    // 管理画面: 配信停止者一覧（認証必要）
    public function index()
    {
        $unsubscribes = Unsubscribe::latest('unsubscribed_at')->paginate(50);
        return view('unsubscribes.index', compact('unsubscribes'));
    }

    // 配信停止確認画面（認証不要）
    public function show(string $token)
    {
        // tracking_id からメールアドレスを取得
        $campaignRecipient = CampaignRecipient::with('recipient')
            ->where('tracking_id', $token)
            ->first();

        if (!$campaignRecipient) {
            abort(404);
        }

        return view('unsubscribes.confirm', [
            'token' => $token,
            'email' => $campaignRecipient->recipient->email,
        ]);
    }

    // 配信停止登録（認証不要）
    public function store(Request $request)
    {
        $validated = $request->validate([
            'token' => ['required', 'string'],
        ]);

        $campaignRecipient = CampaignRecipient::with('recipient')
            ->where('tracking_id', $validated['token'])
            ->first();

        if (!$campaignRecipient) {
            abort(404);
        }

        $email = $campaignRecipient->recipient->email;

        // 既に登録済みの場合は何もしない
        Unsubscribe::firstOrCreate(
            ['email' => $email],
            [
                'token' => Str::random(64),
                'unsubscribed_at' => now(),
                'created_at' => now(),
            ]
        );

        return view('unsubscribes.done', compact('email'));
    }
}
