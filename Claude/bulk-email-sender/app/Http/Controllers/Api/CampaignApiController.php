<?php

namespace App\Http\Controllers\Api;

use App\Enums\CampaignStatus;
use App\Http\Controllers\Controller;
use App\Models\Campaign;
use App\Services\CampaignService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CampaignApiController extends Controller
{
    public function __construct(private readonly CampaignService $campaignService) {}

    public function send(Request $request): JsonResponse
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
            return response()->json([
                'error' => '送信の開始に失敗しました: ' . $e->getMessage(),
            ], 500);
        }

        return response()->json([
            'campaign_id' => $campaign->id,
            'subject'     => $campaign->subject,
            'sheet_name'  => $campaign->sheet_name,
            'status'      => $campaign->status->value,
            'message'     => '配信を開始しました',
        ], 201);
    }
}
