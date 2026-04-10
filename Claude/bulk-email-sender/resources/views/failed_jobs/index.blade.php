@extends('layouts.app')

@section('title', '失敗ジョブ履歴')

@section('content')
<div class="flex items-center justify-between mb-6">
    <h2 class="text-xl font-semibold text-gray-700">失敗ジョブ履歴</h2>
    @if($failedJobs->total() > 0)
    <form method="POST" action="{{ route('failed-jobs.destroy-all') }}"
          onsubmit="return confirm('すべての失敗履歴を削除しますか？')">
        @csrf
        @method('DELETE')
        <button type="submit" class="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700">
            すべて削除
        </button>
    </form>
    @endif
</div>

@if($failedJobs->total() === 0)
    <div class="bg-white rounded shadow p-8 text-center text-gray-500">
        失敗したジョブはありません
    </div>
@else
<div class="bg-white rounded shadow overflow-hidden">
    <table class="min-w-full text-sm">
        <thead class="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
                <th class="px-4 py-3 text-left">ID</th>
                <th class="px-4 py-3 text-left">ジョブ</th>
                <th class="px-4 py-3 text-left">失敗日時</th>
                <th class="px-4 py-3 text-left">エラー</th>
                <th class="px-4 py-3 text-left">操作</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
            @foreach($failedJobs as $job)
            @php
                $payload = json_decode($job->payload, true);
                $jobName = $payload['displayName'] ?? $job->queue;
                $exception = substr($job->exception, 0, 100);
            @endphp
            <tr>
                <td class="px-4 py-3 text-gray-500">{{ $job->id }}</td>
                <td class="px-4 py-3 font-mono text-xs">{{ class_basename($jobName) }}</td>
                <td class="px-4 py-3 text-gray-500">{{ $job->failed_at }}</td>
                <td class="px-4 py-3 text-red-600 text-xs">{{ $exception }}...</td>
                <td class="px-4 py-3">
                    <form method="POST" action="{{ route('failed-jobs.destroy', $job->id) }}"
                          onsubmit="return confirm('削除しますか？')">
                        @csrf
                        @method('DELETE')
                        <button type="submit" class="text-red-500 hover:text-red-700 text-xs">削除</button>
                    </form>
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>
    <div class="px-4 py-3">{{ $failedJobs->links() }}</div>
</div>
@endif
@endsection
