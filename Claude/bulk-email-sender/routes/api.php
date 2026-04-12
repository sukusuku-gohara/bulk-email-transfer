<?php

use App\Http\Controllers\Api\CampaignApiController;
use Illuminate\Support\Facades\Route;

Route::middleware('api.token')->group(function () {
    Route::post('/campaigns/send', [CampaignApiController::class, 'send']);
});
