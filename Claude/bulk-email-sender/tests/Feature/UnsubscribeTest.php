<?php

namespace Tests\Feature;

use App\Enums\CampaignStatus;
use App\Models\Campaign;
use App\Models\CampaignRecipient;
use App\Models\Recipient;
use App\Models\Unsubscribe;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class UnsubscribeTest extends TestCase
{
    use RefreshDatabase;

    private function makeCampaignRecipient(): CampaignRecipient
    {
        $campaign = Campaign::factory()->create();
        $recipient = Recipient::factory()->create(['email' => 'user@example.com']);
        return CampaignRecipient::factory()->create([
            'campaign_id' => $campaign->id,
            'recipient_id' => $recipient->id,
            'tracking_id' => 'test-unsub-token-0001',
        ]);
    }

    /** @test */
    public function test_配信停止確認画面が表示される(): void
    {
        $cr = $this->makeCampaignRecipient();

        $response = $this->get('/unsubscribe/' . $cr->tracking_id);

        $response->assertStatus(200);
        $response->assertSee('user@example.com');
    }

    /** @test */
    public function test_配信停止を実行するとunsubscribesに登録される(): void
    {
        $cr = $this->makeCampaignRecipient();

        $this->post('/unsubscribe', ['token' => $cr->tracking_id]);

        $this->assertDatabaseHas('unsubscribes', ['email' => 'user@example.com']);
    }

    /** @test */
    public function test_同じアドレスの配信停止は二重登録されない(): void
    {
        $cr = $this->makeCampaignRecipient();

        $this->post('/unsubscribe', ['token' => $cr->tracking_id]);
        $this->post('/unsubscribe', ['token' => $cr->tracking_id]);

        $this->assertDatabaseCount('unsubscribes', 1);
    }

    /** @test */
    public function test_無効なトークンで404が返る(): void
    {
        $response = $this->get('/unsubscribe/invalid-token');

        $response->assertStatus(404);
    }

    /** @test */
    public function test_配信停止後のアドレスは次回配信から除外される(): void
    {
        Queue::fake();

        $cr = $this->makeCampaignRecipient();

        // 配信停止を実行
        $this->post('/unsubscribe', ['token' => $cr->tracking_id]);

        // 新規キャンペーンを作成して送信
        $newCampaign = Campaign::factory()->create(['status' => CampaignStatus::Draft]);
        $this->artisan('campaign:send', ['campaign_id' => $newCampaign->id]);

        // 配信停止済みアドレスへのジョブはディスパッチされない
        Queue::assertNothingPushed();
    }
}
