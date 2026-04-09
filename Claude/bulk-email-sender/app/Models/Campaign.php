<?php

namespace App\Models;

use App\Enums\CampaignStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * キャンペーンモデル
 *
 * @property int $id
 * @property string $subject メール件名
 * @property string $body_html メール本文（HTML）
 * @property CampaignStatus $status ステータス
 * @property int $total_count 配信対象数
 * @property int $sent_count 送信済み件数
 * @property int $opened_count 開封件数
 * @property int $bounced_count バウンス件数
 * @property \Illuminate\Support\Carbon|null $sent_at 送信開始日時
 * @property \Illuminate\Support\Carbon|null $completed_at 送信完了日時
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 */
class Campaign extends Model
{
    use HasFactory;

    /**
     * 一括代入可能な属性
     *
     * @var list<string>
     */
    protected $fillable = [
        'subject',
        'body_html',
        'status',
        'total_count',
        'sent_count',
        'opened_count',
        'bounced_count',
        'sent_at',
        'completed_at',
    ];

    /**
     * 属性のキャスト定義
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status'       => CampaignStatus::class,
            'sent_at'      => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    /**
     * このキャンペーンに紐づくキャンペーン受信者
     */
    public function campaignRecipients(): HasMany
    {
        return $this->hasMany(CampaignRecipient::class);
    }
}
