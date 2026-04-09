<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * キャンペーンテーブルを作成する
     */
    public function up(): void
    {
        Schema::create('campaigns', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('subject', 255)->comment('メール件名');
            $table->longText('body_html')->comment('メール本文（HTML）');
            $table->string('status')->default('draft')->comment('ステータス: draft/sending/completed/failed');
            $table->unsignedInteger('total_count')->default(0)->comment('配信対象数');
            $table->unsignedInteger('sent_count')->default(0)->comment('送信済み件数');
            $table->unsignedInteger('opened_count')->default(0)->comment('開封件数');
            $table->unsignedInteger('bounced_count')->default(0)->comment('バウンス件数');
            $table->timestamp('sent_at')->nullable()->comment('送信開始日時');
            $table->timestamp('completed_at')->nullable()->comment('送信完了日時');
            $table->timestamps();
        });
    }

    /**
     * マイグレーションを元に戻す
     */
    public function down(): void
    {
        Schema::dropIfExists('campaigns');
    }
};
