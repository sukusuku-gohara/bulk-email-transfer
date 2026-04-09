<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * 開封ログモデル
 *
 * @property int $id
 * @property int $campaign_recipient_id キャンペーン受信者ID
 * @property \Illuminate\Support\Carbon $opened_at 開封日時
 * @property string|null $ip_address IPアドレス
 * @property string|null $user_agent ユーザーエージェント
 */
class OpenLog extends Model
{
    use HasFactory;

    /**
     * タイムスタンプを使用しない
     */
    public $timestamps = false;

    /**
     * 一括代入可能な属性
     *
     * @var list<string>
     */
    protected $fillable = [
        'campaign_recipient_id',
        'opened_at',
        'ip_address',
        'user_agent',
    ];

    /**
     * 属性のキャスト定義
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'opened_at' => 'datetime',
        ];
    }

    /**
     * このログが属するキャンペーン受信者
     */
    public function campaignRecipient(): BelongsTo
    {
        return $this->belongsTo(CampaignRecipient::class);
    }
}
