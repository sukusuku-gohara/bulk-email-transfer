<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * 受信者モデル
 *
 * @property int $id
 * @property string $email メールアドレス
 * @property string|null $name 名前（将来用）
 * @property bool $is_active 有効/無効
 * @property int $bounce_count 連続バウンス回数
 * @property \Illuminate\Support\Carbon|null $synced_at 最終同期日時
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 */
class Recipient extends Model
{
    use HasFactory;

    /**
     * 一括代入可能な属性
     *
     * @var list<string>
     */
    protected $fillable = [
        'email',
        'name',
        'is_active',
        'bounce_count',
        'synced_at',
    ];

    /**
     * 属性のキャスト定義
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'synced_at' => 'datetime',
        ];
    }

    /**
     * この受信者に紐づくキャンペーン受信者
     */
    public function campaignRecipients(): HasMany
    {
        return $this->hasMany(CampaignRecipient::class);
    }
}
