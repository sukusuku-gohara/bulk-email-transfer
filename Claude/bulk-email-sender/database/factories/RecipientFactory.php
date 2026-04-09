<?php

namespace Database\Factories;

use App\Models\Recipient;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Recipient>
 */
class RecipientFactory extends Factory
{
    /**
     * モデルのデフォルト状態を定義する
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'email'        => fake()->unique()->safeEmail(),
            'name'         => fake()->name(),
            'is_active'    => true,
            'bounce_count' => 0,
            'synced_at'    => null,
        ];
    }
}
