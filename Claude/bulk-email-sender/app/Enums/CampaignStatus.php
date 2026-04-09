<?php

namespace App\Enums;

/**
 * キャンペーンのステータスを表すEnum
 */
enum CampaignStatus: string
{
    case Draft = 'draft';
    case Sending = 'sending';
    case Completed = 'completed';
    case Failed = 'failed';
}
