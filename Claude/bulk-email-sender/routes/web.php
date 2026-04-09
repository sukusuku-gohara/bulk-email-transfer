<?php

use App\Http\Controllers\CampaignController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RecipientController;
use App\Http\Controllers\TrackingController;
use App\Http\Controllers\UnsubscribeController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// 開封トラッキングピクセル（認証不要）
Route::get('/track/{tracking_id}', [TrackingController::class, 'pixel'])->name('track.pixel');

// 配信停止（認証不要）
Route::get('/unsubscribe/{token}', [UnsubscribeController::class, 'show'])->name('unsubscribe.show');
Route::post('/unsubscribe', [UnsubscribeController::class, 'store'])->name('unsubscribe.store');

// 管理画面（認証必須）
Route::middleware('auth')->group(function () {
    // ダッシュボード（既存のクロージャ版を DashboardController に置き換え）
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // キャンペーン
    Route::resource('campaigns', CampaignController::class)->only(['index', 'create', 'store', 'show']);
    Route::post('/campaigns/test', [CampaignController::class, 'test'])->name('campaigns.test');

    // 配信リスト
    Route::get('/recipients', [RecipientController::class, 'index'])->name('recipients.index');
    Route::post('/recipients/sync', [RecipientController::class, 'sync'])->name('recipients.sync');

    // 配信停止者一覧
    Route::get('/unsubscribes', [UnsubscribeController::class, 'index'])->name('unsubscribes.index');

    // プロフィール（Breeze 標準）
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
