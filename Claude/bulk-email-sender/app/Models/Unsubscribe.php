<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * 配信停止モデル
 *
 * @property int $id
 * @property string $email メールアドレス
 * @property string $token 配信停止トークン
 * @property \Illuminate\Support\Carbon $unsubscribed_at 配信停止日時
 * @property \Illuminate\Support\Carbon $created_at 作成日時
 */
class Unsubscribe extends Model
{
    use HasFactory;

    /**
     * updated_atを使用しない（created_atのみ）
     */
    public $timestamps = false;

    /**
     * created_atカラム名を明示
     */
    const CREATED_AT = 'created_at';

    /**
     * updated_atカラムはnull（使用しない）
     */
    const UPDATED_AT = null;

    /**
     * 一括代入可能な属性
     *
     * @var list<string>
     */
    protected $fillable = [
        'email',
        'token',
        'unsubscribed_at',
    ];

    /**
     * 属性のキャスト定義
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'unsubscribed_at' => 'datetime',
        ];
    }
}
