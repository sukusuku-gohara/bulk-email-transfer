<?php

namespace Database\Factories;

use App\Enums\RecipientStatus;
use App\Models\Campaign;
use App\Models\CampaignRecipient;
use App\Models\Recipient;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CampaignRecipient>
 */
class CampaignRecipientFactory extends Factory
{
    /**
     * モデルのデフォルト状態を定義する
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'campaign_id'  => Campaign::factory(),
            'recipient_id' => Recipient::factory(),
            'tracking_id'  => fake()->uuid(),
            'status'       => RecipientStatus::Pending,
            'sent_at'      => null,
        ];
    }
}
