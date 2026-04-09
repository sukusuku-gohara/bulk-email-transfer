<?php

namespace Tests\Feature;

use App\Enums\CampaignStatus;
use App\Enums\RecipientStatus;
use App\Jobs\SendCampaignJob;
use App\Mail\CampaignMail;
use App\Models\Campaign;
use App\Models\CampaignRecipient;
use App\Models\Recipient;
use App\Models\Unsubscribe;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Str;
use Tests\TestCase;

class SendCampaignTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function test_ドラフトキャンペーンの送信コマンドでジョブがディスパッチされる(): void
    {
        Queue::fake();

        $campaign = Campaign::factory()->create(['status' => CampaignStatus::Draft]);
        Recipient::factory()->count(3)->create(['is_active' => true]);

        $this->artisan('campaign:send', ['campaign_id' => $campaign->id])
            ->assertExitCode(0);

        Queue::assertPushed(SendCampaignJob::class, 3);
    }

    /** @test */
    public function test_送信中のキャンペーンは再送信できない(): void
    {
        Queue::fake();

        $campaign = Campaign::factory()->create(['status' => CampaignStatus::Sending]);

        $this->artisan('campaign:send', ['campaign_id' => $campaign->id])
            ->assertExitCode(1);

        Queue::assertNothingPushed();
    }

    /** @test */
    public function test_存在しないキャンペーンIDはエラーになる(): void
    {
        $this->artisan('campaign:send', ['campaign_id' => 9999])
            ->assertExitCode(1);
    }

    /** @test */
    public function test_配信停止済みアドレスは送信対象から除外される(): void
    {
        Queue::fake();

        $campaign = Campaign::factory()->create(['status' => CampaignStatus::Draft]);
        $active = Recipient::factory()->create(['email' => 'active@example.com', 'is_active' => true]);
        $unsubscribed = Recipient::factory()->create(['email' => 'unsub@example.com', 'is_active' => true]);

        Unsubscribe::create([
            'email' => 'unsub@example.com',
            'token' => Str::random(64),
            'unsubscribed_at' => now(),
            'created_at' => now(),
        ]);

        $this->artisan('campaign:send', ['campaign_id' => $campaign->id])
            ->assertExitCode(0);

        // active のみジョブがディスパッチされる
        Queue::assertPushed(SendCampaignJob::class, 1);
    }

    /** @test */
    public function test_非アクティブな受信者は送信対象から除外される(): void
    {
        Queue::fake();

        $campaign = Campaign::factory()->create(['status' => CampaignStatus::Draft]);
        Recipient::factory()->create(['is_active' => true]);
        Recipient::factory()->create(['is_active' => false]);

        $this->artisan('campaign:send', ['campaign_id' => $campaign->id])
            ->assertExitCode(0);

        Queue::assertPushed(SendCampaignJob::class, 1);
    }

    /** @test */
    public function test_送信コマンド実行後にステータスがsendingになる(): void
    {
        Queue::fake();

        $campaign = Campaign::factory()->create(['status' => CampaignStatus::Draft]);
        Recipient::factory()->create(['is_active' => true]);

        $this->artisan('campaign:send', ['campaign_id' => $campaign->id]);

        $this->assertEquals(CampaignStatus::Sending, $campaign->fresh()->status);
    }

    /** @test */
    public function test_ジョブ実行後に送信済みステータスとsent_countが更新される(): void
    {
        Mail::fake();

        $campaign = Campaign::factory()->create(['status' => CampaignStatus::Sending, 'sent_count' => 0]);
        $recipient = Recipient::factory()->create();
        $campaignRecipient = CampaignRecipient::factory()->create([
            'campaign_id' => $campaign->id,
            'recipient_id' => $recipient->id,
            'status' => RecipientStatus::Pending,
        ]);

        // ジョブを直接実行（BounceService はサービスコンテナから解決）
        (new SendCampaignJob($campaign, $campaignRecipient))->handle(app(\App\Services\BounceService::class));

        $this->assertEquals(RecipientStatus::Sent, $campaignRecipient->fresh()->status);
        $this->assertEquals(1, $campaign->fresh()->sent_count);

        Mail::assertSent(CampaignMail::class);
    }

    /** @test */
    public function test_pending以外のレコードはジョブ実行時にスキップされる(): void
    {
        Mail::fake();

        $campaign = Campaign::factory()->create(['status' => CampaignStatus::Sending, 'sent_count' => 0]);
        $recipient = Recipient::factory()->create();
        $campaignRecipient = CampaignRecipient::factory()->create([
            'campaign_id' => $campaign->id,
            'recipient_id' => $recipient->id,
            'status' => RecipientStatus::Sent, // すでに送信済み
        ]);

        (new SendCampaignJob($campaign, $campaignRecipient))->handle(app(\App\Services\BounceService::class));

        // 冪等性: 再送信されない
        Mail::assertNotSent(CampaignMail::class);
        $this->assertEquals(0, $campaign->fresh()->sent_count);
    }
}
