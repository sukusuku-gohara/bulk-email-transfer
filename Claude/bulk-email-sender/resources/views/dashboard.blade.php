@extends('layouts.app')
@section('title', 'ダッシュボード')

@section('content')
<div class="grid grid-cols-3 gap-6 mb-8">
    <div class="bg-white rounded-lg shadow p-6">
        <div class="text-sm text-gray-500">有効な配信先</div>
        <div class="text-3xl font-bold text-indigo-600 mt-1">{{ number_format($stats['total_recipients']) }}</div>
        <div class="text-xs text-gray-400 mt-1">件</div>
    </div>
    <div class="bg-white rounded-lg shadow p-6">
        <div class="text-sm text-gray-500">配信キャンペーン数</div>
        <div class="text-3xl font-bold text-indigo-600 mt-1">{{ number_format($stats['total_campaigns']) }}</div>
        <div class="text-xs text-gray-400 mt-1">件</div>
    </div>
    <div class="bg-white rounded-lg shadow p-6">
        <div class="text-sm text-gray-500">配信停止者数</div>
        <div class="text-3xl font-bold text-red-500 mt-1">{{ number_format($stats['total_unsubscribes']) }}</div>
        <div class="text-xs text-gray-400 mt-1">件</div>
    </div>
</div>

<div class="bg-white rounded-lg shadow">
    <div class="px-6 py-4 border-b font-semibold text-gray-700">直近の配信</div>
    <table class="w-full text-sm">
        <thead class="bg-gray-50 text-gray-500">
            <tr>
                <th class="text-left px-6 py-3">件名</th>
                <th class="text-left px-6 py-3">ステータス</th>
                <th class="text-right px-6 py-3">送信数</th>
                <th class="text-right px-6 py-3">開封率</th>
                <th class="text-left px-6 py-3">送信日時</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
            @forelse($recentCampaigns as $campaign)
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-3">
                    <a href="{{ route('campaigns.show', $campaign) }}" class="text-indigo-600 hover:underline">
                        {{ $campaign->subject }}
                    </a>
                </td>
                <td class="px-6 py-3">
                    @php
                        $statusLabel = ['draft'=>'下書き','sending'=>'送信中','completed'=>'完了','failed'=>'失敗'];
                        $statusColor = ['draft'=>'gray','sending'=>'blue','completed'=>'green','failed'=>'red'];
                        $s = $campaign->status->value;
                    @endphp
                    <span class="px-2 py-1 rounded-full text-xs bg-{{ $statusColor[$s] ?? 'gray' }}-100 text-{{ $statusColor[$s] ?? 'gray' }}-700">
                        {{ $statusLabel[$s] ?? $s }}
                    </span>
                </td>
                <td class="px-6 py-3 text-right">{{ number_format($campaign->sent_count) }}</td>
                <td class="px-6 py-3 text-right">
                    @if($campaign->sent_count > 0)
                        {{ round($campaign->opened_count / $campaign->sent_count * 100, 1) }}%
                    @else
                        -
                    @endif
                </td>
                <td class="px-6 py-3 text-gray-500">{{ $campaign->sent_at?->format('Y/m/d H:i') ?? '-' }}</td>
            </tr>
            @empty
            <tr><td colspan="5" class="px-6 py-8 text-center text-gray-400">配信履歴がありません</td></tr>
            @endforelse
        </tbody>
    </table>
</div>
@endsection
