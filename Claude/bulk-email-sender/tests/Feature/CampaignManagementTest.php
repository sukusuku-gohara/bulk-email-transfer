<?php

namespace Tests\Feature;

use App\Enums\CampaignStatus;
use App\Jobs\SendCampaignJob;
use App\Models\Campaign;
use App\Models\Recipient;
use App\Models\Unsubscribe;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class CampaignManagementTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    /** @test */
    public function test_未認証ユーザーはダッシュボードにアクセスできない(): void
    {
        $this->get('/dashboard')->assertRedirect('/login');
    }

    /** @test */
    public function test_認証済みユーザーはダッシュボードにアクセスできる(): void
    {
        $this->actingAs($this->user)->get('/dashboard')->assertStatus(200);
    }

    /** @test */
    public function test_配信履歴一覧が表示される(): void
    {
        Campaign::factory()->count(3)->create();

        $response = $this->actingAs($this->user)->get('/campaigns');

        $response->assertStatus(200);
    }

    /** @test */
    public function test_メール作成画面が表示される(): void
    {
        $this->actingAs($this->user)->get('/campaigns/create')->assertStatus(200);
    }

    /** @test */
    public function test_本配信でキャンペーンが作成されジョブがディスパッチされる(): void
    {
        Queue::fake();
        Recipient::factory()->count(2)->create(['is_active' => true]);

        $this->actingAs($this->user)->post('/campaigns', [
            'subject'   => 'テスト件名',
            'body_html' => '<p>テスト本文</p>',
        ])->assertRedirect('/campaigns');

        $this->assertDatabaseHas('campaigns', ['subject' => 'テスト件名']);
        Queue::assertPushed(SendCampaignJob::class, 2);
    }

    /** @test */
    public function test_バリデーションエラーで件名未入力は弾かれる(): void
    {
        $this->actingAs($this->user)->post('/campaigns', [
            'subject'   => '',
            'body_html' => '<p>本文</p>',
        ])->assertSessionHasErrors('subject');
    }

    /** @test */
    public function test_配信詳細画面が表示される(): void
    {
        $campaign = Campaign::factory()->create();

        $this->actingAs($this->user)
            ->get('/campaigns/' . $campaign->id)
            ->assertStatus(200);
    }

    /** @test */
    public function test_配信リスト一覧が表示される(): void
    {
        Recipient::factory()->count(3)->create();

        $this->actingAs($this->user)->get('/recipients')->assertStatus(200);
    }

    /** @test */
    public function test_配信停止者一覧が表示される(): void
    {
        $this->actingAs($this->user)->get('/unsubscribes')->assertStatus(200);
    }

    /** @test */
    public function test_未認証ユーザーは管理画面各ページにアクセスできない(): void
    {
        $this->get('/campaigns')->assertRedirect('/login');
        $this->get('/recipients')->assertRedirect('/login');
        $this->get('/unsubscribes')->assertRedirect('/login');
    }
}
