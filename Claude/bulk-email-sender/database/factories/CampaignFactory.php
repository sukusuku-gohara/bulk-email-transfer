<?php

namespace Database\Factories;

use App\Enums\CampaignStatus;
use App\Models\Campaign;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Campaign>
 */
class CampaignFactory extends Factory
{
    /**
     * モデルのデフォルト状態を定義する
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'subject'       => fake()->sentence(),
            'body_html'     => '<p>' . fake()->paragraph() . '</p>',
            'status'        => CampaignStatus::Draft,
            'total_count'   => 0,
            'sent_count'    => 0,
            'opened_count'  => 0,
            'bounced_count' => 0,
            'sent_at'       => null,
            'completed_at'  => null,
        ];
    }
}
