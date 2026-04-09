<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * 受信者テーブルを作成する
     */
    public function up(): void
    {
        Schema::create('recipients', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('email', 255)->unique()->comment('メールアドレス');
            $table->string('name', 255)->nullable()->comment('名前（将来用）');
            $table->boolean('is_active')->default(true)->comment('有効/無効');
            $table->unsignedTinyInteger('bounce_count')->default(0)->comment('連続バウンス回数');
            $table->timestamp('synced_at')->nullable()->comment('最終同期日時');
            $table->timestamps();
        });
    }

    /**
     * マイグレーションを元に戻す
     */
    public function down(): void
    {
        Schema::dropIfExists('recipients');
    }
};
