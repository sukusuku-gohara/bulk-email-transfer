<?php

namespace Tests\Feature;

use App\Models\Campaign;
use App\Models\CampaignRecipient;
use App\Models\OpenLog;
use App\Models\Recipient;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OpenTrackingTest extends TestCase
{
    use RefreshDatabase;

    private function makeCampaignRecipient(array $attrs = []): CampaignRecipient
    {
        $campaign = Campaign::factory()->create(['opened_count' => 0]);
        $recipient = Recipient::factory()->create();
        return CampaignRecipient::factory()->create(array_merge([
            'campaign_id' => $campaign->id,
            'recipient_id' => $recipient->id,
            'tracking_id' => 'test-tracking-uuid-0001',
        ], $attrs));
    }

    /** @test */
    public function test_トラッキングURLにアクセスすると画像が返る(): void
    {
        $cr = $this->makeCampaignRecipient();

        $response = $this->get('/track/' . $cr->tracking_id);

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'image/gif');
    }

    /** @test */
    public function test_初回アクセスでopen_logsにレコードが作成される(): void
    {
        $cr = $this->makeCampaignRecipient();

        $this->get('/track/' . $cr->tracking_id);

        $this->assertDatabaseCount('open_logs', 1);
        $this->assertDatabaseHas('open_logs', ['campaign_recipient_id' => $cr->id]);
    }

    /** @test */
    public function test_初回アクセスでopened_countが1になる(): void
    {
        $cr = $this->makeCampaignRecipient();

        $this->get('/track/' . $cr->tracking_id);

        $this->assertEquals(1, $cr->campaign->fresh()->opened_count);
    }

    /** @test */
    public function test_2回目アクセスではopened_countが増えない(): void
    {
        $cr = $this->makeCampaignRecipient();

        $this->get('/track/' . $cr->tracking_id);
        $this->get('/track/' . $cr->tracking_id);

        // ログは2件
        $this->assertDatabaseCount('open_logs', 2);
        // カウントは1のまま
        $this->assertEquals(1, $cr->campaign->fresh()->opened_count);
    }

    /** @test */
    public function test_存在しないtracking_idでも404にならず画像が返る(): void
    {
        $response = $this->get('/track/non-existent-tracking-id');

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'image/gif');
    }

    /** @test */
    public function test_存在しないtracking_idではopen_logsにレコードが作成されない(): void
    {
        $this->get('/track/non-existent-tracking-id');

        $this->assertDatabaseCount('open_logs', 0);
    }
}
