@extends('layouts.app')
@section('title', '配信停止者一覧')

@section('content')
<div class="mb-4">
    <h2 class="text-xl font-semibold text-gray-700">配信停止者一覧（{{ number_format($unsubscribes->total()) }}件）</h2>
</div>

<div class="bg-white rounded-lg shadow">
    <table class="w-full text-sm">
        <thead class="bg-gray-50 text-gray-500">
            <tr>
                <th class="text-left px-6 py-3">メールアドレス</th>
                <th class="text-left px-6 py-3">停止日時</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
            @forelse($unsubscribes as $unsubscribe)
            <tr>
                <td class="px-6 py-3">{{ $unsubscribe->email }}</td>
                <td class="px-6 py-3 text-gray-500">{{ $unsubscribe->unsubscribed_at?->format('Y/m/d H:i') }}</td>
            </tr>
            @empty
            <tr><td colspan="2" class="px-6 py-8 text-center text-gray-400">配信停止者はいません</td></tr>
            @endforelse
        </tbody>
    </table>
    @if($unsubscribes->hasPages())
    <div class="px-6 py-4 border-t">{{ $unsubscribes->links() }}</div>
    @endif
</div>
@endsection
