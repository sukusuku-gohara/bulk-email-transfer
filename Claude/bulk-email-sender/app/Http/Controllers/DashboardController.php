<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\Recipient;
use App\Models\Unsubscribe;

class DashboardController extends Controller
{
    public function index()
    {
        // 直近5件のキャンペーン
        $recentCampaigns = Campaign::latest()->take(5)->get();

        // 統計情報
        $stats = [
            'total_recipients' => Recipient::where('is_active', true)->count(),
            'total_campaigns'  => Campaign::count(),
            'total_unsubscribes' => Unsubscribe::count(),
        ];

        return view('dashboard', compact('recentCampaigns', 'stats'));
    }
}
