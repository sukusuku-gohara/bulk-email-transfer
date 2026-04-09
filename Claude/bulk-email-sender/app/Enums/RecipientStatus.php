<?php

namespace App\Enums;

/**
 * キャンペーン受信者の送信ステータスを表すEnum
 */
enum RecipientStatus: string
{
    case Pending = 'pending';
    case Sent = 'sent';
    case Failed = 'failed';
    case Bounced = 'bounced';
}
