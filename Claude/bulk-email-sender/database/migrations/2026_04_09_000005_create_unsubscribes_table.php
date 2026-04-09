<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * 配信停止テーブルを作成する
     */
    public function up(): void
    {
        Schema::create('unsubscribes', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('email', 255)->unique()->comment('メールアドレス');
            $table->string('token', 64)->unique()->comment('配信停止トークン');
            $table->timestamp('unsubscribed_at')->comment('配信停止日時');
            $table->timestamp('created_at')->comment('作成日時');
            // updated_atなし
        });
    }

    /**
     * マイグレーションを元に戻す
     */
    public function down(): void
    {
        Schema::dropIfExists('unsubscribes');
    }
};
