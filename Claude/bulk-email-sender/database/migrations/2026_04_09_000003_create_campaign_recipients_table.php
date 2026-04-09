<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * キャンペーン受信者中間テーブルを作成する
     */
    public function up(): void
    {
        Schema::create('campaign_recipients', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('campaign_id')->constrained()->cascadeOnDelete()->comment('キャンペーンID');
            $table->foreignId('recipient_id')->constrained()->cascadeOnDelete()->comment('受信者ID');
            $table->uuid('tracking_id')->unique()->comment('開封トラッキング用UUID');
            $table->string('status')->default('pending')->comment('ステータス: pending/sent/failed/bounced');
            $table->timestamp('sent_at')->nullable()->comment('送信日時');
            $table->timestamp('created_at')->comment('作成日時');

            // キャンペーンと受信者の組み合わせにユニーク制約
            $table->unique(['campaign_id', 'recipient_id']);
        });
    }

    /**
     * マイグレーションを元に戻す
     */
    public function down(): void
    {
        Schema::dropIfExists('campaign_recipients');
    }
};
