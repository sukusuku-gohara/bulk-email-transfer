<?php

namespace App\Models;

use App\Enums\RecipientStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * キャンペーン受信者モデル（中間テーブル）
 *
 * @property int $id
 * @property int $campaign_id キャンペーンID
 * @property int $recipient_id 受信者ID
 * @property string $tracking_id 開封トラッキング用UUID
 * @property RecipientStatus $status ステータス
 * @property \Illuminate\Support\Carbon|null $sent_at 送信日時
 * @property \Illuminate\Support\Carbon $created_at
 */
class CampaignRecipient extends Model
{
    use HasFactory;

    /**
     * updated_atを使用しない（created_atのみ）
     */
    public $timestamps = false;

    /**
     * 一括代入可能な属性
     *
     * @var list<string>
     */
    protected $fillable = [
        'campaign_id',
        'recipient_id',
        'tracking_id',
        'status',
        'sent_at',
        'created_at',
    ];

    /**
     * 属性のキャスト定義
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status'     => RecipientStatus::class,
            'sent_at'    => 'datetime',
            'created_at' => 'datetime',
        ];
    }

    /**
     * このレコードが属するキャンペーン
     */
    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class);
    }

    /**
     * このレコードが属する受信者
     */
    public function recipient(): BelongsTo
    {
        return $this->belongsTo(Recipient::class);
    }

    /**
     * この受信者の開封ログ
     */
    public function openLogs(): HasMany
    {
        return $this->hasMany(OpenLog::class);
    }
}
