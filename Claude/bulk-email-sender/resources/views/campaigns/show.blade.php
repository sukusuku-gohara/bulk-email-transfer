@extends('layouts.app')
@section('title', '配信詳細')

@section('content')
<div class="mb-4">
    <a href="{{ route('campaigns.index') }}" class="text-indigo-600 hover:underline text-sm">← 配信履歴に戻る</a>
</div>

@php
    $openRate = $campaign->sent_count > 0 ? round($campaign->opened_count / $campaign->sent_count * 100, 1) : 0;
    $statusLabel = ['draft'=>'下書き','sending'=>'送信中','completed'=>'完了','failed'=>'失敗'];
    $statusColor = ['draft'=>'gray','sending'=>'blue','completed'=>'green','failed'=>'red'];
    $s = $campaign->status->value;
@endphp

{{-- キャンペーン概要 --}}
<div class="bg-white rounded-lg shadow p-6 mb-6">
    <div class="flex items-start justify-between mb-4">
        <div>
            <h2 class="text-xl font-semibold text-gray-800">{{ $campaign->subject }}</h2>
            <p class="text-sm text-gray-500 mt-1">送信日時: {{ $campaign->sent_at?->format('Y/m/d H:i') ?? '-' }}</p>
        </div>
        <span class="px-3 py-1 rounded-full text-sm bg-{{ $statusColor[$s] ?? 'gray' }}-100 text-{{ $statusColor[$s] ?? 'gray' }}-700">
            {{ $statusLabel[$s] ?? $s }}
        </span>
    </div>
    <div class="grid grid-cols-4 gap-4">
        <div class="text-center">
            <div class="text-2xl font-bold text-gray-700">{{ number_format($campaign->total_count) }}</div>
            <div class="text-xs text-gray-500">配信対象</div>
        </div>
        <div class="text-center">
            <div class="text-2xl font-bold text-indigo-600">{{ number_format($campaign->sent_count) }}</div>
            <div class="text-xs text-gray-500">送信済み</div>
        </div>
        <div class="text-center">
            <div class="text-2xl font-bold text-green-600">{{ number_format($campaign->opened_count) }}</div>
            <div class="text-xs text-gray-500">開封数</div>
        </div>
        <div class="text-center">
            <div class="text-2xl font-bold text-green-600">{{ $openRate }}%</div>
            <div class="text-xs text-gray-500">開封率</div>
            <div class="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div class="bg-green-500 h-2 rounded-full" style="width: {{ min($openRate, 100) }}%"></div>
            </div>
        </div>
    </div>
</div>

{{-- 送信先一覧 --}}
<div class="bg-white rounded-lg shadow">
    <div class="px-6 py-4 border-b font-semibold text-gray-700">
        送信先一覧（送信済み {{ number_format($campaign->sent_count) }}件 / 開封済み {{ number_format($campaign->opened_count) }}件）
    </div>
    <table class="w-full text-sm">
        <thead class="bg-gray-50 text-gray-500">
            <tr>
                <th class="text-left px-6 py-3">メールアドレス</th>
                <th class="text-left px-6 py-3">名前</th>
                <th class="text-left px-6 py-3">開封</th>
                <th class="text-left px-6 py-3">初回開封日時</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
            @forelse($campaignRecipients as $cr)
            @php $opened = $cr->openLogs->isNotEmpty(); @endphp
            <tr>
                <td class="px-6 py-3">{{ $cr->recipient->email }}</td>
                <td class="px-6 py-3 text-gray-500">{{ $cr->recipient->name ?? '-' }}</td>
                <td class="px-6 py-3">
                    @if($opened)
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">開封済み</span>
                    @else
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-500">未開封</span>
                    @endif
                </td>
                <td class="px-6 py-3 text-gray-500">
                    {{ $cr->openLogs->first()?->opened_at?->format('Y/m/d H:i') ?? '-' }}
                </td>
            </tr>
            @empty
            <tr><td colspan="4" class="px-6 py-8 text-center text-gray-400">送信先がありません</td></tr>
            @endforelse
        </tbody>
    </table>
    @if($campaignRecipients->hasPages())
    <div class="px-6 py-4 border-t">{{ $campaignRecipients->links() }}</div>
    @endif
</div>
@endsection
