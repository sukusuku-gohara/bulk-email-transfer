<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * 開封ログテーブルを作成する
     */
    public function up(): void
    {
        Schema::create('open_logs', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('campaign_recipient_id')->constrained()->cascadeOnDelete()->comment('キャンペーン受信者ID');
            $table->timestamp('opened_at')->comment('開封日時');
            $table->string('ip_address', 45)->nullable()->comment('IPアドレス（IPv6対応）');
            $table->string('user_agent', 500)->nullable()->comment('ユーザーエージェント');
            // タイムスタンプなし（opened_atで管理）
        });
    }

    /**
     * マイグレーションを元に戻す
     */
    public function down(): void
    {
        Schema::dropIfExists('open_logs');
    }
};
