<?php

namespace Tests\Feature;

use App\Enums\CampaignStatus;
use App\Enums\RecipientStatus;
use App\Jobs\SendCampaignJob;
use App\Mail\CampaignMail;
use App\Models\Campaign;
use App\Models\CampaignRecipient;
use App\Models\Recipient;
use App\Services\BounceService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class BounceHandlingTest extends TestCase
{
    use RefreshDatabase;

    private function makeSetup(): array
    {
        $campaign = Campaign::factory()->create([
            'status' => CampaignStatus::Sending,
            'bounced_count' => 0,
        ]);
        $recipient = Recipient::factory()->create(['bounce_count' => 0, 'is_active' => true]);
        $cr = CampaignRecipient::factory()->create([
            'campaign_id' => $campaign->id,
            'recipient_id' => $recipient->id,
            'status' => RecipientStatus::Pending,
        ]);
        return [$campaign, $recipient, $cr];
    }

    /** @test */
    public function test_バウンス記録でrecipientのbounce_countがインクリメントされる(): void
    {
        [, $recipient, $cr] = $this->makeSetup();

        app(BounceService::class)->recordBounce($cr);

        $this->assertEquals(1, $recipient->fresh()->bounce_count);
        $this->assertEquals(RecipientStatus::Bounced, $cr->fresh()->status);
    }

    /** @test */
    public function test_3回連続バウンスでis_activeがfalseになる(): void
    {
        [, $recipient, $cr] = $this->makeSetup();

        $bounceService = app(BounceService::class);

        // 3回バウンスを記録（同じcrを使い回し、statusをリセットしながら）
        for ($i = 0; $i < 3; $i++) {
            $cr->update(['status' => RecipientStatus::Pending]);
            $bounceService->recordBounce($cr);
        }

        $this->assertFalse($recipient->fresh()->is_active);
        $this->assertEquals(3, $recipient->fresh()->bounce_count);
    }

    /** @test */
    public function test_送信成功でbounce_countがリセットされる(): void
    {
        [, $recipient, $cr] = $this->makeSetup();
        $recipient->update(['bounce_count' => 2]);

        app(BounceService::class)->resetBounceCount($cr);

        $this->assertEquals(0, $recipient->fresh()->bounce_count);
    }

    /** @test */
    public function test_ジョブ失敗時にbounced_countがインクリメントされる(): void
    {
        Mail::shouldReceive('to->send')->andThrow(new \Exception('SMTP error'));

        [$campaign, , $cr] = $this->makeSetup();

        try {
            (new SendCampaignJob($campaign, $cr))->handle(app(BounceService::class));
        } catch (\Throwable) {}

        $this->assertEquals(1, $campaign->fresh()->bounced_count);
        $this->assertEquals(RecipientStatus::Bounced, $cr->fresh()->status);
    }

    /** @test */
    public function test_ジョブ成功時にbounce_countがリセットされる(): void
    {
        Mail::fake();

        [$campaign, $recipient, $cr] = $this->makeSetup();
        $recipient->update(['bounce_count' => 1]);

        (new SendCampaignJob($campaign, $cr))->handle(app(BounceService::class));

        $this->assertEquals(0, $recipient->fresh()->bounce_count);
    }
}
