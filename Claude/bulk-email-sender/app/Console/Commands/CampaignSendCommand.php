<?php

namespace App\Console\Commands;

use App\Enums\CampaignStatus;
use App\Models\Campaign;
use App\Services\CampaignService;
use Illuminate\Console\Command;

class CampaignSendCommand extends Command
{
    protected $signature = 'campaign:send {campaign_id : 送信するキャンペーンのID}';
    protected $description = '指定したキャンペーンのメール配信を開始する';

    public function handle(CampaignService $campaignService): int
    {
        $campaignId = $this->argument('campaign_id');

        $campaign = Campaign::find($campaignId);
        if (!$campaign) {
            $this->error("キャンペーン ID:{$campaignId} が見つかりません。");
            return self::FAILURE;
        }

        // draft 以外は送信不可
        if ($campaign->status !== CampaignStatus::Draft) {
            $this->error("キャンペーン ID:{$campaignId} はすでに送信済みまたは送信中です（ステータス: {$campaign->status->value}）。");
            return self::FAILURE;
        }

        $this->info("キャンペーン「{$campaign->subject}」の送信を開始します...");

        try {
            $campaignService->dispatch($campaign);
        } catch (\Exception $e) {
            $this->error('送信開始に失敗しました: ' . $e->getMessage());

            $campaign->update(['status' => CampaignStatus::Failed]);
            return self::FAILURE;
        }

        $this->info("送信ジョブをディスパッチしました。対象: {$campaign->total_count}件");
        return self::SUCCESS;
    }
}
