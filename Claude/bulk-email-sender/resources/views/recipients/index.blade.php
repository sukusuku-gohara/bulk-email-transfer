@extends('layouts.app')
@section('title', '配信リスト')

@section('content')
<div class="flex justify-between items-center mb-4">
    <h2 class="text-xl font-semibold text-gray-700">配信リスト（{{ number_format($recipients->total()) }}件）</h2>
    <form method="POST" action="{{ route('recipients.sync') }}">
        @csrf
        <button type="submit" class="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700">
            スプレッドシートから同期
        </button>
    </form>
</div>

<div class="bg-white rounded-lg shadow">
    <table class="w-full text-sm">
        <thead class="bg-gray-50 text-gray-500">
            <tr>
                <th class="text-left px-6 py-3">メールアドレス</th>
                <th class="text-left px-6 py-3">名前</th>
                <th class="text-left px-6 py-3">ステータス</th>
                <th class="text-right px-6 py-3">バウンス数</th>
                <th class="text-left px-6 py-3">最終同期</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
            @forelse($recipients as $recipient)
            <tr class="hover:bg-gray-50 {{ !$recipient->is_active ? 'opacity-50' : '' }}">
                <td class="px-6 py-3">{{ $recipient->email }}</td>
                <td class="px-6 py-3 text-gray-500">{{ $recipient->name ?? '-' }}</td>
                <td class="px-6 py-3">
                    @if($recipient->is_active)
                        <span class="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">有効</span>
                    @else
                        <span class="px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">無効</span>
                    @endif
                </td>
                <td class="px-6 py-3 text-right">{{ $recipient->bounce_count }}</td>
                <td class="px-6 py-3 text-gray-500">{{ $recipient->synced_at?->format('Y/m/d H:i') ?? '-' }}</td>
            </tr>
            @empty
            <tr><td colspan="5" class="px-6 py-8 text-center text-gray-400">配信リストがありません</td></tr>
            @endforelse
        </tbody>
    </table>
    @if($recipients->hasPages())
    <div class="px-6 py-4 border-t">{{ $recipients->links() }}</div>
    @endif
</div>
@endsection
