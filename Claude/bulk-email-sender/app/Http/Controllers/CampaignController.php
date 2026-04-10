<?php

namespace App\Http\Controllers;

use App\Enums\CampaignStatus;
use App\Models\Campaign;
use App\Models\CampaignRecipient;
use App\Services\CampaignService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\CampaignMail;

class CampaignController extends Controller
{
    public function __construct(private readonly CampaignService $campaignService) {}

    // 配信履歴一覧
    public function index()
    {
        $campaigns = Campaign::latest()->paginate(50);
        return view('campaigns.index', compact('campaigns'));
    }

    // メール作成フォーム
    public function create()
    {
        return view('campaigns.create');
    }

    // 本配信
    public function store(Request $request)
    {
        $validated = $request->validate([
            'subject'    => ['required', 'string', 'max:255'],
            'body_html'  => ['required', 'string'],
            'sheet_name' => ['required', 'string', 'max:100'],
        ]);

        $campaign = Campaign::create(array_merge($validated, ['status' => CampaignStatus::Draft]));

        try {
            $this->campaignService->dispatch($campaign);
        } catch (\Exception $e) {
            $campaign->update(['status' => CampaignStatus::Failed]);
            return back()->with('error', '送信の開始に失敗しました: ' . $e->getMessage());
        }

        return redirect()->route('campaigns.index')
            ->with('success', "「{$campaign->subject}」の配信を開始しました。");
    }

    // テスト送信
    public function test(Request $request)
    {
        $validated = $request->validate([
            'subject'    => ['required', 'string', 'max:255'],
            'body_html'  => ['required', 'string'],
            'test_email' => ['required', 'email'],
        ]);

        // テスト用のダミーキャンペーン・CampaignRecipientを一時生成（DBに保存しない）
        $campaign = new Campaign([
            'subject'   => $validated['subject'],
            'body_html' => $validated['body_html'],
        ]);
        // tracking_id はダミー
        $campaignRecipient = new CampaignRecipient(['tracking_id' => 'test-preview-id']);

        Mail::to($validated['test_email'])->send(new CampaignMail($campaign, $campaignRecipient));

        return back()->with('success', "{$validated['test_email']} にテストメールを送信しました。");
    }

    // 配信詳細
    public function show(Campaign $campaign)
    {
        $campaignRecipients = CampaignRecipient::with(['recipient', 'openLogs'])
            ->where('campaign_id', $campaign->id)
            ->paginate(50);

        return view('campaigns.show', compact('campaign', 'campaignRecipients'));
    }
}
