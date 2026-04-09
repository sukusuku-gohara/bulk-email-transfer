@extends('layouts.app')
@section('title', '配信履歴')

@section('content')
<div class="flex justify-between items-center mb-4">
    <h2 class="text-xl font-semibold text-gray-700">配信履歴</h2>
    <a href="{{ route('campaigns.create') }}" class="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700">
        + 新規メール作成
    </a>
</div>

<div class="bg-white rounded-lg shadow">
    <table class="w-full text-sm">
        <thead class="bg-gray-50 text-gray-500">
            <tr>
                <th class="text-left px-6 py-3">件名</th>
                <th class="text-left px-6 py-3">ステータス</th>
                <th class="text-right px-6 py-3">対象</th>
                <th class="text-right px-6 py-3">送信済</th>
                <th class="text-right px-6 py-3">開封数</th>
                <th class="text-right px-6 py-3">開封率</th>
                <th class="text-left px-6 py-3">送信日時</th>
                <th class="px-6 py-3"></th>
            </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
            @forelse($campaigns as $campaign)
            @php
                $statusLabel = ['draft'=>'下書き','sending'=>'送信中','completed'=>'完了','failed'=>'失敗'];
                $statusColor = ['draft'=>'gray','sending'=>'blue','completed'=>'green','failed'=>'red'];
                $s = $campaign->status->value;
                $openRate = $campaign->sent_count > 0 ? round($campaign->opened_count / $campaign->sent_count * 100, 1) : 0;
            @endphp
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-3 font-medium">{{ $campaign->subject }}</td>
                <td class="px-6 py-3">
                    <span class="px-2 py-1 rounded-full text-xs bg-{{ $statusColor[$s] ?? 'gray' }}-100 text-{{ $statusColor[$s] ?? 'gray' }}-700">
                        {{ $statusLabel[$s] ?? $s }}
                    </span>
                </td>
                <td class="px-6 py-3 text-right">{{ number_format($campaign->total_count) }}</td>
                <td class="px-6 py-3 text-right">{{ number_format($campaign->sent_count) }}</td>
                <td class="px-6 py-3 text-right">{{ number_format($campaign->opened_count) }}</td>
                <td class="px-6 py-3 text-right">
                    <div class="flex items-center justify-end gap-2">
                        <div class="w-16 bg-gray-200 rounded-full h-1.5">
                            <div class="bg-indigo-600 h-1.5 rounded-full" style="width: {{ min($openRate, 100) }}%"></div>
                        </div>
                        <span>{{ $openRate }}%</span>
                    </div>
                </td>
                <td class="px-6 py-3 text-gray-500">{{ $campaign->sent_at?->format('Y/m/d H:i') ?? '-' }}</td>
                <td class="px-6 py-3">
                    <a href="{{ route('campaigns.show', $campaign) }}" class="text-indigo-600 hover:underline text-xs">詳細</a>
                </td>
            </tr>
            @empty
            <tr><td colspan="8" class="px-6 py-8 text-center text-gray-400">配信履歴がありません</td></tr>
            @endforelse
        </tbody>
    </table>
    @if($campaigns->hasPages())
    <div class="px-6 py-4 border-t">{{ $campaigns->links() }}</div>
    @endif
</div>
@endsection
